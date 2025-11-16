import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { EducatorsModule } from 'src/educators/educators.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [UsersModule, EducatorsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
