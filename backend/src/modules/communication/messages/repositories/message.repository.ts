import { prisma } from "../../../../config/prisma";

export const messageRepository = {
  create(schoolId: string, senderId: string, subject: string, body: string, recipientIds: string[]) {
    return prisma.message.create({
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

  inbox(userId: string) {
    return prisma.messageRecipient.findMany({
      where: { recipientId: userId },
      include: {
        message: { include: { sender: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { message: { createdAt: "desc" } },
    });
  },

  sent(userId: string) {
    return prisma.message.findMany({
      where: { senderId: userId },
      include: { recipients: { include: { recipient: { select: { firstName: true, lastName: true } } } } },
      orderBy: { createdAt: "desc" },
    });
  },

  markRead(messageId: string, userId: string) {
    return prisma.messageRecipient.updateMany({
      where: { messageId, recipientId: userId },
      data: { readAt: new Date() },
    });
  },
};
