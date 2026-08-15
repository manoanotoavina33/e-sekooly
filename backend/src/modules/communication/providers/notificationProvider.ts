/**
 * Interface d'envoi de notifications externes (e-mail / SMS). e-sekooly ne
 * dépend d'aucun fournisseur précis : branchez votre prestataire (SMTP,
 * Twilio, Vonage, Orange SMS API, etc.) en implémentant cette interface,
 * puis en l'enregistrant dans `communication/providers/index.ts`.
 *
 * En l'absence de configuration, `ConsoleNotificationProvider` journalise
 * les envois côté serveur (pratique en développement) et marque la
 * notification correspondante comme "FAILED" côté delivery_status pour
 * signaler qu'aucun envoi réel n'a eu lieu.
 */
export interface NotificationProvider {
  sendEmail(params: { to: string; subject: string; body: string }): Promise<boolean>;
  sendSms(params: { to: string; body: string }): Promise<boolean>;
}

export class ConsoleNotificationProvider implements NotificationProvider {
  async sendEmail(params: { to: string; subject: string; body: string }) {
    // eslint-disable-next-line no-console
    console.log(`[EMAIL non configuré] À: ${params.to} | Sujet: ${params.subject}`);
    return false;
  }

  async sendSms(params: { to: string; body: string }) {
    // eslint-disable-next-line no-console
    console.log(`[SMS non configuré] À: ${params.to} | Message: ${params.body}`);
    return false;
  }
}

/**
 * Sélectionne le fournisseur actif. Étend cette fonction pour brancher un
 * vrai service (ex: si SMTP_HOST est défini, retourner un SmtpProvider
 * basé sur nodemailer ; si TWILIO_SID est défini, retourner un
 * TwilioProvider). Par défaut, aucun fournisseur externe n'est configuré.
 */
export function getNotificationProvider(): NotificationProvider {
  return new ConsoleNotificationProvider();
}
