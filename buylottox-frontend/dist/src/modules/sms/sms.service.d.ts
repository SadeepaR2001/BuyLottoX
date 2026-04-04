import { ConfigService } from '@nestjs/config';
export declare class SmsService {
    private readonly config;
    constructor(config: ConfigService);
    sendSms(mobileNumber: string, message: string): Promise<any>;
    private normalizeSriLankanNumber;
}
