"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const prisma_1 = require("../../../../config/prisma");
const notificationProvider_1 = require("../../providers/notificationProvider");
const notification_repository_1 = require("../repositories/notification.repository");
exports.notificationService = {
    listForUser(userId, unreadOnly) {
        return notification_repository_1.notificationRepository.listForUser(userId, unreadOnly);
    },
    markRead(id, userId) {
        return notification_repository_1.notificationRepository.markRead(id, userId);
    },
    markAllRead(userId) {
        return notification_repository_1.notificationRepository.markAllRead(userId);
    },
    /**
     * Crée une notification en base et, si un canal externe (EMAIL/SMS) est
     * demandé, tente de la relayer via le fournisseur configuré (voir
     * communication/providers). Le champ delivery_status reflète le résultat.
     */
    async create(input) {
        const notification = await notification_repository_1.notificationRepository.create({
            schoolId: input.schoolId,
            title: input.title,
            body: input.body,
            channel: input.channel,
            link: input.link,
            user: { connect: { id: input.userId } },
        });
        if (input.channel === "IN_APP") {
            return notification_repository_1.notificationRepository.updateDeliveryStatus(notification.id, "SENT");
        }
        const user = await prisma_1.prisma.user.findUnique({ where: { id: input.userId } });
        const provider = (0, notificationProvider_1.getNotificationProvider)();
        let sent = false;
        if (user) {
            if (input.channel === "EMAIL") {
                sent = await provider.sendEmail({ to: user.email, subject: input.title, body: input.body });
            }
            else if (input.channel === "SMS" && user.phone) {
                sent = await provider.sendSms({ to: user.phone, body: input.body });
            }
        }
        return notification_repository_1.notificationRepository.updateDeliveryStatus(notification.id, sent ? "SENT" : "FAILED");
    },
    /** Envoie la même notification à plusieurs utilisateurs (ex: toute une classe). */
    async broadcast(input, userIds) {
        return Promise.all(userIds.map((userId) => this.create({ ...input, userId })));
    },
};
//# sourceMappingURL=notification.service.js.map