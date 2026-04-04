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
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let TicketsService = class TicketsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    myTickets(userId) {
        return this.prisma.ticket.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { draw: true },
        });
    }
    async createTicket(userId, drawId, numbers) {
        const draw = await this.prisma.draw.findUnique({ where: { id: drawId } });
        if (!draw)
            throw new common_1.NotFoundException('Draw not found');
        if (draw.status !== client_1.DrawStatus.OPEN)
            throw new common_1.BadRequestException('Draw is not open');
        const uniq = Array.from(new Set(numbers));
        if (uniq.length !== 6)
            throw new common_1.BadRequestException('Numbers must be 6 unique values');
        return this.prisma.ticket.create({
            data: { userId, drawId, numbers: uniq.sort((a, b) => a - b).join(',') },
        });
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map