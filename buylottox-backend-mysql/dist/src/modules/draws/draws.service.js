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
exports.DrawsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let DrawsService = class DrawsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getActive() {
        return this.prisma.draw.findFirst({ where: { status: client_1.DrawStatus.OPEN }, orderBy: { drawAt: 'asc' } });
    }
    listAll() {
        return this.prisma.draw.findMany({ orderBy: { createdAt: 'desc' } });
    }
    async createDraw(title, drawAtIso) {
        const drawAt = new Date(drawAtIso);
        if (Number.isNaN(drawAt.getTime()))
            throw new common_1.BadRequestException('Invalid drawAt');
        await this.prisma.draw.updateMany({ where: { status: client_1.DrawStatus.OPEN }, data: { status: client_1.DrawStatus.CLOSED } });
        return this.prisma.draw.create({ data: { title, drawAt, status: client_1.DrawStatus.OPEN } });
    }
    async closeDraw(id, winningNumbers) {
        const nums = winningNumbers.split(',').map(s => s.trim()).filter(Boolean);
        if (nums.length === 0)
            throw new common_1.BadRequestException('winningNumbers required');
        const draw = await this.prisma.draw.update({
            where: { id },
            data: { status: client_1.DrawStatus.CLOSED, winningNumbers: nums.join(',') },
        });
        await this.prisma.ticket.updateMany({ where: { drawId: id }, data: { status: 'LOST' } });
        return draw;
    }
};
exports.DrawsService = DrawsService;
exports.DrawsService = DrawsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DrawsService);
//# sourceMappingURL=draws.service.js.map