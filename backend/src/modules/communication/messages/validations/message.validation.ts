import { z } from "zod";

export const sendMessageSchema = z.object({
  schoolId: z.string().uuid(),
  subject: z.string().min(1, "Objet requis"),
  body: z.string().min(1, "Le message ne peut être vide"),
  recipientIds: z.array(z.string().uuid()).min(1, "Au moins un destinataire requis"),
});
export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export const updateMessageSchema = sendMessageSchema.partial().extend({
  schoolId: z.string().uuid().optional(),
  recipientIds: z.array(z.string().uuid()).optional(),
});
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;
