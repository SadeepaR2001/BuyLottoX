import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { GridStatus, Prisma, SubTicketStatus, UserStatus } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { BuySubTicketsDto } from './dto/buy-subtickets.dto'

@Injectable()
export class GridService {
  constructor(private prisma: PrismaService) {}

  async getActiveGrid() {
    const now = new Date()
    const grid = await this.prisma.grid.findFirst({
      where: {
        status: GridStatus.OPEN,
        openAt: { lte: now },
        closeAt: { gte: now },
      },
      orderBy: { openAt: 'desc' },
    })

    if (!grid) return null

    return {
      id: grid.id,
      title: grid.title,
      openAt: grid.openAt,
      closeAt: grid.closeAt,
      subTicketPrice: Number(grid.subTicketPrice),
      commissionRate: Number(grid.commissionRate),
      totalValue: Number(grid.totalValue),
      commissionAmount: Number(grid.commissionAmount),
      winningPool: Number(grid.winningPool),
      winningNumber: grid.winningNumber,
      status: grid.status,
      totalMainNumbers: grid.totalMainNumbers,
      subTicketsPerMain: grid.subTicketsPerMain,
      winningAmountPerSubTicket: Number(grid.winningPool) / grid.subTicketsPerMain,
    }
  }

  async getGridNumbers(gridId: string) {
    const grid = await this.prisma.grid.findUnique({ where: { id: gridId } })
    if (!grid) throw new NotFoundException('Grid not found')

    const numbers = await this.prisma.gridNumber.findMany({
      where: { gridId },
      include: { subTickets: true },
      orderBy: { number: 'asc' },
    })

    return numbers.map((item) => {
      const soldCount = item.subTickets.filter((s) => s.status === SubTicketStatus.SOLD).length
      const remainingCount = item.subTickets.filter((s) => s.status === SubTicketStatus.AVAILABLE).length

      return {
        id: item.id,
        number: item.number,
        isSoldOut: remainingCount === 0 || item.isSoldOut,
        soldCount,
        remainingCount,
      }
    })
  }

  async getSubTickets(gridId: string, number: number) {
    if (!Number.isInteger(number) || number < 0 || number > 99) {
      throw new BadRequestException('number must be between 0 and 99')
    }

    const gridNumber = await this.prisma.gridNumber.findFirst({
      where: { gridId, number },
      include: { subTickets: { orderBy: { subIndex: 'asc' } } },
    })

    if (!gridNumber) throw new NotFoundException('Grid number not found')

    return {
      gridNumberId: gridNumber.id,
      number: gridNumber.number,
      isSoldOut: gridNumber.isSoldOut,
      subTickets: gridNumber.subTickets.map((sub) => ({
        id: sub.id,
        subIndex: sub.subIndex,
        status: sub.status,
        soldAt: sub.soldAt,
      })),
    }
  }

  async buySubTickets(gridId: string, userId: string, body: BuySubTicketsDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundException('User not found')
    if (user.status === UserStatus.BLOCKED) {
      throw new BadRequestException('Blocked users cannot buy tickets')
    }

    const grid = await this.prisma.grid.findUnique({ where: { id: gridId } })
    if (!grid) throw new NotFoundException('Grid not found')

    const now = new Date()
    if (grid.status !== GridStatus.OPEN || now < grid.openAt || now > grid.closeAt) {
      throw new BadRequestException('Grid is not open for buying')
    }

    return this.prisma.$transaction(async (tx) => {
      const requestedIds = new Set<string>()
      const touchedGridNumberIds = new Set<string>()
      let totalSubTickets = 0

      for (const selection of body.selections) {
        if (!Number.isInteger(selection.number) || selection.number < 0 || selection.number > 99) {
          throw new BadRequestException(`Invalid number ${selection.number}`)
        }

        const gridNumber = await tx.gridNumber.findFirst({
          where: { gridId, number: selection.number },
          include: { subTickets: true },
        })

        if (!gridNumber) throw new BadRequestException(`Number ${selection.number} not found`)

        for (const subIndex of selection.subIndexes) {
          if (!Number.isInteger(subIndex) || subIndex < 1 || subIndex > grid.subTicketsPerMain) {
            throw new BadRequestException(`Invalid subticket ${selection.number}-${subIndex}`)
          }

          const subTicket = gridNumber.subTickets.find((s) => s.subIndex === subIndex)
          if (!subTicket) {
            throw new BadRequestException(`Subticket ${selection.number}-${subIndex} not found`)
          }
          if (subTicket.status !== SubTicketStatus.AVAILABLE) {
            throw new BadRequestException(`Subticket ${selection.number}-${subIndex} is not available`)
          }
          if (requestedIds.has(subTicket.id)) {
            throw new BadRequestException(`Duplicate subticket ${selection.number}-${subIndex}`)
          }

          requestedIds.add(subTicket.id)
          touchedGridNumberIds.add(gridNumber.id)
          totalSubTickets++
        }
      }

      const totalAmount = new Prisma.Decimal(Number(grid.subTicketPrice) * totalSubTickets)

      const purchase = await tx.ticketPurchase.create({
        data: {
          userId,
          gridId,
          totalAmount,
        },
      })

      for (const subTicketId of requestedIds) {
        await tx.subTicket.update({
          where: { id: subTicketId },
          data: {
            status: SubTicketStatus.SOLD,
            soldAt: new Date(),
            buyerId: userId,
            purchaseId: purchase.id,
          },
        })
      }

      for (const gridNumberId of touchedGridNumberIds) {
        const remaining = await tx.subTicket.count({
          where: {
            gridNumberId,
            status: SubTicketStatus.AVAILABLE,
          },
        })

        if (remaining === 0) {
          await tx.gridNumber.update({
            where: { id: gridNumberId },
            data: { isSoldOut: true },
          })
        }
      }

      return {
        message: 'Tickets purchased successfully',
        purchaseId: purchase.id,
        gridId,
        totalSubTickets,
        totalAmount: Number(totalAmount),
      }
    })
  }
}
