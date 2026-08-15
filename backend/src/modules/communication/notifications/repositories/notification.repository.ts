import { Prisma } from "@prisma/client";
import { prisma } from "../../../../config/prisma";

export const notificationRepository = {
  listForUser(userId: string, unreadOnly?: boolean) {
    const where: Prisma.NotificationWhereInput = {
      userId,
      readAt: unreadOnly ? null : undefined,
    };
    return prisma.notification.findMany({ where, orderBy: { createdAt: "desc" }, take: 50 });
  },

  create(data: Prisma.NotificationCreateInput) {
    return prisma.notification.create({ data });
  },

  markRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { readAt: new Date() },
    });
  },

  markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  },

  updateDeliveryStatus(id: string, status: "SENT" | "FAILED") {
    return prisma.notification.update({ where: { id }, data: { deliveryStatus: status } });
  },
};
