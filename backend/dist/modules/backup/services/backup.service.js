"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupService = void 0;
const AppError_1 = require("../../../core/errors/AppError");
const backupRegistry_1 = require("../utils/backupRegistry");
const backup_repository_1 = require("../repositories/backup.repository");
exports.backupService = {
    list(schoolId) {
        return backup_repository_1.backupRepository.list(schoolId);
    },
    /**
     * Génère une sauvegarde complète (JSON) des données de l'école, modèle
     * par modèle selon le registre BACKUP_MODELS, et journalise l'opération.
     */
    async createBackup(schoolId, triggeredBy) {
        const record = await backup_repository_1.backupRepository.create({
            schoolId,
            type: "MANUAL",
            status: "PENDING",
            triggeredBy,
        });
        try {
            const payload = {};
            const counts = {};
            for (const model of backupRegistry_1.BACKUP_MODELS) {
                const rows = await model.exportRows(schoolId);
                payload[model.name] = rows;
                counts[model.name] = rows.length;
            }
            const json = JSON.stringify({ schoolId, generatedAt: new Date().toISOString(), data: payload });
            const sizeBytes = Buffer.byteLength(json, "utf8");
            const fileName = `e-sekooly-backup-${schoolId}-${Date.now()}.json`;
            await backup_repository_1.backupRepository.update(record.id, {
                status: "COMPLETED",
                fileName,
                sizeBytes,
                modelCounts: JSON.stringify(counts),
                completedAt: new Date(),
            });
            return { record, json, fileName };
        }
        catch (error) {
            await backup_repository_1.backupRepository.update(record.id, {
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
    async restore(input) {
        const results = {};
        for (const model of backupRegistry_1.BACKUP_MODELS) {
            const rows = input.data[model.name];
            if (!rows)
                continue;
            if (!Array.isArray(rows)) {
                throw new AppError_1.ValidationError(`Format invalide pour le modèle ${model.name}`);
            }
            results[model.name] = await model.importRows(input.schoolId, rows);
        }
        return results;
    },
};
//# sourceMappingURL=backup.service.js.map