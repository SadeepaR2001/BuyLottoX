"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: [
            'http://localhost:5173',
            'http://localhost:3000',
            'https://www.buylottox.com',
            'https://buylottox.com',
            'https://d1k2sr62wis3mw.cloudfront.net',
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    const port = process.env.PORT ? Number(process.env.PORT) : 4000;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 BuyLottoX API running on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map