import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsString, Max, Min } from 'class-validator'

export class CreateTicketDto {
  @IsString()
  drawId!: string

  @IsArray()
  @ArrayMinSize(6)
  @ArrayMaxSize(6)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(49, { each: true })
  numbers!: number[]
}
