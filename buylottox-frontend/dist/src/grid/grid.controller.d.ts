import { BuySubTicketsDto } from './dto/buy-subtickets.dto';
import { GridService } from './grid.service';
export declare class GridController {
    private readonly gridService;
    constructor(gridService: GridService);
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
    getSubTickets(gridId: string, number: string): Promise<{
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
    buySubTickets(gridId: string, req: any, body: BuySubTicketsDto): Promise<{
        message: string;
        purchaseId: string;
        gridId: string;
        totalSubTickets: number;
        totalAmount: number;
    }>;
}
