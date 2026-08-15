import { z } from "zod";

export const listUsersQuerySchema = z.object({
  schoolId: z.string().uuid().optional(),
  role: z.string().optional(),
  search: z.string().optional(),
});
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export const createUserSchema = z.object({
  schoolId: z.string().uuid(),
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  email: z.string().email("E-mail invalide"),
  password: z.string().min(6, "Mot de passe minimum 6 caractères"),
  roleIds: z.array(z.string().uuid()).min(1, "Au moins un rôle requis"),
  isActive: z.boolean().optional(),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  firstName: z.string().min(1, "Prénom requis").optional(),
  lastName: z.string().min(1, "Nom requis").optional(),
  email: z.string().email("E-mail invalide").optional(),
  password: z.string().min(6, "Mot de passe minimum 6 caractères").optional().or(z.literal("")),
  roleIds: z.array(z.string().uuid()).min(1, "Au moins un rôle requis").optional(),
  isActive: z.boolean().optional(),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
