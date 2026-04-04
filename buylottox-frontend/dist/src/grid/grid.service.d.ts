import { PrismaService } from '../prisma/prisma.service';
import { BuySubTicketsDto } from './dto/buy-subtickets.dto';
export declare class GridService {
    private prisma;
    constructor(prisma: PrismaService);
    getActiveGrid(): Promise<{
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
        totalMainNumbers: number;
        subTicketsPerMain: number;
        winningAmountPerSubTicket: number;
    }>;
    getGridNumbers(gridId: string): Promise<{
        id: string;
        number: number;
        isSoldOut: boolean;
        soldCount: number;
        remainingCount: number;
    }[]>;
    getSubTickets(gridId: string, number: number): Promise<{
        gridNumberId: string;
        number: number;
        isSoldOut: boolean;
        subTickets: {
            id: string;
            subIndex: number;
            status: import(".prisma/client").$Enums.SubTicketStatus;
            soldAt: Date;
        }[];
    }>;
    buySubTickets(gridId: string, userId: string, body: BuySubTicketsDto): Promise<{
        message: string;
        purchaseId: string;
        gridId: string;
        totalSubTickets: number;
        totalAmount: number;
    }>;
}
