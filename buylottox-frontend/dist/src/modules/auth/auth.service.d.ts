import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsService } from '../sms/sms.service';
export declare class AuthService {
    private prisma;
    private jwt;
    private config;
    private smsService;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService, smsService: SmsService);
    register(name: string, mobileNumber: string, password: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            mobileNumber: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            status: import(".prisma/client").$Enums.UserStatus;
        };
    }>;
    login(mobileNumber: string, password: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            name: string;
            mobileNumber: string;
            role: import(".prisma/client").$Enums.Role;
            status: "ACTIVE";
        };
    }>;
    me(userId: string): Promise<{
        id: string;
        mobileNumber: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
    }>;
    private sign;
    sendOtp(mobileNumber: string): Promise<{
        message: string;
    }>;
    verifyOtp(mobileNumber: string, code: string): Promise<{
        message: string;
    }>;
}
