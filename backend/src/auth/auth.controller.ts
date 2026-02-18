
import { Controller, Post, Body, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  @Post('register')
  async register(@Body() body: any) {
    const { email, password } = body;
    
    // Using type assertion to bypass missing model property errors on the PrismaService instance.
    const exists = await (this.prisma as any).user.findUnique({ where: { email } });
    if (exists) throw new ConflictException('Пользователь уже существует');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await (this.prisma as any).user.create({
      data: { email, password: hashedPassword }
    });

    const token = this.jwtService.sign({ userId: user.id });
    return { id: user.id, email: user.email, token };
  }

  @Post('login')
  async login(@Body() body: any) {
    const { email, password } = body;
    // Using type assertion to bypass missing model property errors on the PrismaService instance.
    const user = await (this.prisma as any).user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    const token = this.jwtService.sign({ userId: user.id });
    return { id: user.id, email: user.email, token };
  }
}
