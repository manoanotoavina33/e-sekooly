"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageService = void 0;
const notification_service_1 = require("../../notifications/services/notification.service");
const message_repository_1 = require("../repositories/message.repository");
exports.messageService = {
    async send(input, senderId) {
        const message = await message_repository_1.messageRepository.create(input.schoolId, senderId, input.subject, input.body, input.recipientIds);
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
    async getById(messageId, userId) {
        return message_repository_1.messageRepository.findById(messageId, userId);
    },
    async update(messageId, userId, data) {
        return message_repository_1.messageRepository.update(messageId, userId, data);
    },
    async delete(messageId, userId) {
        return message_repository_1.messageRepository.delete(messageId, userId);
    },
    markRead(messageId, userId) {
        return message_repository_1.messageRepository.markRead(messageId, userId);
    },
};
//# sourceMappingURL=message.service.js.map