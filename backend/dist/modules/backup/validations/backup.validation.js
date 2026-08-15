"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreBackupSchema = exports.listBackupsQuerySchema = exports.createBackupSchema = void 0;
const zod_1 = require("zod");
exports.createBackupSchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
});
exports.listBackupsQuerySchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
});
exports.restoreBackupSchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    // Le contenu JSON de la sauvegarde est transmis tel quel par le frontend
    // (relu depuis le fichier .json sélectionné par l'utilisateur).
    data: zod_1.z.record(zod_1.z.string(), zod_1.z.array(zod_1.z.unknown())),
});
//# sourceMappingURL=backup.validation.js.map