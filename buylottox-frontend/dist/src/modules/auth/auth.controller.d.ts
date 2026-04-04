import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    register(body: {
        name: string;
        mobileNumber: string;
        password: string;
    }): Promise<{
        accessToken: string;
        user: {
            id: string;
            name: string;
            mobileNumber: string;
            role: import(".prisma/client").$Enums.Role;
            status: import(".prisma/client").$Enums.UserStatus;
        };
    }>;
    login(body: {
        mobileNumber: string;
        password: string;
    }): Promise<{
        accessToken: string;
        user: {
            id: string;
            name: string;
            mobileNumber: string;
            role: import(".prisma/client").$Enums.Role;
            status: "ACTIVE";
        };
    }>;
    sendOtp(body: {
        mobileNumber: string;
    }): Promise<{
        message: string;
    }>;
    verifyOtp(body: {
        mobileNumber: string;
        otp: string;
    }): Promise<{
        message: string;
    }>;
    me(req: any): Promise<{
        id: string;
        name: string;
        mobileNumber: string;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
    }>;
}
