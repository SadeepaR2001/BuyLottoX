import { PrismaClient, Role, DrawStatus } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'admin@buylottox.test'
  const userEmail = 'user@buylottox.test'

  const adminPass = await bcrypt.hash('admin123', 10)
  const userPass = await bcrypt.hash('user1234', 10)

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { name: 'Admin', email: adminEmail, password: adminPass, role: Role.ADMIN },
  })

  await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: { name: 'User', email: userEmail, password: userPass, role: Role.USER },
  })

  const existingOpen = await prisma.draw.findFirst({ where: { status: DrawStatus.OPEN } })
  if (!existingOpen) {
    await prisma.draw.create({
      data: {
        title: 'Weekly Draw',
        drawAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: DrawStatus.OPEN,
      },
    })
  }

  console.log('✅ Seed completed')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
