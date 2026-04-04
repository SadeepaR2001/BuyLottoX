"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    const users = [
        {
            name: 'Super Admin',
            mobileNumber: '94770000001',
            password: 'super123',
            role: client_1.Role.SUPER_ADMIN,
        },
        {
            name: 'Admin 1',
            mobileNumber: '94770000002',
            password: 'admin123',
            role: client_1.Role.ADMIN,
        },
        {
            name: 'User',
            mobileNumber: '94770000003',
            password: 'user1234',
            role: client_1.Role.USER,
        },
    ];
    for (const item of users) {
        const hashedPassword = await bcrypt.hash(item.password, 10);
        await prisma.user.upsert({
            where: { mobileNumber: item.mobileNumber },
            update: {},
            create: {
                name: item.name,
                mobileNumber: item.mobileNumber,
                password: hashedPassword,
                role: item.role,
                status: client_1.UserStatus.ACTIVE,
                isMobileVerified: true,
            },
        });
    }
    const existingOpen = await prisma.draw.findFirst({
        where: { status: client_1.DrawStatus.OPEN },
    });
    if (!existingOpen) {
        await prisma.draw.create({
            data: {
                title: 'Weekly Draw',
                drawAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                status: client_1.DrawStatus.OPEN,
            },
        });
    }
    console.log('✅ Seed completed');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map