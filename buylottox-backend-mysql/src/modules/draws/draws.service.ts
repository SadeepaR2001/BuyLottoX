import { BadRequestException, Injectable } from '@nestjs/common'
import { DrawStatus } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class DrawsService {
  constructor(private prisma: PrismaService) {}

  getActive() {
    return this.prisma.draw.findFirst({ where: { status: DrawStatus.OPEN }, orderBy: { drawAt: 'asc' } })
  }

  listAll() {
    return this.prisma.draw.findMany({ orderBy: { createdAt: 'desc' } })
  }

  async createDraw(title: string, drawAtIso: string) {
    const drawAt = new Date(drawAtIso)
    if (Number.isNaN(drawAt.getTime())) throw new BadRequestException('Invalid drawAt')

    // allow only one OPEN draw (close old automatically)
    await this.prisma.draw.updateMany({ where: { status: DrawStatus.OPEN }, data: { status: DrawStatus.CLOSED } })

    return this.prisma.draw.create({ data: { title, drawAt, status: DrawStatus.OPEN } })
  }

  async closeDraw(id: string, winningNumbers: string) {
    const nums = winningNumbers.split(',').map(s => s.trim()).filter(Boolean)
    if (nums.length === 0) throw new BadRequestException('winningNumbers required')

    const draw = await this.prisma.draw.update({
      where: { id },
      data: { status: DrawStatus.CLOSED, winningNumbers: nums.join(',') },
    })

    // simple: mark all as LOST (you can implement real matching later)
    await this.prisma.ticket.updateMany({ where: { drawId: id }, data: { status: 'LOST' } })
    return draw
  }
}
