import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { GridStatus, Prisma, Role, SubTicketStatus, UserStatus } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'
import { CreateGridDto } from './dto/create-grid.dto'

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        mobileNumber: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async blockUser(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { status: UserStatus.BLOCKED },
      select: { id: true, name: true, mobileNumber: true, role: true, status: true },
    })
  }

  async unblockUser(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { status: UserStatus.ACTIVE },
      select: { id: true, name: true, mobileNumber: true, role: true, status: true },
    })
  }

  async createAdmin(data: { name: string; mobileNumber: string; password: string }) {
    const exists = await this.prisma.user.findUnique({ where: { mobileNumber: data.mobileNumber } })
    if (exists) throw new BadRequestException('mobileNumber already exists')

    const hashed = await bcrypt.hash(data.password, 10)

    return this.prisma.user.create({
      data: {
        name: data.name,
        mobileNumber: data.mobileNumber,
        password: hashed,
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        name: true,
        mobileNumber: true,
        role: true,
        status: true,
        createdAt: true,
      },
    })
  }

  async makeAdmin(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException('User not found')
    if (user.role === Role.SUPER_ADMIN) {
      throw new BadRequestException('Super admin role cannot be changed here')
    }

    return this.prisma.user.update({
      where: { id },
      data: { role: Role.ADMIN },
      select: { id: true, name: true, mobileNumber: true, role: true, status: true },
    })
  }

  async removeAdmin(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException('User not found')
    if (user.role === Role.SUPER_ADMIN) {
      throw new BadRequestException('Super admin role cannot be changed here')
    }

    return this.prisma.user.update({
      where: { id },
      data: { role: Role.USER },
      select: { id: true, name: true, mobileNumber: true, role: true, status: true },
    })
  }

  // async createGrid(data: CreateGridDto) {
  //   const openAt = new Date(data.openAt)
  //   const closeAt = new Date(data.closeAt)
  //   if (Number.isNaN(openAt.getTime()) || Number.isNaN(closeAt.getTime())) {
  //     throw new BadRequestException('Invalid openAt or closeAt')
  //   }
  //   if (closeAt <= openAt) {
  //     throw new BadRequestException('closeAt must be greater than openAt')
  //   }

  //   const subTicketPrice = Number(data.subTicketPrice)
  //   const commissionRate = Number(data.commissionRate ?? 20)
  //   const totalMainNumbers = 100
  //   const subTicketsPerMain = Number(data.subTicketsPerMain)
  //   const totalSubTickets = totalMainNumbers * subTicketsPerMain
  //   const totalValue = subTicketPrice * totalMainNumbers * subTicketsPerMain
  //   const commissionAmount = totalValue * (commissionRate / 100)
  //   const winningPool = totalValue - commissionAmount

  //   const grid = await this.prisma.$transaction(async (tx) => {
  //     const createdGrid = await tx.grid.create({
  //       data: {
  //         title: data.title,
  //         openAt,
  //         closeAt,
  //         subTicketPrice: new Prisma.Decimal(subTicketPrice),
  //         commissionRate: new Prisma.Decimal(commissionRate),
  //         totalMainNumbers,
  //         subTicketsPerMain,
  //         totalValue: new Prisma.Decimal(totalValue),
  //         commissionAmount: new Prisma.Decimal(commissionAmount),
  //         winningPool: new Prisma.Decimal(winningPool),
  //         status: GridStatus.DRAFT,
  //       },
  //     })

  //     for (let number = 0; number < totalMainNumbers; number++) {
  //       const gridNumber = await tx.gridNumber.create({
  //         data: { gridId: createdGrid.id, number, isSoldOut: false },
  //       })

  //       await tx.subTicket.createMany({
  //         data: Array.from({ length: subTicketsPerMain }, (_, index) => ({
  //           gridNumberId: gridNumber.id,
  //           subIndex: index + 1,
  //           status: SubTicketStatus.AVAILABLE,
  //         })),
  //       })
  //     }

  //     return createdGrid
  //   })

  //   return {
  //     message: 'Grid created successfully',
  //     grid,
  //     summary: {
  //       totalMainNumbers,
  //       subTicketsPerMain,
  //       totalSubTickets,
  //       subTicketPrice,
  //       totalValue,
  //       commissionRate,
  //       commissionAmount,
  //       winningPool,
  //       winningAmountPerSubTicket: winningPool / subTicketsPerMain,
  //     },
  //   }
  // }
