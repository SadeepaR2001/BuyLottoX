import { IsDateString, IsString } from 'class-validator'

export class CreateDrawDto {
  @IsString()
  title!: string

  @IsDateString()
  drawAt!: string
}

export class CloseDrawDto {
  @IsString()
  winningNumbers!: string // "4,12,22,33,41,49"
}
