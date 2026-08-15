import { SYNC_MODELS } from "./syncRegistry";
import { syncRepository } from "../repositories/sync.repository";
import { PullQuery, PushBody } from "../validations/sync.validation";

export const syncService = {
  /**
   * PULL : le serveur renvoie, pour chaque modèle synchronisable, les
   * enregistrements modifiés depuis le dernier "since" fourni par
   * l'appareil offline — à appliquer dans la base SQLite locale.
   */
  async pull(query: PullQuery) {
    const data: Record<string, unknown[]> = {};
    let total = 0;

    for (const model of SYNC_MODELS) {
      const rows = await model.pull(query.schoolId, query.since);
      data[model.name] = rows;
      total += rows.length;
    }

    await syncRepository.logSync({
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
  async push(body: PushBody) {
    const results: Record<string, number> = {};
    let total = 0;
    let hadError = false;
    let errorMessage: string | undefined;

    for (const model of SYNC_MODELS) {
      const rows = body.changes[model.name];
      if (!rows) continue;
      try {
        const count = await model.push(body.schoolId, rows);
        results[model.name] = count;
        total += count;
      } catch (error) {
        hadError = true;
        errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        results[model.name] = 0;
      }
    }

    await syncRepository.logSync({
      schoolId: body.schoolId,
      deviceId: body.deviceId,
      direction: "PUSH",
      status: hadError ? "PARTIAL" : "SUCCESS",
      recordCount: total,
      errorMessage,
    });

    return { syncedAt: new Date().toISOString(), results };
  },

  history(schoolId: string) {
    return syncRepository.history(schoolId);
  },
};
