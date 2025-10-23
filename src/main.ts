import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración global de prefijo (opcional, pero buena práctica)
  app.setGlobalPrefix('api');

  // Pipes globales para validación y transformación
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades que no están en los DTOs
      forbidNonWhitelisted: true, // Lanza error si hay propiedades extra
      transform: true, // Convierte tipos automáticamente
    }),
  );

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('API Lucy Tejada')
    .setDescription(
      'Documentación interactiva del backend de la Plataforma de Gestión del Centro Cultural Lucy Tejada',
    )
    .setVersion('1.0')
    .addBearerAuth() // Para autenticación con JWT
    .setContact('Equipo de Desarrollo', '', 'soporte@lucytejada.gov.co')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Lucy Tejada API Docs',
    swaggerOptions: { persistAuthorization: true }, // mantiene el token cargado
  });

  // CORS habilitado
  app.enableCors({
    origin: '*', // cambia a tu dominio en producción
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Inicializa el servidor
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Servidor corriendo en http://localhost:${port}`);
  console.log(`Documentación Swagger en http://localhost:${port}/docs`);
}

bootstrap();
