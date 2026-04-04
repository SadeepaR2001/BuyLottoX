// import { PrismaClient, Role, DrawStatus } from '@prisma/client'
// import * as bcrypt from 'bcrypt'

// const prisma = new PrismaClient()

// async function main() {
//   const adminEmail = 'admin@buylottox.test'
//   const userEmail = 'user@buylottox.test'

//   const adminPass = await bcrypt.hash('admin123', 10)
//   const userPass = await bcrypt.hash('user1234', 10)

//   await prisma.user.upsert({
//     where: { email: adminEmail },
//     update: {},
//     create: { name: 'Admin', email: adminEmail, password: adminPass, role: Role.ADMIN },
//   })

//   await prisma.user.upsert({
//     where: { email: userEmail },
//     update: {},
//     create: { name: 'User', email: userEmail, password: userPass, role: Role.USER },
//   })

//   const existingOpen = await prisma.draw.findFirst({ where: { status: DrawStatus.OPEN } })
//   if (!existingOpen) {
//     await prisma.draw.create({
//       data: {
//         title: 'Weekly Draw',
//         drawAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//         status: DrawStatus.OPEN,
//       },
//     })
//   }

//   console.log('✅ Seed completed')
// }

// main()
//   .catch((e) => {
//     console.error(e)
//     process.exit(1)
//   })
//   .finally(async () => {
//     await prisma.$disconnect()
//   })
// import { PrismaClient, Role, DrawStatus } from '@prisma/client'
// import * as bcrypt from 'bcrypt'

// const prisma = new PrismaClient()

// async function main() {
//   const admins = [
//     { name: 'Admin 1', email: 'admin1@buylottox.test', password: 'admin123' },
//     { name: 'Admin 2', email: 'admin2@buylottox.test', password: 'admin123' },
//     { name: 'Admin 3', email: 'admin3@buylottox.test', password: 'admin123' },
//     { name: 'Admin 4', email: 'admin4@buylottox.test', password: 'admin123' },
//     { name: 'Admin 5', email: 'admin5@buylottox.test', password: 'admin123' },
//     { name: 'Admin 6', email: 'admin6@buylottox.test', password: 'admin123' },
//   ]

//   const users = [
//     { name: 'User', email: 'user@buylottox.test', password: 'user1234', role: Role.USER },
//   ]

//   for (const admin of admins) {
//     const hashedPassword = await bcrypt.hash(admin.password, 10)

//     await prisma.user.upsert({
//       where: { email: admin.email },
//       update: {},
//       create: {
//         name: admin.name,
//         email: admin.email,
//         password: hashedPassword,
//         role: Role.ADMIN,
//       },
//     })
//   }

//   for (const user of users) {
//     const hashedPassword = await bcrypt.hash(user.password, 10)

//     await prisma.user.upsert({
//       where: { email: user.email },
//       update: {},
//       create: {
//         name: user.name,
//         email: user.email,
//         password: hashedPassword,
//         role: user.role,
//       },
//     })
//   }

//   const existingOpen = await prisma.draw.findFirst({
//     where: { status: DrawStatus.OPEN },
//   })

//   if (!existingOpen) {
//     await prisma.draw.create({
//       data: {
//         title: 'Weekly Draw',
//         drawAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//         status: DrawStatus.OPEN,
//       },
//     })
//   }

//   console.log('✅ Seed completed')
// }

// main()
//   .catch((e) => {
//     console.error(e)
//     process.exit(1)
//   })
//   .finally(async () => {
//     await prisma.$disconnect()
//   })

import { PrismaClient, Role, DrawStatus, UserStatus } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const users = [
  {
    name: 'Super Admin',
    mobileNumber: '94770000001',
    password: 'super123',
    role: Role.SUPER_ADMIN,
  },
  {
    name: 'Admin 1',
    mobileNumber: '94770000002',
    password: 'admin123',
    role: Role.ADMIN,
  },
  {
    name: 'User',
    mobileNumber: '94770000003',
    password: 'user1234',
    role: Role.USER,
  },
]

  for (const item of users) {
    const hashedPassword = await bcrypt.hash(item.password, 10)
await prisma.user.upsert({
  where: { mobileNumber: item.mobileNumber },
  update: {},
  create: {
    name: item.name,
    mobileNumber: item.mobileNumber,
    password: hashedPassword,
    role: item.role,
    status: UserStatus.ACTIVE,
    isMobileVerified: true,
  },
})
  }

  const existingOpen = await prisma.draw.findFirst({
    where: { status: DrawStatus.OPEN },
  })

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