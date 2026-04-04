"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const sms_service_1 = require("../sms/sms.service");
let AuthService = class AuthService {
    constructor(prisma, jwt, config, smsService) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
        this.smsService = smsService;
    }
    async register(name, mobileNumber, password) {
        const exists = await this.prisma.user.findUnique({ where: { mobileNumber } });
        if (exists)
            throw new common_1.BadRequestException('mobileNumber already registered');
        const hash = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: { name, mobileNumber, password: hash },
            select: { id: true, name: true, mobileNumber: true, role: true, status: true },
        });
        return {
            accessToken: this.sign(user.id, user.mobileNumber, user.role, user.name),
            user,
        };
    }
    async login(mobileNumber, password) {
        const user = await this.prisma.user.findUnique({ where: { mobileNumber } });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid mobileNumber or password');
        if (user.status === client_1.UserStatus.BLOCKED) {
            throw new common_1.UnauthorizedException('Your account is blocked');
        }
        const ok = await bcrypt.compare(password, user.password);
        if (!ok)
            throw new common_1.UnauthorizedException('Invalid mobileNumber or password');
        const safeUser = {
            id: user.id,
            name: user.name,
            mobileNumber: user.mobileNumber,
            role: user.role,
            status: user.status,
        };
        return {
            accessToken: this.sign(user.id, user.mobileNumber, user.role, user.name),
            user: safeUser,
        };
    }
    async me(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, mobileNumber: true, role: true, status: true, createdAt: true },
        });
    }
    sign(sub, mobileNumber, role, name) {
        const secret = this.config.get('JWT_ACCESS_SECRET') || 'dev_secret';
        const expiresIn = this.config.get('JWT_ACCESS_EXPIRES_IN') || '15m';
        return this.jwt.sign({ sub, mobileNumber, role, name }, { secret, expiresIn });
    }
    async sendOtp(mobileNumber) {
        if (!mobileNumber) {
            throw new common_1.BadRequestException('Mobile number is required');
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await this.prisma.mobileOtp.create({
            data: {
                mobileNumber,
                code,
                expiresAt,
                verified: false,
            },
        });
        await this.smsService.sendSms(mobileNumber, `Your BuyLottoX OTP is ${code}. Valid for 5 minutes.`);
        return {
            message: 'OTP sent successfully',
        };
    }
    async verifyOtp(mobileNumber, code) {
        const otp = await this.prisma.mobileOtp.findFirst({
            where: {
                mobileNumber,
                code,
                verified: false,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        if (!otp) {
            throw new common_1.BadRequestException('Invalid OTP');
        }
        if (otp.expiresAt < new Date()) {
            throw new common_1.BadRequestException('OTP expired');
        }
        await this.prisma.mobileOtp.update({
            where: { id: otp.id },
            data: { verified: true },
        });
        await this.prisma.user.update({
            where: { mobileNumber },
            data: { isMobileVerified: true },
        });
        return {
            message: 'Mobile number verified successfully',
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        sms_service_1.SmsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map