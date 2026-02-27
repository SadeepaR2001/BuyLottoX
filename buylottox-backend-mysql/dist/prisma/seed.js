"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    const adminEmail = 'admin@buylottox.test';
    const userEmail = 'user@buylottox.test';
    const adminPass = await bcrypt.hash('admin123', 10);
    const userPass = await bcrypt.hash('user1234', 10);
    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: { name: 'Admin', email: adminEmail, password: adminPass, role: client_1.Role.ADMIN },
    });
    await prisma.user.upsert({
        where: { email: userEmail },
        update: {},
        create: { name: 'User', email: userEmail, password: userPass, role: client_1.Role.USER },
    });
    const existingOpen = await prisma.draw.findFirst({ where: { status: client_1.DrawStatus.OPEN } });
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