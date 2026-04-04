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
exports.GridService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let GridService = class GridService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getActiveGrid() {
        const now = new Date();
        const grid = await this.prisma.grid.findFirst({
            where: {
                status: client_1.GridStatus.OPEN,
                openAt: { lte: now },
                closeAt: { gte: now },
            },
            orderBy: { openAt: 'desc' },
        });
        if (!grid)
            return null;
        return {
            id: grid.id,
            title: grid.title,
            openAt: grid.openAt,
            closeAt: grid.closeAt,
            subTicketPrice: Number(grid.subTicketPrice),
            commissionRate: Number(grid.commissionRate),
            totalValue: Number(grid.totalValue),
            commissionAmount: Number(grid.commissionAmount),
            winningPool: Number(grid.winningPool),
            winningNumber: grid.winningNumber,
            status: grid.status,
            totalMainNumbers: grid.totalMainNumbers,
            subTicketsPerMain: grid.subTicketsPerMain,
            winningAmountPerSubTicket: Number(grid.winningPool) / grid.subTicketsPerMain,
        };
    }
    async getGridNumbers(gridId) {
        const grid = await this.prisma.grid.findUnique({ where: { id: gridId } });
        if (!grid)
            throw new common_1.NotFoundException('Grid not found');
        const numbers = await this.prisma.gridNumber.findMany({
            where: { gridId },
            include: { subTickets: true },
            orderBy: { number: 'asc' },
        });
        return numbers.map((item) => {
            const soldCount = item.subTickets.filter((s) => s.status === client_1.SubTicketStatus.SOLD).length;
            const remainingCount = item.subTickets.filter((s) => s.status === client_1.SubTicketStatus.AVAILABLE).length;
            return {
                id: item.id,
                number: item.number,
                isSoldOut: remainingCount === 0 || item.isSoldOut,
                soldCount,
                remainingCount,
            };
        });
    }
    async getSubTickets(gridId, number) {
        if (!Number.isInteger(number) || number < 0 || number > 99) {
            throw new common_1.BadRequestException('number must be between 0 and 99');
        }
        const gridNumber = await this.prisma.gridNumber.findFirst({
            where: { gridId, number },
            include: { subTickets: { orderBy: { subIndex: 'asc' } } },
        });
        if (!gridNumber)
            throw new common_1.NotFoundException('Grid number not found');
        return {
            gridNumberId: gridNumber.id,
            number: gridNumber.number,
            isSoldOut: gridNumber.isSoldOut,
            subTickets: gridNumber.subTickets.map((sub) => ({
                id: sub.id,
                subIndex: sub.subIndex,
                status: sub.status,
                soldAt: sub.soldAt,
            })),
        };
    }
    async buySubTickets(gridId, userId, body) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.status === client_1.UserStatus.BLOCKED) {
            throw new common_1.BadRequestException('Blocked users cannot buy tickets');
        }
        const grid = await this.prisma.grid.findUnique({ where: { id: gridId } });
        if (!grid)
            throw new common_1.NotFoundException('Grid not found');
        const now = new Date();
        if (grid.status !== client_1.GridStatus.OPEN || now < grid.openAt || now > grid.closeAt) {
            throw new common_1.BadRequestException('Grid is not open for buying');
        }
        return this.prisma.$transaction(async (tx) => {
            const requestedIds = new Set();
            const touchedGridNumberIds = new Set();
            let totalSubTickets = 0;
            for (const selection of body.selections) {
                if (!Number.isInteger(selection.number) || selection.number < 0 || selection.number > 99) {
                    throw new common_1.BadRequestException(`Invalid number ${selection.number}`);
                }
                const gridNumber = await tx.gridNumber.findFirst({
                    where: { gridId, number: selection.number },
                    include: { subTickets: true },
                });
                if (!gridNumber)
                    throw new common_1.BadRequestException(`Number ${selection.number} not found`);
                for (const subIndex of selection.subIndexes) {
                    if (!Number.isInteger(subIndex) || subIndex < 1 || subIndex > grid.subTicketsPerMain) {
                        throw new common_1.BadRequestException(`Invalid subticket ${selection.number}-${subIndex}`);
                    }
                    const subTicket = gridNumber.subTickets.find((s) => s.subIndex === subIndex);
                    if (!subTicket) {
                        throw new common_1.BadRequestException(`Subticket ${selection.number}-${subIndex} not found`);
                    }
                    if (subTicket.status !== client_1.SubTicketStatus.AVAILABLE) {
                        throw new common_1.BadRequestException(`Subticket ${selection.number}-${subIndex} is not available`);
                    }
                    if (requestedIds.has(subTicket.id)) {
                        throw new common_1.BadRequestException(`Duplicate subticket ${selection.number}-${subIndex}`);
                    }
                    requestedIds.add(subTicket.id);
                    touchedGridNumberIds.add(gridNumber.id);
                    totalSubTickets++;
                }
            }
            const totalAmount = new client_1.Prisma.Decimal(Number(grid.subTicketPrice) * totalSubTickets);
            const purchase = await tx.ticketPurchase.create({
                data: {
                    userId,
                    gridId,
                    totalAmount,
                },
            });
            for (const subTicketId of requestedIds) {
                await tx.subTicket.update({
                    where: { id: subTicketId },
                    data: {
                        status: client_1.SubTicketStatus.SOLD,
                        soldAt: new Date(),
                        buyerId: userId,
                        purchaseId: purchase.id,
                    },
                });
            }
            for (const gridNumberId of touchedGridNumberIds) {
                const remaining = await tx.subTicket.count({
                    where: {
                        gridNumberId,
                        status: client_1.SubTicketStatus.AVAILABLE,
                    },
                });
                if (remaining === 0) {
                    await tx.gridNumber.update({
                        where: { id: gridNumberId },
                        data: { isSoldOut: true },
                    });
                }
            }
            return {
                message: 'Tickets purchased successfully',
                purchaseId: purchase.id,
                gridId,
                totalSubTickets,
                totalAmount: Number(totalAmount),
            };
        });
    }
};
exports.GridService = GridService;
exports.GridService = GridService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GridService);
//# sourceMappingURL=grid.service.js.map