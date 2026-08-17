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

  async findById(messageId: string, userId: string) {
    const isSender = await prisma.message.findFirst({ where: { id: messageId, senderId: userId }, select: { id: true } });
    const isRecipient = await prisma.messageRecipient.findFirst({ where: { messageId, recipientId: userId }, select: { id: true } });
    if (!isSender && !isRecipient) throw new Error("Message non trouvé");
    return prisma.message.findUniqueOrThrow({
      where: { id: messageId },
      include: { sender: { select: { firstName: true, lastName: true } }, recipients: { include: { recipient: { select: { firstName: true, lastName: true } } } } },
    });
  },

  async update(messageId: string, userId: string, data: { subject?: string; body?: string }) {
    const message = await prisma.message.findFirst({ where: { id: messageId, senderId: userId } });
    if (!message) throw new Error("Message non trouvé ou non autorisé");
    return prisma.message.update({ where: { id: messageId }, data });
  },

  async delete(messageId: string, userId: string) {
    const message = await prisma.message.findFirst({ where: { id: messageId, senderId: userId } });
    if (!message) throw new Error("Message non trouvé ou non autorisé");
    await prisma.messageRecipient.deleteMany({ where: { messageId } });
    return prisma.message.delete({ where: { id: messageId } });
  },

  markRead(messageId: string, userId: string) {
    return prisma.messageRecipient.updateMany({
      where: { messageId, recipientId: userId },
      data: { readAt: new Date() },
    });
  },
};
