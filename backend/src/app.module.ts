
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';
import { AuthController } from './auth/auth.controller';
import { LessonsController } from './lessons/lessons.controller';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'super-secret-key-123',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController, LessonsController],
  providers: [PrismaService],
})
export class AppModule {}
