import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator'
import { CreateTicketDto } from './dto/ticket.dto'
import { TicketsService } from './tickets.service'

@UseGuards(AuthGuard('jwt'))
@Controller('tickets')
export class TicketsController {
  constructor(private tickets: TicketsService) {}

  @Get('me')
  async mine(@CurrentUser() user: JwtUser) {
    const items = await this.tickets.myTickets(user.sub)
    return items.map((t) => ({
      id: t.id,
      drawId: t.drawId,
      numbers: t.numbers.split(',').map((n) => Number(n)),
      status: t.status,
      createdAt: t.createdAt,
      draw: t.draw,
    }))
  }

  @Post()
  async create(@CurrentUser() user: JwtUser, @Body() dto: CreateTicketDto) {
    const t = await this.tickets.createTicket(user.sub, dto.drawId, dto.numbers)
    return { id: t.id, drawId: t.drawId, numbers: t.numbers.split(',').map(Number), status: t.status, createdAt: t.createdAt }
  }
}
