// import { Type } from 'class-transformer'
// import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator'

// export class CreateGridDto {
//   @IsString()
//   @IsNotEmpty()
//   title!: string

//   @IsDateString()
//   openAt!: string

//   @IsDateString()
//   closeAt!: string

//   @Type(() => Number)
//   @IsNumber()
//   @IsPositive()
//   subTicketPrice!: number

//   @Type(() => Number)
//   @IsNumber()
//   @Min(0)
//   commissionRate?: number = 20

  
//   subTicketsPerMain: number

// }

import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator'
import { Type } from 'class-transformer'

export class CreateGridDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsDateString()
  openAt: string

  @IsDateString()
  closeAt: string

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  subTicketPrice: number

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionRate: number

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  subTicketsPerMain: number
}