async createGrid(data: CreateGridDto) {
  const openAt = new Date(data.openAt)
  const closeAt = new Date(data.closeAt)

  if (isNaN(openAt.getTime()) || isNaN(closeAt.getTime())) {
    throw new BadRequestException('Invalid openAt or closeAt')
  }

  if (closeAt <= openAt) {
    throw new BadRequestException('closeAt must be greater than openAt')
  }

  const subTicketPrice = Number(data.subTicketPrice)
  const commissionRate = Number(data.commissionRate)
  const totalMainNumbers = 100
  const subTicketsPerMain = Number(data.subTicketsPerMain)

  if (Number.isNaN(subTicketPrice) || subTicketPrice <= 0) {
    throw new BadRequestException('subTicketPrice must be a valid positive number')
  }

  if (Number.isNaN(commissionRate) || commissionRate < 0 || commissionRate > 100) {
    throw new BadRequestException('commissionRate must be between 0 and 100')
  }

  if (Number.isNaN(subTicketsPerMain) || subTicketsPerMain <= 0) {
    throw new BadRequestException('subTicketsPerMain must be a valid positive integer')
  }

  const totalSubTickets = totalMainNumbers * subTicketsPerMain
  const totalValue = subTicketPrice * totalSubTickets
  const commissionAmount = totalValue * (commissionRate / 100)
  const winningPool = totalValue - commissionAmount
  const winningAmountPerSubTicket = winningPool / subTicketsPerMain

  const grid = await this.prisma.$transaction(async (tx) => {
    const createdGrid = await tx.grid.create({
      data: {
        title: data.title,
        openAt,
        closeAt,
        subTicketPrice: new Prisma.Decimal(subTicketPrice),
        commissionRate: new Prisma.Decimal(commissionRate),
        totalMainNumbers,
        subTicketsPerMain,
        totalValue: new Prisma.Decimal(totalValue),
        commissionAmount: new Prisma.Decimal(commissionAmount),
        winningPool: new Prisma.Decimal(winningPool),
        status: GridStatus.DRAFT,
      },
    })

    for (let number = 0; number < totalMainNumbers; number++) {
      const gridNumber = await tx.gridNumber.create({
        data: {
          gridId: createdGrid.id,
          number,
          isSoldOut: false,
        },
      })

      const subTicketsData = []

      for (let subIndex = 1; subIndex <= subTicketsPerMain; subIndex++) {
        subTicketsData.push({
          gridNumberId: gridNumber.id,
          subIndex,
          status: SubTicketStatus.AVAILABLE,
        })
      }

      await tx.subTicket.createMany({
        data: subTicketsData,
      })
    }

    return createdGrid
  })

  return {
    message: 'Grid created successfully',
    grid,
    summary: {
      totalMainNumbers,
      subTicketsPerMain,
      totalSubTickets,
      subTicketPrice,
      totalValue,
      commissionRate,
      commissionAmount,
      winningPool,
      winningAmountPerSubTicket,
    },
  }
}
  async getGrids() {
    const grids = await this.prisma.grid.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            numbers: true,
            purchases: true,
          },
        },
      },
    })

return grids.map((grid: typeof grids[number]) => ({      id: grid.id,
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
      createdAt: grid.createdAt,
      updatedAt: grid.updatedAt,
      numbersCount: grid._count.numbers,
      purchasesCount: grid._count.purchases,
    }))
  }

  async getGridById(id: string) {
    const grid = await this.prisma.grid.findUnique({
      where: { id },
      include: {
        numbers: {
          orderBy: { number: 'asc' },
          include: {
            subTickets: {
              orderBy: { subIndex: 'asc' },
            },
          },
        },
      },
    })

    if (!grid) throw new NotFoundException('Grid not found')

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
      createdAt: grid.createdAt,
      updatedAt: grid.updatedAt,
numbers: grid.numbers.map((num: typeof grid.numbers[number]) => ({        id: num.id,
        number: num.number,
        isSoldOut: num.isSoldOut,
subTickets: num.subTickets.map((sub: typeof num.subTickets[number]) => ({          id: sub.id,
          subIndex: sub.subIndex,
          status: sub.status,
          soldAt: sub.soldAt,
        })),
      })),
    }
  }

  async openGrid(id: string) {
    const grid = await this.prisma.grid.findUnique({ where: { id } })
    if (!grid) throw new NotFoundException('Grid not found')
    if (grid.status === GridStatus.OPEN) {
      throw new BadRequestException('Grid is already open')
    }

    return this.prisma.grid.update({
      where: { id },
      data: { status: GridStatus.OPEN },
    })
  }

  async closeGrid(id: string) {
    const grid = await this.prisma.grid.findUnique({ where: { id } })
    if (!grid) throw new NotFoundException('Grid not found')
    if (grid.status === GridStatus.CLOSED) {
      throw new BadRequestException('Grid is already closed')
    }

    return this.prisma.grid.update({
      where: { id },
      data: { status: GridStatus.CLOSED },
    })
  }

  async setWinningNumber(id: string, winningNumber: number) {
    if (!Number.isInteger(winningNumber) || winningNumber < 0 || winningNumber > 99) {
      throw new BadRequestException('winningNumber must be between 0 and 99')
    }

    const grid = await this.prisma.grid.findUnique({ where: { id } })
    if (!grid) throw new NotFoundException('Grid not found')

    const winningAmountPerSubTicket = Number(grid.winningPool) / grid.subTicketsPerMain

    // return this.prisma.grid.update({
    //   where: { id },
    //   data: {
    //     winningNumber,
    //     status: GridStatus.COMPLETED,
    //   },
    //   select: {
    //     id: true,
    //     title: true,
    //     winningNumber: true,
    //     winningPool: true,
    //     subTicketsPerMain: true,
    //     status: true,
    //   },
    // }).then((updated) => ({
    //   ...updated,
    //   winningPool: Number(updated.winningPool),
    //   winningAmountPerSubTicket,
    // }))

    const updated = await this.prisma.grid.update({
  where: { id },
  data: {
    winningNumber,
    status: GridStatus.COMPLETED,
  },
  select: {
    id: true,
    title: true,
    winningNumber: true,
    winningPool: true,
    subTicketsPerMain: true,
    status: true,
  },
})

return {
  ...updated,
  winningPool: Number(updated.winningPool),
  winningAmountPerSubTicket,
}
  }
}
