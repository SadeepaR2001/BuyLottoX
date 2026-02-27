import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../../prisma/prisma.service'
import type { Role } from '@prisma/client'

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) {}

  async register(name: string, email: string, password: string) {
    const exists = await this.prisma.user.findUnique({ where: { email } })
    if (exists) throw new BadRequestException('Email already registered')
    const hash = await bcrypt.hash(password, 10)
    const user = await this.prisma.user.create({
      data: { name, email, password: hash },
      select: { id: true, name: true, email: true, role: true },
    })
    return { accessToken: this.sign(user.id, user.email, user.role, user.name), user }
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) throw new UnauthorizedException('Invalid email or password')
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) throw new UnauthorizedException('Invalid email or password')
    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role }
    return { accessToken: this.sign(user.id, user.email, user.role, user.name), user: safeUser }
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })
  }

  private sign(sub: string, email: string, role: Role, name: string) {
    const secret = this.config.get<string>('JWT_ACCESS_SECRET') || 'dev_secret'
    const expiresIn = this.config.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m'
    return this.jwt.sign({ sub, email, role, name }, { secret, expiresIn })
  }
}
