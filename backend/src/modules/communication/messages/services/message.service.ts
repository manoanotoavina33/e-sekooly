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

  async getById(messageId: string, userId: string) {
    return messageRepository.findById(messageId, userId);
  },

  async update(messageId: string, userId: string, data: { subject?: string; body?: string }) {
    return messageRepository.update(messageId, userId, data);
  },

  async delete(messageId: string, userId: string) {
    return messageRepository.delete(messageId, userId);
  },

  markRead(messageId: string, userId: string) {
    return messageRepository.markRead(messageId, userId);
  },
};
