import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../modules/auth/jwt-auth.guard'
import { BuySubTicketsDto } from './dto/buy-subtickets.dto'
import { GridService } from './grid.service'

@Controller('grid')
export class GridController {
  constructor(private readonly gridService: GridService) {}

  @Get('active')
  getActiveGrid() {
    return this.gridService.getActiveGrid()
  }

  @Get(':gridId/numbers')
  getGridNumbers(@Param('gridId') gridId: string) {
    return this.gridService.getGridNumbers(gridId)
  }

  @Get(':gridId/numbers/:number/subtickets')
  getSubTickets(@Param('gridId') gridId: string, @Param('number') number: string) {
    return this.gridService.getSubTickets(gridId, Number(number))
  }

  @Post(':gridId/buy')
  @UseGuards(JwtAuthGuard)
  buySubTickets(@Param('gridId') gridId: string, @Req() req: any, @Body() body: BuySubTicketsDto) {
    return this.gridService.buySubTickets(gridId, req.user.sub, body)
  }
}
