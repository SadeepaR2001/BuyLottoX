import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './modules/auth/auth.module'
import { DrawsModule } from './modules/draws/draws.module'
import { TicketsModule } from './modules/tickets/tickets.module'
import { HealthModule } from './modules/health/health.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    DrawsModule,
    TicketsModule,
    HealthModule,
  ],
})
export class AppModule {}
