"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.balanceQuerySchema = exports.ledgerQuerySchema = exports.listJournalQuerySchema = exports.createJournalEntrySchema = exports.journalLineSchema = void 0;
const zod_1 = require("zod");
exports.journalLineSchema = zod_1.z.object({
    accountId: zod_1.z.string().uuid(),
    debit: zod_1.z.number().nonnegative().default(0),
    credit: zod_1.z.number().nonnegative().default(0),
});
exports.createJournalEntrySchema = zod_1.z
    .object({
    schoolId: zod_1.z.string().uuid(),
    date: zod_1.z.coerce.date().optional(),
    label: zod_1.z.string().min(2, "Libellé requis"),
    lines: zod_1.z.array(exports.journalLineSchema).min(2, "Une écriture nécessite au moins deux lignes"),
})
    .refine((data) => {
    const totalDebit = data.lines.reduce((sum, l) => sum + l.debit, 0);
    const totalCredit = data.lines.reduce((sum, l) => sum + l.credit, 0);
    return Math.abs(totalDebit - totalCredit) < 0.01;
}, { message: "Le total des débits doit être égal au total des crédits", path: ["lines"] });
exports.listJournalQuerySchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    from: zod_1.z.coerce.date().optional(),
    to: zod_1.z.coerce.date().optional(),
});
exports.ledgerQuerySchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    accountId: zod_1.z.string().uuid(),
    from: zod_1.z.coerce.date().optional(),
    to: zod_1.z.coerce.date().optional(),
});
exports.balanceQuerySchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    from: zod_1.z.coerce.date().optional(),
    to: zod_1.z.coerce.date().optional(),
});
//# sourceMappingURL=journal.validation.js.map