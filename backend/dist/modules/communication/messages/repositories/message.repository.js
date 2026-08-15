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
    markRead(messageId, userId) {
        return prisma_1.prisma.messageRecipient.updateMany({
            where: { messageId, recipientId: userId },
            data: { readAt: new Date() },
        });
    },
};
//# sourceMappingURL=message.repository.js.map