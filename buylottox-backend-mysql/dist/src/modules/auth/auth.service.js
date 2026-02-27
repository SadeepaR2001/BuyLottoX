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
const prisma_service_1 = require("../../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, jwt, config) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
    }
    async register(name, email, password) {
        const exists = await this.prisma.user.findUnique({ where: { email } });
        if (exists)
            throw new common_1.BadRequestException('Email already registered');
        const hash = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: { name, email, password: hash },
            select: { id: true, name: true, email: true, role: true },
        });
        return { accessToken: this.sign(user.id, user.email, user.role, user.name), user };
    }
    async login(email, password) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid email or password');
        const ok = await bcrypt.compare(password, user.password);
        if (!ok)
            throw new common_1.UnauthorizedException('Invalid email or password');
        const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
        return { accessToken: this.sign(user.id, user.email, user.role, user.name), user: safeUser };
    }
    async me(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });
    }
    sign(sub, email, role, name) {
        const secret = this.config.get('JWT_ACCESS_SECRET') || 'dev_secret';
        const expiresIn = this.config.get('JWT_ACCESS_EXPIRES_IN') || '15m';
        return this.jwt.sign({ sub, email, role, name }, { secret, expiresIn });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, jwt_1.JwtService, config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map