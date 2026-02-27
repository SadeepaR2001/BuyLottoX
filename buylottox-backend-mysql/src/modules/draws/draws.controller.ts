import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Roles } from '../../common/decorators/roles.decorator'
import { RolesGuard } from '../../common/guards/roles.guard'
import { CreateDrawDto, CloseDrawDto } from './dto/draw.dto'
import { DrawsService } from './draws.service'

@Controller('draws')
export class DrawsController {
  constructor(private draws: DrawsService) {}

  @Get('active')
  getActive() {
    return this.draws.getActive()
  }

  @Get()
  list() {
    return this.draws.listAll()
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateDrawDto) {
    return this.draws.createDraw(dto.title, dto.drawAt)
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Post(':id/close')
  close(@Param('id') id: string, @Body() dto: CloseDrawDto) {
    return this.draws.closeDraw(id, dto.winningNumbers)
  }
}
