// import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
// import { AuthGuard } from '@nestjs/passport'
// import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator'
// import { AuthService } from './auth.service'
// import { LoginDto, RegisterDto } from './dto/auth.dto'
// import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'

// @Controller('auth')
// export class AuthController {
//   [x: string]: any
//   constructor(private auth: AuthService) {}

//   @Post('register')
//   register(@Body() dto: RegisterDto) {
//     return this.auth.register(dto.name, dto.mobileNumber, dto.password)
//   }

//   @Post('login')
//   login(@Body() dto: LoginDto) {
//     return this.auth.login(dto.mobileNumber, dto.password)
//   }

//   @UseGuards(AuthGuard('jwt'))
//   @Get('me')
//   me(@CurrentUser() user: JwtUser) {
//     return this.auth.me(user.sub)
//   }
//   @Post('send-otp')
// sendOtp(@Body() body: { mobileNumber: string }) {
//   return this.authService.sendOtp(body.mobileNumber)
// }
// @Post('verify-otp')
// verifyOtp(@Body() body: { mobileNumber: string; code: string }) {
//   return this.authService.verifyOtp(body.mobileNumber, body.code)
// }
// }
// import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
// import { AuthService } from './auth.service'
// import { JwtAuthGuard } from './jwt-auth.guard'

import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './jwt-auth.guard'

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(
    @Body() body: { name: string; mobileNumber: string; password: string },
  ) {
    return this.auth.register(body.name, body.mobileNumber, body.password)
  }

  @Post('login')
  login(@Body() body: { mobileNumber: string; password: string }) {
    return this.auth.login(body.mobileNumber, body.password)
  }

  @Post('send-otp')
  sendOtp(@Body() body: { mobileNumber: string }) {
    return this.auth.sendOtp(body.mobileNumber)
  }

  @Post('verify-otp')
  verifyOtp(@Body() body: { mobileNumber: string; otp: string }) {
    return this.auth.verifyOtp(body.mobileNumber, body.otp)
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return this.auth.me(req.user.userId)
  }
}