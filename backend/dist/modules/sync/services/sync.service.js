"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncService = void 0;
const syncRegistry_1 = require("./syncRegistry");
const sync_repository_1 = require("../repositories/sync.repository");
exports.syncService = {
    /**
     * PULL : le serveur renvoie, pour chaque modèle synchronisable, les
     * enregistrements modifiés depuis le dernier "since" fourni par
     * l'appareil offline — à appliquer dans la base SQLite locale.
     */
    async pull(query) {
        const data = {};
        let total = 0;
        for (const model of syncRegistry_1.SYNC_MODELS) {
            const rows = await model.pull(query.schoolId, query.since);
            data[model.name] = rows;
            total += rows.length;
        }
        await sync_repository_1.syncRepository.logSync({
            schoolId: query.schoolId,
            deviceId: query.deviceId,
            direction: "PULL",
            status: "SUCCESS",
            recordCount: total,
        });
        return { syncedAt: new Date().toISOString(), data };
    },
    /**
     * PUSH : l'appareil offline envoie ses changements locaux ; le serveur
     * les applique modèle par modèle avec la règle "last write wins" basée
     * sur updatedAt (voir syncRegistry.ts).
     */
    async push(body) {
        const results = {};
        let total = 0;
        let hadError = false;
        let errorMessage;
        for (const model of syncRegistry_1.SYNC_MODELS) {
            const rows = body.changes[model.name];
            if (!rows)
                continue;
            try {
                const count = await model.push(body.schoolId, rows);
                results[model.name] = count;
                total += count;
            }
            catch (error) {
                hadError = true;
                errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
                results[model.name] = 0;
            }
        }
        await sync_repository_1.syncRepository.logSync({
            schoolId: body.schoolId,
            deviceId: body.deviceId,
            direction: "PUSH",
            status: hadError ? "PARTIAL" : "SUCCESS",
            recordCount: total,
            errorMessage,
        });
        return { syncedAt: new Date().toISOString(), results };
    },
    history(schoolId) {
        return sync_repository_1.syncRepository.history(schoolId);
    },
};
//# sourceMappingURL=sync.service.js.map