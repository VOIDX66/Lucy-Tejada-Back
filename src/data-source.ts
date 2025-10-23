import { DataSource } from 'typeorm';
import * as path from 'path';
import { config } from 'dotenv';

// Detectar entorno
const envFile =
  process.env.NODE_ENV === 'migrations' ? '.env.migrations' : '.env';
config({ path: path.resolve(__dirname, `../${envFile}`) });

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DB_URL,
  ssl: { rejectUnauthorized: false },
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: ['error', 'warn'], // útil para ver alteraciones
});
