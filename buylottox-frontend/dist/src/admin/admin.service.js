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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUsers() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                mobileNumber: true,
                role: true,
                status: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async blockUser(id) {
        return this.prisma.user.update({
            where: { id },
            data: { status: client_1.UserStatus.BLOCKED },
            select: { id: true, name: true, mobileNumber: true, role: true, status: true },
        });
    }
    async unblockUser(id) {
        return this.prisma.user.update({
            where: { id },
            data: { status: client_1.UserStatus.ACTIVE },
            select: { id: true, name: true, mobileNumber: true, role: true, status: true },
        });
    }
    async createAdmin(data) {
        const exists = await this.prisma.user.findUnique({ where: { mobileNumber: data.mobileNumber } });
        if (exists)
            throw new common_1.BadRequestException('mobileNumber already exists');
        const hashed = await bcrypt.hash(data.password, 10);
        return this.prisma.user.create({
            data: {
                name: data.name,
                mobileNumber: data.mobileNumber,
                password: hashed,
                role: client_1.Role.ADMIN,
                status: client_1.UserStatus.ACTIVE,
            },
            select: {
                id: true,
                name: true,
                mobileNumber: true,
                role: true,
                status: true,
                createdAt: true,
            },
        });
    }
    async makeAdmin(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.role === client_1.Role.SUPER_ADMIN) {
            throw new common_1.BadRequestException('Super admin role cannot be changed here');
        }
        return this.prisma.user.update({
            where: { id },
            data: { role: client_1.Role.ADMIN },
            select: { id: true, name: true, mobileNumber: true, role: true, status: true },
        });
    }
    async removeAdmin(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.role === client_1.Role.SUPER_ADMIN) {
            throw new common_1.BadRequestException('Super admin role cannot be changed here');
        }
        return this.prisma.user.update({
            where: { id },
            data: { role: client_1.Role.USER },
            select: { id: true, name: true, mobileNumber: true, role: true, status: true },
        });
    }
    async createGrid(data) {
        const openAt = new Date(data.openAt);
        const closeAt = new Date(data.closeAt);
        if (isNaN(openAt.getTime()) || isNaN(closeAt.getTime())) {
            throw new common_1.BadRequestException('Invalid openAt or closeAt');
        }
        if (closeAt <= openAt) {
            throw new common_1.BadRequestException('closeAt must be greater than openAt');
        }
        const subTicketPrice = Number(data.subTicketPrice);
        const commissionRate = Number(data.commissionRate);
        const totalMainNumbers = 100;
        const subTicketsPerMain = Number(data.subTicketsPerMain);
        if (Number.isNaN(subTicketPrice) || subTicketPrice <= 0) {
            throw new common_1.BadRequestException('subTicketPrice must be a valid positive number');
        }
        if (Number.isNaN(commissionRate) || commissionRate < 0 || commissionRate > 100) {
            throw new common_1.BadRequestException('commissionRate must be between 0 and 100');
        }
        if (Number.isNaN(subTicketsPerMain) || subTicketsPerMain <= 0) {
            throw new common_1.BadRequestException('subTicketsPerMain must be a valid positive integer');
        }
        const totalSubTickets = totalMainNumbers * subTicketsPerMain;
        const totalValue = subTicketPrice * totalSubTickets;
        const commissionAmount = totalValue * (commissionRate / 100);
        const winningPool = totalValue - commissionAmount;
        const winningAmountPerSubTicket = winningPool / subTicketsPerMain;
        const grid = await this.prisma.$transaction(async (tx) => {
            const createdGrid = await tx.grid.create({
                data: {
                    title: data.title,
                    openAt,
                    closeAt,
                    subTicketPrice: new client_1.Prisma.Decimal(subTicketPrice),
                    commissionRate: new client_1.Prisma.Decimal(commissionRate),
                    totalMainNumbers,
                    subTicketsPerMain,
                    totalValue: new client_1.Prisma.Decimal(totalValue),
                    commissionAmount: new client_1.Prisma.Decimal(commissionAmount),
                    winningPool: new client_1.Prisma.Decimal(winningPool),
                    status: client_1.GridStatus.DRAFT,
                },
            });
            for (let number = 0; number < totalMainNumbers; number++) {
                const gridNumber = await tx.gridNumber.create({
                    data: {
                        gridId: createdGrid.id,
                        number,
                        isSoldOut: false,
                    },
                });
                const subTicketsData = [];
                for (let subIndex = 1; subIndex <= subTicketsPerMain; subIndex++) {
                    subTicketsData.push({
                        gridNumberId: gridNumber.id,
                        subIndex,
                        status: client_1.SubTicketStatus.AVAILABLE,
                    });
                }
                await tx.subTicket.createMany({
                    data: subTicketsData,
                });
            }
            return createdGrid;
        });
        return {
            message: 'Grid created successfully',
            grid,
            summary: {
                totalMainNumbers,
                subTicketsPerMain,
                totalSubTickets,
                subTicketPrice,
                totalValue,
                commissionRate,
                commissionAmount,
                winningPool,
                winningAmountPerSubTicket,
            },
        };
    }
    async getGrids() {
        const grids = await this.prisma.grid.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        numbers: true,
                        purchases: true,
                    },
                },
            },
        });
        return grids.map((grid) => ({ id: grid.id,
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
            createdAt: grid.createdAt,
            updatedAt: grid.updatedAt,
            numbersCount: grid._count.numbers,
            purchasesCount: grid._count.purchases,
        }));
    }
    async getGridById(id) {
        const grid = await this.prisma.grid.findUnique({
            where: { id },
            include: {
                numbers: {
                    orderBy: { number: 'asc' },
                    include: {
                        subTickets: {
                            orderBy: { subIndex: 'asc' },
                        },
                    },
                },
            },
        });
        if (!grid)
            throw new common_1.NotFoundException('Grid not found');
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
            createdAt: grid.createdAt,
            updatedAt: grid.updatedAt,
            numbers: grid.numbers.map((num) => ({ id: num.id,
                number: num.number,
                isSoldOut: num.isSoldOut,
                subTickets: num.subTickets.map((sub) => ({ id: sub.id,
                    subIndex: sub.subIndex,
                    status: sub.status,
                    soldAt: sub.soldAt,
                })),
            })),
        };
    }
    async openGrid(id) {
        const grid = await this.prisma.grid.findUnique({ where: { id } });
        if (!grid)
            throw new common_1.NotFoundException('Grid not found');
        if (grid.status === client_1.GridStatus.OPEN) {
            throw new common_1.BadRequestException('Grid is already open');
        }
        return this.prisma.grid.update({
            where: { id },
            data: { status: client_1.GridStatus.OPEN },
        });
    }
    async closeGrid(id) {
        const grid = await this.prisma.grid.findUnique({ where: { id } });
        if (!grid)
            throw new common_1.NotFoundException('Grid not found');
        if (grid.status === client_1.GridStatus.CLOSED) {
            throw new common_1.BadRequestException('Grid is already closed');
        }
        return this.prisma.grid.update({
            where: { id },
            data: { status: client_1.GridStatus.CLOSED },
        });
    }
    async setWinningNumber(id, winningNumber) {
        if (!Number.isInteger(winningNumber) || winningNumber < 0 || winningNumber > 99) {
            throw new common_1.BadRequestException('winningNumber must be between 0 and 99');
        }
        const grid = await this.prisma.grid.findUnique({ where: { id } });
        if (!grid)
            throw new common_1.NotFoundException('Grid not found');
        const winningAmountPerSubTicket = Number(grid.winningPool) / grid.subTicketsPerMain;
        const updated = await this.prisma.grid.update({
            where: { id },
            data: {
                winningNumber,
                status: client_1.GridStatus.COMPLETED,
            },
            select: {
                id: true,
                title: true,
                winningNumber: true,
                winningPool: true,
                subTicketsPerMain: true,
                status: true,
            },
        });
        return {
            ...updated,
            winningPool: Number(updated.winningPool),
            winningAmountPerSubTicket,
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map