import { ArrayMinSize, IsArray, IsInt, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class TicketSelectionDto {
  @IsInt()
  number!: number

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  subIndexes!: number[]
}

export class BuySubTicketsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TicketSelectionDto)
  selections!: TicketSelectionDto[]
}
