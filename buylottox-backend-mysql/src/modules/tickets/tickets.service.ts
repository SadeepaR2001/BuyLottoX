import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { DrawStatus } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  myTickets(userId: string) {
    return this.prisma.ticket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { draw: true },
    })
  }

  async createTicket(userId: string, drawId: string, numbers: number[]) {
    const draw = await this.prisma.draw.findUnique({ where: { id: drawId } })
    if (!draw) throw new NotFoundException('Draw not found')
    if (draw.status !== DrawStatus.OPEN) throw new BadRequestException('Draw is not open')

    const uniq = Array.from(new Set(numbers))
    if (uniq.length !== 6) throw new BadRequestException('Numbers must be 6 unique values')

    return this.prisma.ticket.create({
      data: { userId, drawId, numbers: uniq.sort((a,b)=>a-b).join(',') },
    })
  }
}
