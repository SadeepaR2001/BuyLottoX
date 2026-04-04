/*
  Warnings:

  - You are about to drop the column `reference` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Payment` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(3))` to `VarChar(191)`.
  - You are about to drop the column `numbers` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Ticket` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[purchaseId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `purchaseId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gridId` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Payment` DROP FOREIGN KEY `Payment_drawId_fkey`;

-- DropForeignKey
ALTER TABLE `Ticket` DROP FOREIGN KEY `Ticket_drawId_fkey`;

-- AlterTable
ALTER TABLE `Payment` DROP COLUMN `reference`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `purchaseId` VARCHAR(191) NOT NULL,
    MODIFY `drawId` VARCHAR(191) NULL,
    MODIFY `amount` DECIMAL(10, 2) NOT NULL,
    MODIFY `method` VARCHAR(191) NULL,
    MODIFY `status` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Ticket` DROP COLUMN `numbers`,
    DROP COLUMN `status`,
    ADD COLUMN `gridId` VARCHAR(191) NOT NULL,
    ADD COLUMN `paymentId` VARCHAR(191) NULL,
    ADD COLUMN `totalAmount` DECIMAL(10, 2) NOT NULL,
    MODIFY `drawId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Grid` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `openAt` DATETIME(3) NOT NULL,
    `closeAt` DATETIME(3) NOT NULL,
    `subTicketPrice` DECIMAL(10, 2) NOT NULL,
    `commissionRate` DECIMAL(5, 2) NOT NULL,
    `totalMainNumbers` INTEGER NOT NULL DEFAULT 100,
    `subTicketsPerMain` INTEGER NOT NULL DEFAULT 10,
    `totalValue` DECIMAL(12, 2) NOT NULL,
    `commissionAmount` DECIMAL(12, 2) NOT NULL,
    `winningPool` DECIMAL(12, 2) NOT NULL,
    `winningNumber` INTEGER NULL,
    `status` ENUM('DRAFT', 'OPEN', 'CLOSED', 'COMPLETED') NOT NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GridNumber` (
    `id` VARCHAR(191) NOT NULL,
    `gridId` VARCHAR(191) NOT NULL,
    `number` INTEGER NOT NULL,
    `isSoldOut` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `GridNumber_gridId_number_key`(`gridId`, `number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubTicket` (
    `id` VARCHAR(191) NOT NULL,
    `gridNumberId` VARCHAR(191) NOT NULL,
    `subIndex` INTEGER NOT NULL,
    `status` ENUM('AVAILABLE', 'RESERVED', 'SOLD', 'WON') NOT NULL DEFAULT 'AVAILABLE',
    `soldAt` DATETIME(3) NULL,
    `buyerId` VARCHAR(191) NULL,
    `purchaseId` VARCHAR(191) NULL,
    `ticketId` VARCHAR(191) NULL,

    UNIQUE INDEX `SubTicket_gridNumberId_subIndex_key`(`gridNumberId`, `subIndex`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TicketPurchase` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `gridId` VARCHAR(191) NOT NULL,
    `totalAmount` DECIMAL(10, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Payment_purchaseId_key` ON `Payment`(`purchaseId`);

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `TicketPurchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_drawId_fkey` FOREIGN KEY (`drawId`) REFERENCES `Draw`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GridNumber` ADD CONSTRAINT `GridNumber_gridId_fkey` FOREIGN KEY (`gridId`) REFERENCES `Grid`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubTicket` ADD CONSTRAINT `SubTicket_gridNumberId_fkey` FOREIGN KEY (`gridNumberId`) REFERENCES `GridNumber`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubTicket` ADD CONSTRAINT `SubTicket_buyerId_fkey` FOREIGN KEY (`buyerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubTicket` ADD CONSTRAINT `SubTicket_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `TicketPurchase`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubTicket` ADD CONSTRAINT `SubTicket_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_gridId_fkey` FOREIGN KEY (`gridId`) REFERENCES `Grid`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_drawId_fkey` FOREIGN KEY (`drawId`) REFERENCES `Draw`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TicketPurchase` ADD CONSTRAINT `TicketPurchase_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TicketPurchase` ADD CONSTRAINT `TicketPurchase_gridId_fkey` FOREIGN KEY (`gridId`) REFERENCES `Grid`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
