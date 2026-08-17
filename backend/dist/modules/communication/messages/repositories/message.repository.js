"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRepository = void 0;
const prisma_1 = require("../../../../config/prisma");
exports.messageRepository = {
    create(schoolId, senderId, subject, body, recipientIds) {
        return prisma_1.prisma.message.create({
            data: {
                schoolId,
                senderId,
                subject,
                body,
                recipients: { create: recipientIds.map((recipientId) => ({ recipientId })) },
            },
            include: { recipients: true },
        });
    },
    inbox(userId) {
        return prisma_1.prisma.messageRecipient.findMany({
            where: { recipientId: userId },
            include: {
                message: { include: { sender: { select: { firstName: true, lastName: true } } } },
            },
            orderBy: { message: { createdAt: "desc" } },
        });
    },
    sent(userId) {
        return prisma_1.prisma.message.findMany({
            where: { senderId: userId },
            include: { recipients: { include: { recipient: { select: { firstName: true, lastName: true } } } } },
            orderBy: { createdAt: "desc" },
        });
    },
    async findById(messageId, userId) {
        const isSender = await prisma_1.prisma.message.findFirst({ where: { id: messageId, senderId: userId }, select: { id: true } });
        const isRecipient = await prisma_1.prisma.messageRecipient.findFirst({ where: { messageId, recipientId: userId }, select: { id: true } });
        if (!isSender && !isRecipient)
            throw new Error("Message non trouvé");
        return prisma_1.prisma.message.findUniqueOrThrow({
            where: { id: messageId },
            include: { sender: { select: { firstName: true, lastName: true } }, recipients: { include: { recipient: { select: { firstName: true, lastName: true } } } } },
        });
    },
    async update(messageId, userId, data) {
        const message = await prisma_1.prisma.message.findFirst({ where: { id: messageId, senderId: userId } });
        if (!message)
            throw new Error("Message non trouvé ou non autorisé");
        return prisma_1.prisma.message.update({ where: { id: messageId }, data });
    },
    async delete(messageId, userId) {
        const message = await prisma_1.prisma.message.findFirst({ where: { id: messageId, senderId: userId } });
        if (!message)
            throw new Error("Message non trouvé ou non autorisé");
        await prisma_1.prisma.messageRecipient.deleteMany({ where: { messageId } });
        return prisma_1.prisma.message.delete({ where: { id: messageId } });
    },
    markRead(messageId, userId) {
        return prisma_1.prisma.messageRecipient.updateMany({
            where: { messageId, recipientId: userId },
            data: { readAt: new Date() },
        });
    },
};
//# sourceMappingURL=message.repository.js.map