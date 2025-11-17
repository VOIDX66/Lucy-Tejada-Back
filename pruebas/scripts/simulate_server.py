# simulate_server.py
"""
Simulador de horarios (versión A)
Se preserva la estructura original y se añade afinidad horaria por grupo:
si un grupo tiene clase un día a una franja, se preferirá esa misma franja
en sus otras clases semanales cuando sea posible.
"""

import random
import uuid
from collections import defaultdict, deque
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
import uvicorn

# =============================
# CONFIGURACIÓN
# =============================
NUM_ESTUDIANTES = 100
MAX_ESTUDIANTES_POR_GRUPO = 20
CLASES_POR_SEMANA = 2

# límites para evitar saturación diaria (aplicados por docente y por grupo)
MAX_HORAS_POR_DIA_POR_DOCENTE = 4
MAX_HORAS_POR_DIA_POR_GRUPO = 3

PROGRAMAS = [
    {"name": "Danza", "capacity": 100},
    {"name": "Teatro", "capacity": 80},
    {"name": "Coros", "capacity": 60},
    {"name": "Cuerdas Pulsadas", "capacity": 60},
    {"name": "Cuerdas Sinfónicas", "capacity": 60},
    {"name": "Banda Músico Marcial", "capacity": 80},
    {"name": "Artes Visuales", "capacity": 80}
]

AULAS = [
    {"name": "Aula Danza 1", "capacity": 25, "type": "DANZA"},
    {"name": "Aula Danza 2", "capacity": 25, "type": "DANZA"},
    {"name": "Aula Música 1", "capacity": 20, "type": "MUSICA"},
    {"name": "Aula Música 2", "capacity": 20, "type": "MUSICA"},
    {"name": "Teatrino 1", "capacity": 40, "type": "TEATRO"},
    {"name": "Teatrino 2", "capacity": 40, "type": "TEATRO"},
    {"name": "Sala Artes 1", "capacity": 18, "type": "ARTES_VISUALES"},
    {"name": "Sala Artes 2", "capacity": 18, "type": "ARTES_VISUALES"},
    {"name": "Aula Multifuncional", "capacity": 35, "type": "GENERAL"}
]

# Educadores: 2 por especialidad; agregué Banda Músico Marcial
EDUCADORES = [
    # Danza
    {"name": "María López", "specialization": "Danza"},
    {"name": "Carlos Pérez", "specialization": "Danza"},
    # Teatro
    {"name": "Juan Ramírez", "specialization": "Teatro"},
    {"name": "Ana Torres", "specialization": "Teatro"},
    # Coros
    {"name": "Laura Gómez", "specialization": "Coros"},
    {"name": "Miguel Fernández", "specialization": "Coros"},
    # Cuerdas
    {"name": "Andrés Muñoz", "specialization": "Cuerdas"},
    {"name": "Sofía Rojas", "specialization": "Cuerdas"},
    # Artes Visuales
    {"name": "Paula Restrepo", "specialization": "Artes Visuales"},
    {"name": "Diego Sánchez", "specialization": "Artes Visuales"},
    # Banda Músico Marcial (nuevos)
    {"name": "Roberto Bedoya", "specialization": "Banda Músico Marcial"},
    {"name": "Juliana Mesa", "specialization": "Banda Músico Marcial"},
]

# Mapeo explícito programa -> tipos de aula permitidos (lista ordenada por preferencia)
MAPA_AULAS = {
    "Danza": ["DANZA", "GENERAL"],
    "Teatro": ["TEATRO", "GENERAL"],
    "Coros": ["MUSICA", "GENERAL"],
    "Cuerdas Pulsadas": ["MUSICA", "GENERAL"],
    "Cuerdas Sinfónicas": ["MUSICA", "GENERAL"],
    "Banda Músico Marcial": ["MUSICA", "GENERAL"],
    "Artes Visuales": ["ARTES_VISUALES", "GENERAL"]
}

DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
HORARIOS = [("08:00", "10:00"), ("10:00", "12:00"), ("13:00", "15:00"),
            ("15:00", "17:00"), ("17:00", "18:00")]

# =============================
# INICIALIZAR APP
# =============================
app = FastAPI()
templates = Jinja2Templates(directory="templates")

