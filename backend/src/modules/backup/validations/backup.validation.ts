import { z } from "zod";

export const createBackupSchema = z.object({
  schoolId: z.string().uuid(),
});
export type CreateBackupInput = z.infer<typeof createBackupSchema>;

export const listBackupsQuerySchema = z.object({
  schoolId: z.string().uuid(),
});
export type ListBackupsQuery = z.infer<typeof listBackupsQuerySchema>;

export const restoreBackupSchema = z.object({
  schoolId: z.string().uuid(),
  // Le contenu JSON de la sauvegarde est transmis tel quel par le frontend
  // (relu depuis le fichier .json sélectionné par l'utilisateur).
  data: z.record(z.string(), z.array(z.unknown())),
});
export type RestoreBackupInput = z.infer<typeof restoreBackupSchema>;
