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
exports.SmsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let SmsService = class SmsService {
    constructor(config) {
        this.config = config;
    }
    async sendSms(mobileNumber, message) {
        const baseUrl = this.config.get('FITSMS_API_BASE_URL');
        const token = this.config.get('FITSMS_API_TOKEN');
        const senderId = this.config.get('FITSMS_SENDER_ID') || 'BuyLottoX';
        const normalized = this.normalizeSriLankanNumber(mobileNumber);
        try {
            const payload = {
                sender_id: senderId,
                recipient: normalized,
                message,
            };
            console.log('FITSMS URL:', `${baseUrl}/sms/send`);
            console.log('FITSMS payload:', payload);
            const response = await axios_1.default.post(`${baseUrl}/sms/send`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                timeout: 15000,
            });
            console.log('FITSMS response status:', response.status);
            console.log('FITSMS response data:', response.data);
            if (response.data?.status === 'error') {
                throw new common_1.InternalServerErrorException(response.data?.message || 'Failed to send OTP SMS');
            }
            return response.data;
        }
        catch (error) {
            console.error('FITSMS send failed status:', error?.response?.status);
            console.error('FITSMS send failed data:', error?.response?.data);
            console.error('FITSMS send failed message:', error?.message);
            throw new common_1.InternalServerErrorException(error?.response?.data?.message || error?.message || 'Failed to send OTP SMS');
        }
    }
    normalizeSriLankanNumber(input) {
        const raw = input.replace(/\D/g, '');
        if (raw.startsWith('94') && raw.length === 11)
            return raw;
        if (raw.startsWith('0') && raw.length === 10)
            return `94${raw.slice(1)}`;
        return raw;
    }
};
exports.SmsService = SmsService;
exports.SmsService = SmsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SmsService);
//# sourceMappingURL=sms.service.js.map