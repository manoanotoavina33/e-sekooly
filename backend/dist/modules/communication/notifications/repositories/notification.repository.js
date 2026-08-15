"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRepository = void 0;
const prisma_1 = require("../../../../config/prisma");
exports.notificationRepository = {
    listForUser(userId, unreadOnly) {
        const where = {
            userId,
            readAt: unreadOnly ? null : undefined,
        };
        return prisma_1.prisma.notification.findMany({ where, orderBy: { createdAt: "desc" }, take: 50 });
    },
    create(data) {
        return prisma_1.prisma.notification.create({ data });
    },
    markRead(id, userId) {
        return prisma_1.prisma.notification.updateMany({
            where: { id, userId },
            data: { readAt: new Date() },
        });
    },
    markAllRead(userId) {
        return prisma_1.prisma.notification.updateMany({
            where: { userId, readAt: null },
            data: { readAt: new Date() },
        });
    },
    updateDeliveryStatus(id, status) {
        return prisma_1.prisma.notification.update({ where: { id }, data: { deliveryStatus: status } });
    },
};
//# sourceMappingURL=notification.repository.js.map