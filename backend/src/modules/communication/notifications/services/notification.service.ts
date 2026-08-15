import { prisma } from "../../../../config/prisma";
import { getNotificationProvider } from "../../providers/notificationProvider";
import { notificationRepository } from "../repositories/notification.repository";
import { CreateNotificationInput } from "../validations/notification.validation";

export const notificationService = {
  listForUser(userId: string, unreadOnly?: boolean) {
    return notificationRepository.listForUser(userId, unreadOnly);
  },

  markRead(id: string, userId: string) {
    return notificationRepository.markRead(id, userId);
  },

  markAllRead(userId: string) {
    return notificationRepository.markAllRead(userId);
  },

  /**
   * Crée une notification en base et, si un canal externe (EMAIL/SMS) est
   * demandé, tente de la relayer via le fournisseur configuré (voir
   * communication/providers). Le champ delivery_status reflète le résultat.
   */
  async create(input: CreateNotificationInput) {
    const notification = await notificationRepository.create({
      schoolId: input.schoolId,
      title: input.title,
      body: input.body,
      channel: input.channel,
      link: input.link,
      user: { connect: { id: input.userId } },
    } as never);

    if (input.channel === "IN_APP") {
      return notificationRepository.updateDeliveryStatus(notification.id, "SENT");
    }

    const user = await prisma.user.findUnique({ where: { id: input.userId } });
    const provider = getNotificationProvider();
    let sent = false;
    if (user) {
      if (input.channel === "EMAIL") {
        sent = await provider.sendEmail({ to: user.email, subject: input.title, body: input.body });
      } else if (input.channel === "SMS" && user.phone) {
        sent = await provider.sendSms({ to: user.phone, body: input.body });
      }
    }

    return notificationRepository.updateDeliveryStatus(notification.id, sent ? "SENT" : "FAILED");
  },

  /** Envoie la même notification à plusieurs utilisateurs (ex: toute une classe). */
  async broadcast(input: Omit<CreateNotificationInput, "userId">, userIds: string[]) {
    return Promise.all(userIds.map((userId) => this.create({ ...input, userId })));
  },
};
