import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import type { Role } from '@prisma/client'
import { UserStatus } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { SmsService } from '../sms/sms.service'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private smsService: SmsService
  ) {}

  async register(name: string, mobileNumber: string, password: string) {
    const exists = await this.prisma.user.findUnique({ where: { mobileNumber } })
    if (exists) throw new BadRequestException('mobileNumber already registered')

    const hash = await bcrypt.hash(password, 10)
    const user = await this.prisma.user.create({
      data: { name, mobileNumber, password: hash },
      select: { id: true, name: true, mobileNumber: true, role: true, status: true },
    })

    return {
      accessToken: this.sign(user.id, user.mobileNumber, user.role, user.name),
      user,
    }
  }

  async login(mobileNumber: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { mobileNumber } })
    if (!user) throw new UnauthorizedException('Invalid mobileNumber or password')

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('Your account is blocked')
    }

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) throw new UnauthorizedException('Invalid mobileNumber or password')

    const safeUser = {
      id: user.id,
      name: user.name,
      mobileNumber: user.mobileNumber,
      role: user.role,
      status: user.status,
    }

    return {
      accessToken: this.sign(user.id, user.mobileNumber, user.role, user.name),
      user: safeUser,
    }
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, mobileNumber: true, role: true, status: true, createdAt: true },
    })
  }

  private sign(sub: string, mobileNumber: string, role: Role, name: string) {
    const secret = this.config.get<string>('JWT_ACCESS_SECRET') || 'dev_secret'
    const expiresIn = this.config.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m'
    return this.jwt.sign({ sub, mobileNumber, role, name }, { secret, expiresIn })
  }
async sendOtp(mobileNumber: string) {
  if (!mobileNumber) {
    throw new BadRequestException('Mobile number is required')
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  await this.prisma.mobileOtp.create({
    data: {
      mobileNumber,
      code,
      expiresAt,
      verified: false,
    },
  })

  await this.smsService.sendSms(
    mobileNumber,
    `Your BuyLottoX OTP is ${code}. Valid for 5 minutes.`,
  )

  return {
    message: 'OTP sent successfully',
  }
}
async verifyOtp(mobileNumber: string, code: string) {
  const otp = await this.prisma.mobileOtp.findFirst({
    where: {
      mobileNumber,
      code,
      verified: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  if (!otp) {
    throw new BadRequestException('Invalid OTP')
  }

  if (otp.expiresAt < new Date()) {
    throw new BadRequestException('OTP expired')
  }

  await this.prisma.mobileOtp.update({
    where: { id: otp.id },
    data: { verified: true },
  })

  await this.prisma.user.update({
    where: { mobileNumber },
    data: { isMobileVerified: true },
  })

  return {
    message: 'Mobile number verified successfully',
  }
}
}
