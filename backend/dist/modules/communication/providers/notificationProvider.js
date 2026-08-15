"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleNotificationProvider = void 0;
exports.getNotificationProvider = getNotificationProvider;
class ConsoleNotificationProvider {
    async sendEmail(params) {
        // eslint-disable-next-line no-console
        console.log(`[EMAIL non configuré] À: ${params.to} | Sujet: ${params.subject}`);
        return false;
    }
    async sendSms(params) {
        // eslint-disable-next-line no-console
        console.log(`[SMS non configuré] À: ${params.to} | Message: ${params.body}`);
        return false;
    }
}
exports.ConsoleNotificationProvider = ConsoleNotificationProvider;
/**
 * Sélectionne le fournisseur actif. Étend cette fonction pour brancher un
 * vrai service (ex: si SMTP_HOST est défini, retourner un SmtpProvider
 * basé sur nodemailer ; si TWILIO_SID est défini, retourner un
 * TwilioProvider). Par défaut, aucun fournisseur externe n'est configuré.
 */
function getNotificationProvider() {
    return new ConsoleNotificationProvider();
}
//# sourceMappingURL=notificationProvider.js.map