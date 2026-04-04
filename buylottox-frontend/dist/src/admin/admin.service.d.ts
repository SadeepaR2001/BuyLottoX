import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGridDto } from './dto/create-grid.dto';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getUsers(): Promise<{
        id: string;
        name: string;
        mobileNumber: string;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
    }[]>;
    blockUser(id: string): Promise<{
        id: string;
        name: string;
        mobileNumber: string;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
    }>;
    unblockUser(id: string): Promise<{
        id: string;
        name: string;
        mobileNumber: string;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
    }>;
    createAdmin(data: {
        name: string;
        mobileNumber: string;
        password: string;
    }): Promise<{
        id: string;
        name: string;
        mobileNumber: string;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
    }>;
    makeAdmin(id: string): Promise<{
        id: string;
        name: string;
        mobileNumber: string;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
    }>;
    removeAdmin(id: string): Promise<{
        id: string;
        name: string;
        mobileNumber: string;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
    }>;
    createGrid(data: CreateGridDto): Promise<{
        message: string;
        grid: {
            id: string;
            status: import(".prisma/client").$Enums.GridStatus;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            openAt: Date;
            closeAt: Date;
            subTicketPrice: Prisma.Decimal;
            commissionRate: Prisma.Decimal;
            totalMainNumbers: number;
            subTicketsPerMain: number;
            totalValue: Prisma.Decimal;
            commissionAmount: Prisma.Decimal;
            winningPool: Prisma.Decimal;
            winningNumber: number | null;
        };
        summary: {
            totalMainNumbers: number;
            subTicketsPerMain: number;
            totalSubTickets: number;
            subTicketPrice: number;
            totalValue: number;
            commissionRate: number;
            commissionAmount: number;
            winningPool: number;
            winningAmountPerSubTicket: number;
        };
    }>;
    getGrids(): Promise<{
        id: string;
        title: string;
        openAt: Date;
        closeAt: Date;
        subTicketPrice: number;
        commissionRate: number;
        totalValue: number;
        commissionAmount: number;
        winningPool: number;
        winningNumber: number;
        status: import(".prisma/client").$Enums.GridStatus;
        createdAt: Date;
        updatedAt: Date;
        numbersCount: number;
        purchasesCount: number;
    }[]>;
    getGridById(id: string): Promise<{
        id: string;
        title: string;
        openAt: Date;
        closeAt: Date;
        subTicketPrice: number;
        commissionRate: number;
        totalValue: number;
        commissionAmount: number;
        winningPool: number;
        winningNumber: number;
        status: import(".prisma/client").$Enums.GridStatus;
        createdAt: Date;
        updatedAt: Date;
        numbers: {
            id: string;
            number: number;
            isSoldOut: boolean;
            subTickets: {
                id: string;
                subIndex: number;
                status: import(".prisma/client").$Enums.SubTicketStatus;
                soldAt: Date;
            }[];
        }[];
    }>;
    openGrid(id: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.GridStatus;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        openAt: Date;
        closeAt: Date;
        subTicketPrice: Prisma.Decimal;
        commissionRate: Prisma.Decimal;
        totalMainNumbers: number;
        subTicketsPerMain: number;
        totalValue: Prisma.Decimal;
        commissionAmount: Prisma.Decimal;
        winningPool: Prisma.Decimal;
        winningNumber: number | null;
    }>;
    closeGrid(id: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.GridStatus;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        openAt: Date;
        closeAt: Date;
        subTicketPrice: Prisma.Decimal;
        commissionRate: Prisma.Decimal;
        totalMainNumbers: number;
        subTicketsPerMain: number;
        totalValue: Prisma.Decimal;
        commissionAmount: Prisma.Decimal;
        winningPool: Prisma.Decimal;
        winningNumber: number | null;
    }>;
    setWinningNumber(id: string, winningNumber: number): Promise<{
        winningPool: number;
        winningAmountPerSubTicket: number;
        id: string;
        status: import(".prisma/client").$Enums.GridStatus;
        title: string;
        subTicketsPerMain: number;
        winningNumber: number;
    }>;
}
