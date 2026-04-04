import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { GridController } from './grid.controller'
import { GridService } from './grid.service'

@Module({
  imports: [PrismaModule],
  controllers: [GridController],
  providers: [GridService],
  exports: [GridService],
})
export class GridModule {}