# =============================
# AUX: generar estudiantes/grupos
# =============================
def generar_estudiantes():
    estudiantes = []
    for i in range(NUM_ESTUDIANTES):
        gender = random.choice(["FEMALE", "MALE"])
        prog = random.choices(PROGRAMAS, weights=[p["capacity"] for p in PROGRAMAS])[0]
        estudiantes.append({
            "id": str(uuid.uuid4()),
            "name": f"Estudiante{i+1}",
            "gender": gender,
            "program": prog["name"]
        })
    return estudiantes

def _docentes_validos_para_programa(program_name):
    prog_low = program_name.lower()
    # coincidencias exactas por palabra clave o por inclusión robusta
    encontrados = [d for d in EDUCADORES if d["specialization"].lower() == prog_low]
    if not encontrados:
        encontrados = [d for d in EDUCADORES if d["specialization"].lower() in prog_low or prog_low in d["specialization"].lower()]
    if not encontrados:
        # as fallback, buscar por token intersection
        prog_tokens = set(program_name.lower().split())
        for d in EDUCADORES:
            if prog_tokens & set(d["specialization"].lower().split()):
                encontrados.append(d)
    return encontrados if encontrados else EDUCADORES[:]

def crear_grupos():
    grupos = []
    for prog in PROGRAMAS:
        num_grupos = max(1, prog["capacity"] // MAX_ESTUDIANTES_POR_GRUPO)
        docentes_validos = _docentes_validos_para_programa(prog["name"])
        # round-robin among valid teachers
        rr = deque(docentes_validos)
        for g in range(num_grupos):
            docente = rr[0]
            rr.rotate(-1)
            grupos.append({
                "id": str(uuid.uuid4()),
                "program": prog["name"],
                "name": f"{prog['name']} Grupo {g+1}",
                "educador": docente["name"],
                "estudiantes": [],
                "estado": "ABIERTO",
                "horarios": [],
                "sobrecupo": False
            })
    return grupos

def asignar_estudiantes_a_grupos(estudiantes, grupos):
    for est in estudiantes:
        posibles = [g for g in grupos if g["program"] == est["program"] and len(g["estudiantes"]) < MAX_ESTUDIANTES_POR_GRUPO]
        if posibles:
            grupo = random.choice(posibles)
            grupo["estudiantes"].append(est["name"])
            est["grupo"] = grupo["name"]
            if len(grupo["estudiantes"]) >= MAX_ESTUDIANTES_POR_GRUPO:
                grupo["estado"] = "CERRADO"
        else:
            est["grupo"] = "SIN GRUPO"

# =============================
# SCORING CANDIDATO (ACTUALIZADO)
# =============================
def score_candidato(c, uso_docente_por_dia, uso_grupo_por_dia, prioridad_aula_tipo, horarios_existentes_grupo):
    """
    Menor score = mejor candidato.
    Penalizaciones:
      - Aula GENERAL más penalizada (si prioridad_aula_tipo es True favorece aula específica)
      - Docente con más horas ese día penaliza
      - Grupo con más horas ese día penaliza
    Además se incluye afinidad horaria con horarios_existentes_grupo:
      - si el candidato usa la misma franja que ya tiene el grupo -> gran bonificación
      - si es horario cercano -> pequeña penalización en proporción a la distancia (índice)
    """
    score = 0
    if c["aula_type"] == "GENERAL":
        score += 3

    # docente y grupo load penalty
    score += uso_docente_por_dia[c["docente"]][c["dia"]] * 2
    score += uso_grupo_por_dia[c["grupo"]][c["dia"]] * 2

    # Afinidad horaria: favorece repetir la MISMA franja para el grupo
    if horarios_existentes_grupo:
        # construir lista de tuplas de horas previas
        horas_previas = [(h["hora_inicio"], h["hora_fin"]) for h in horarios_existentes_grupo]

        # candidato.hora es una tupla (inicio, fin)
        if c["hora"] in horas_previas:
            score -= 5  # fuerte incentivo para repetir exactamente la franja
        else:
            # medir distancia mínima en índices de HORARIOS
            try:
                idx_actual = HORARIOS.index(c["hora"])
                distancias = []
                for h in horas_previas:
                    idx_prev = HORARIOS.index(h)
                    distancias.append(abs(idx_actual - idx_prev))
                if distancias:
                    dist_min = min(distancias)
                    # penalización proporcional a la distancia (1 → pequeña, 2+ → mayor)
                    score += dist_min * 0.8
            except ValueError:
                # si por alguna razón no encuentra el horario en HORARIOS (defensivo)
                score += 1

    # if the aula type is preferred reduce score slightly
    if prioridad_aula_tipo and c.get("preferred", False):
        score -= 1

    # small randomness to break ties deterministically but varied
    score += random.random() * 0.1
    return score

# =============================
# ASIGNACIÓN EN RONDAS (justa)
# =============================
def asignar_horarios_final(grupos):
    # ocupaciones
    ocupacion_aulas = defaultdict(set)      # aula_name -> set((dia,hora))
    ocupacion_docentes = defaultdict(set)   # docente -> set((dia,hora))
    uso_docente_por_dia = defaultdict(lambda: defaultdict(int))  # docente -> dia -> count
    uso_grupo_por_dia = defaultdict(lambda: defaultdict(int))    # grupo_name -> dia -> count

    # para round-robin: crear lista rotativa de grupos (podemos randomizar inicio)
    grupos_order = grupos[:]  # preserve list structure
    random.shuffle(grupos_order)

    # intentamos por rondas: en cada ronda intentamos asignar 1 clase a cada grupo
    for ronda in range(CLASES_POR_SEMANA):
        # rotar el orden para que ningún programa tenga ventaja constante
        random.shuffle(grupos_order)
        for g in grupos_order:
            # si grupo ya tiene suficientes horarios saltamos
            if sum(1 for h in g["horarios"]) >= CLASES_POR_SEMANA:
                continue

            candidato_mejor = None
            candidatos = []

            tipos_permitidos = MAPA_AULAS.get(g["program"], ["GENERAL"])
            # aulas válidas (manteniendo preferencia ordenada: primero tipos_permitidos then GENERAL)
            aulas_validas = [a for a in AULAS if a["type"] in tipos_permitidos or a["type"] == "GENERAL"]

            # generar candidatos válidos
            for dia in DIAS_SEMANA:
                # limitar por grupo por día
                if uso_grupo_por_dia[g["name"]][dia] >= MAX_HORAS_POR_DIA_POR_GRUPO:
                    continue
                for hora in HORARIOS:
                    # candidato = (dia, hora, aula) si aula y docente libres en ese bloque
                    for aula in aulas_validas:
                        if (dia, hora) in ocupacion_aulas[aula["name"]]:
                            continue
                        if (dia, hora) in ocupacion_docentes[g["educador"]]:
                            continue
                        if uso_docente_por_dia[g["educador"]][dia] >= MAX_HORAS_POR_DIA_POR_DOCENTE:
                            continue
                        # build candidate (note: incluye 'hora' tuple for affinity check)
                        cand = {
                            "dia": dia,
                            "hora": hora,
                            "aula": aula["name"],
                            "aula_type": aula["type"],
                            "docente": g["educador"],
                            "grupo": g["name"],
                            "preferred": aula["type"] in tipos_permitidos  # prefer specific aulas
                        }
                        candidatos.append(cand)

            if not candidatos:
                # no hay opciones en esta ronda para este grupo
                # lo dejamos para la siguiente ronda; si al final ninguna ronda lo asigna quedará PARCIAL
                continue

            # escoger mejor candidato por score (IMPORTANTE: pasamos los horarios existentes del grupo)
            candidatos.sort(
                key=lambda c: score_candidato(
                    c,
                    uso_docente_por_dia,
                    uso_grupo_por_dia,
                    prioridad_aula_tipo=True,
                    horarios_existentes_grupo=g["horarios"]
                )
            )
            candidato_mejor = candidatos[0]

            # asignar
            horario_obj = {
                "dia": candidato_mejor["dia"],
                "hora_inicio": candidato_mejor["hora"][0],
                "hora_fin": candidato_mejor["hora"][1],
                "aula": candidato_mejor["aula"]
            }
            # evitar duplicados
            if horario_obj not in g["horarios"]:
                g["horarios"].append(horario_obj)
                ocupacion_aulas[candidato_mejor["aula"]].add((candidato_mejor["dia"], candidato_mejor["hora"]))
                ocupacion_docentes[g["educador"]].add((candidato_mejor["dia"], candidato_mejor["hora"]))
                uso_docente_por_dia[g["educador"]][candidato_mejor["dia"]] += 1
                uso_grupo_por_dia[g["name"]][candidato_mejor["dia"]] += 1

    # al terminar rondas, marcar parciales
    for g in grupos:
        if len(g["horarios"]) < CLASES_POR_SEMANA:
            g["estado"] = "PARCIAL"

# =============================
# TABLA HORARIOS (estructura para el template)
# =============================
def generar_tabla_horario(grupo):
    tabla = {hora: {dia: [] for dia in DIAS_SEMANA} for hora in HORARIOS}
    for h in grupo.get("horarios", []):
        hora = (h["hora_inicio"], h["hora_fin"])
        dia = h["dia"]
        tabla[hora][dia].append(f"{grupo['program']} ({grupo['name']})")
    return tabla

# =============================
# ENDPOINT
# =============================
@app.get("/", response_class=HTMLResponse)
def ver_horarios(request: Request):
    estudiantes = generar_estudiantes()
    grupos = crear_grupos()
    asignar_estudiantes_a_grupos(estudiantes, grupos)

    # asignación usando algoritmo por rondas (justo) con afinidad horaria incluida
    asignar_horarios_final(grupos)

    tablas_debug = {g["name"]: generar_tabla_horario(g) for g in grupos}
    horarios = HORARIOS
    grupo_obj = {g['name']: g for g in grupos}

    # Debug detallado por consola
    print("\n[simulate_server] RESUMEN DE GENERACIÓN")
    print(f"Estudiantes generados: {len(estudiantes)}")
    print(f"Grupos generados: {len(grupos)}")
    abiertos = sum(1 for g in grupos if g['estado']=='ABIERTO')
    parciales = sum(1 for g in grupos if g['estado']=='PARCIAL')
    cerrados = sum(1 for g in grupos if g['estado']=='CERRADO')
    print(f"Grupos: abiertos={abiertos} parciales={parciales} cerrados={cerrados}\n")

    print("===== GRUPOS y ESTUDIANTES =====")
    for g in grupos:
        print(f"- {g['name']} | Programa: {g['program']} | Estudiantes: {len(g['estudiantes'])} | Estado: {g['estado']}")
    print("================================\n")

    print("===== HORARIOS POR GRUPO =====")
    for g in grupos:
        print(f"\n### {g['name']} ({g['program']}) - Educador: {g['educador']}")
        if not g["horarios"]:
            print("  -> SIN HORARIOS (ningún candidato válido)")
        for h in g["horarios"]:
            print(f"  {h['dia']} {h['hora_inicio']} - {h['hora_fin']} | {h['aula']}")
    print("================================\n")

    print("===== AULAS DISPONIBLES POR PROGRAMA =====")
    for prog in PROGRAMAS:
        tipos = MAPA_AULAS.get(prog["name"], ["GENERAL"])
        aulas_validas = [a["name"] for a in AULAS if a["type"] in tipos or a["type"] == "GENERAL"]
        print(f"{prog['name']} -> {aulas_validas}")
    print("================================\n")

    print("===== DOCENTES VÁLIDOS POR PROGRAMA =====")
    for prog in PROGRAMAS:
        docentes_validos = [d["name"] for d in _docentes_validos_para_programa(prog["name"])]
        print(f"{prog['name']} -> {docentes_validos}")
    print("================================\n")

    return templates.TemplateResponse(
        "horarios.html",
        {
            "request": request,
            "grupos": grupos,
            "tablas_debug": tablas_debug,
            "horarios": horarios,
            "grupo_obj": grupo_obj
        }
    )

# =============================
# EJECUCIÓN
# =============================
if __name__ == "__main__":
    uvicorn.run("simulate_server:app", host="0.0.0.0", port=8000, reload=True)