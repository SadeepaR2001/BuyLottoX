// import { IsEmail, IsString, MinLength } from 'class-validator'

// export class RegisterDto {
//   [x: string]: string
//   @IsString()
//   name!: string

//   @IsEmail()
//   email!: string

//   @IsString()
//   @MinLength(6)
//   password!: string
// }

// export class LoginDto {
//   [x: string]: string
//   @IsEmail()
//   email!: string

//   @IsString()
//   @MinLength(6)
//   password!: string
// }
import { IsString, Matches } from 'class-validator'

export class RegisterDto {
  @IsString()
  name: string

  @IsString()
  @Matches(/^(94|0)?7\d{8}$/, {
    message: 'Invalid Sri Lankan mobile number',
  })
  mobileNumber: string

  @IsString()
  password: string
}
export class LoginDto {
  @IsString()
  @Matches(/^(94|0)?7\d{8}$/, {
    message: 'Invalid Sri Lankan mobile number',
  })
  mobileNumber: string

  @IsString()
  password: string
}