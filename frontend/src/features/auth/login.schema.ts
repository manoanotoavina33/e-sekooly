import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  password: z.string().min(8, "8 caractères minimum"),
  otpCode: z.string().optional(),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
