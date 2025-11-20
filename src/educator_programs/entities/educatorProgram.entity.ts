import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Educator } from '../../educators/entities/educator.entity';
import { Program } from '../../programs/entities/program.entity';

@Entity('educator_programs')
export class EducatorProgram {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  educator_id: string;

  @Column({ type: 'uuid' })
  program_id: string;

  // -----------------------------
  //   RELACIONES (Opcionales pero recomendadas)
  // -----------------------------
  @ManyToOne(() => Educator, (educator) => educator.programs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'educator_id' })
  educator: Educator;

  @ManyToOne(() => Program, (program) => program.educatorPrograms, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'program_id' })
  program: Program;
}
