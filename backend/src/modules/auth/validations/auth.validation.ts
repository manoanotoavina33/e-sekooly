import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  otpCode: z.string().length(6, "Le code 2FA doit contenir 6 chiffres").optional(),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});
export type RefreshInput = z.infer<typeof refreshSchema>;

export const enable2faSchema = z.object({
  otpCode: z.string().length(6, "Code à 6 chiffres requis"),
});
export type Enable2faInput = z.infer<typeof enable2faSchema>;

export const registerUserSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  schoolId: z.string().uuid().optional(),
  roles: z.array(
    z.enum([
      "SUPER_ADMIN",
      "ADMIN",
      "DIRECTOR",
      "SECRETARY",
      "ACCOUNTANT",
      "TEACHER",
      "SUPERVISOR",
      "PARENT",
      "STUDENT",
    ])
  ).min(1, "Au moins un rôle est requis"),
});
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
