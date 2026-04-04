import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { AdminService } from './admin.service'
import { JwtAuthGuard } from '../modules/auth/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { CreateGridDto } from './dto/create-grid.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  getUsers() {
    return this.adminService.getUsers()
  }

  @Patch('users/:id/block')
  blockUser(@Param('id') id: string) {
    return this.adminService.blockUser(id)
  }

  @Patch('users/:id/unblock')
  unblockUser(@Param('id') id: string) {
    return this.adminService.unblockUser(id)
  }

  @Post('create-admin')
  @Roles('SUPER_ADMIN')
  createAdmin(@Body() body: { name: string; mobileNumber: string; password: string }) {
    return this.adminService.createAdmin(body)
  }

  @Patch('users/:id/make-admin')
  @Roles('SUPER_ADMIN')
  makeAdmin(@Param('id') id: string) {
    return this.adminService.makeAdmin(id)
  }

  @Patch('users/:id/remove-admin')
  @Roles('SUPER_ADMIN')
  removeAdmin(@Param('id') id: string) {
    return this.adminService.removeAdmin(id)
  }

  @Post('grids')
  createGrid(@Body() body: CreateGridDto) {
    return this.adminService.createGrid(body)
  }

  @Get('grids')
  getGrids() {
    return this.adminService.getGrids()
  }

  @Get('grids/:id')
  getGrid(@Param('id') id: string) {
    return this.adminService.getGridById(id)
  }

  @Patch('grids/:id/open')
  openGrid(@Param('id') id: string) {
    return this.adminService.openGrid(id)
  }

  @Patch('grids/:id/close')
  closeGrid(@Param('id') id: string) {
    return this.adminService.closeGrid(id)
  }

  @Patch('grids/:id/winning-number')
  setWinningNumber(@Param('id') id: string, @Body() body: { winningNumber: number }) {
    return this.adminService.setWinningNumber(id, body.winningNumber)
  }
}
