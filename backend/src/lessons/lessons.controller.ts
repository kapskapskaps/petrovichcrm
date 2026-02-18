
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('lessons')
@UseGuards(AuthGuard)
export class LessonsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll(@Request() req: any) {
    // Using type assertion to bypass missing model property errors on the PrismaService instance.
    return (this.prisma as any).lesson.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  @Post()
  async create(@Request() req: any, @Body() data: any) {
    // Извлекаем id, если он пришел с фронта (для совместимости), но БД сгенерирует свой
    const { id, ...lessonData } = data;
    // Using type assertion to bypass missing model property errors on the PrismaService instance.
    return (this.prisma as any).lesson.create({
      data: {
        ...lessonData,
        userId: req.user.userId
      }
    });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Request() req: any, @Body() data: any) {
    // Using type assertion to bypass missing model property errors on the PrismaService instance.
    return (this.prisma as any).lesson.update({
      where: { id, userId: req.user.userId },
      data
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    // Using type assertion to bypass missing model property errors on the PrismaService instance.
    return (this.prisma as any).lesson.delete({
      where: { id, userId: req.user.userId }
    });
  }
}
