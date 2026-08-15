import { z } from "zod";

export const createFeeCategorySchema = z.object({
  schoolId: z.string().uuid(),
  name: z.string().min(1, "Nom requis"),
  description: z.string().optional(),
});
export type CreateFeeCategoryInput = z.infer<typeof createFeeCategorySchema>;

export const listFeeCategoriesQuerySchema = z.object({
  schoolId: z.string().uuid(),
});
export type ListFeeCategoriesQuery = z.infer<typeof listFeeCategoriesQuerySchema>;
