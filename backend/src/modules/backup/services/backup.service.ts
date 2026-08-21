import { ValidationError } from "../../../core/errors/AppError";
import { BACKUP_MODELS } from "../utils/backupRegistry";
import { backupRepository } from "../repositories/backup.repository";
import { RestoreBackupInput } from "../validations/backup.validation";

export const backupService = {
  list(schoolId: string) {
    return backupRepository.list(schoolId);
  },

  /**
   * Génère une sauvegarde complète (JSON) des données de l'école, modèle
   * par modèle selon le registre BACKUP_MODELS, et journalise l'opération.
   */
  async createBackup(schoolId: string, triggeredBy?: string) {
    const record = await backupRepository.create({
      schoolId,
      type: "MANUAL",
      status: "PENDING",
      triggeredBy,
    });

    try {
      const payload: Record<string, unknown[]> = {};
      const counts: Record<string, number> = {};

      for (const model of BACKUP_MODELS) {
        const rows = await model.exportRows(schoolId);
        payload[model.name] = rows;
        counts[model.name] = rows.length;
      }

      const json = JSON.stringify({ schoolId, generatedAt: new Date().toISOString(), data: payload });
      const sizeBytes = Buffer.byteLength(json, "utf8");
      const fileName = `e-sekooly-backup-${schoolId}-${Date.now()}.json`;

      await backupRepository.update(record.id, {
        status: "COMPLETED",
        fileName,
        sizeBytes,
        modelCounts: JSON.stringify(counts),
        completedAt: new Date(),
      });

      return { record, json, fileName };
    } catch (error) {
      await backupRepository.update(record.id, {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Erreur inconnue",
        completedAt: new Date(),
      });
      throw error;
    }
  },

  /**
   * Restaure une sauvegarde JSON précédemment générée. Chaque modèle est
   * réimporté via upsert (id inchangé) — les enregistrements existants sont
   * mis à jour, les manquants recréés. Aucune suppression n'est effectuée :
   * une restauration ne peut qu'ajouter/rétablir des données, jamais en
   * supprimer, par sécurité.
   */
  async restore(input: RestoreBackupInput) {
    const results: Record<string, number> = {};

    for (const model of BACKUP_MODELS) {
      const rows = input.data[model.name];
      if (!rows) continue;
      if (!Array.isArray(rows)) {
        throw new ValidationError(`Format invalide pour le modèle ${model.name}`);
      }
      results[model.name] = await model.importRows(input.schoolId, rows);
    }

    return results;
  },
};
