"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageService = void 0;
const notification_service_1 = require("../../notifications/services/notification.service");
const message_repository_1 = require("../repositories/message.repository");
exports.messageService = {
    async send(input, senderId) {
        const message = await message_repository_1.messageRepository.create(input.schoolId, senderId, input.subject, input.body, input.recipientIds);
        // Notifie chaque destinataire (notification in-app) qu'il a reçu un message.
        await notification_service_1.notificationService.broadcast({
            schoolId: input.schoolId,
            title: `Nouveau message : ${input.subject}`,
            body: input.body.slice(0, 140),
            channel: "IN_APP",
        }, input.recipientIds);
        return message;
    },
    inbox(userId) {
        return message_repository_1.messageRepository.inbox(userId);
    },
    sent(userId) {
        return message_repository_1.messageRepository.sent(userId);
    },
    markRead(messageId, userId) {
        return message_repository_1.messageRepository.markRead(messageId, userId);
    },
};
//# sourceMappingURL=message.service.js.map