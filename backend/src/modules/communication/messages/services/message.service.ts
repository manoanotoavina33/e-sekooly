import { notificationService } from "../../notifications/services/notification.service";
import { messageRepository } from "../repositories/message.repository";
import { SendMessageInput } from "../validations/message.validation";

export const messageService = {
  async send(input: SendMessageInput, senderId: string) {
    const message = await messageRepository.create(
      input.schoolId,
      senderId,
      input.subject,
      input.body,
      input.recipientIds
    );

    // Notifie chaque destinataire (notification in-app) qu'il a reçu un message.
    await notificationService.broadcast(
      {
        schoolId: input.schoolId,
        title: `Nouveau message : ${input.subject}`,
        body: input.body.slice(0, 140),
        channel: "IN_APP",
      },
      input.recipientIds
    );

    return message;
  },

  inbox(userId: string) {
    return messageRepository.inbox(userId);
  },

  sent(userId: string) {
    return messageRepository.sent(userId);
  },

  markRead(messageId: string, userId: string) {
    return messageRepository.markRead(messageId, userId);
  },
};
