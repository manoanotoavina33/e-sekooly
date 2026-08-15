"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REPORT_DEFINITIONS = void 0;
exports.getReportDefinition = getReportDefinition;
const account_repository_1 = require("../../accounting/accounts/repositories/account.repository");
const journal_repository_1 = require("../../accounting/journal/repositories/journal.repository");
const studentAttendance_repository_1 = require("../../attendance/students/repositories/studentAttendance.repository");
const cashTransaction_repository_1 = require("../../cashier/transactions/repositories/cashTransaction.repository");
const discipline_repository_1 = require("../../discipline/repositories/discipline.repository");
const grade_repository_1 = require("../../examinations/grades/repositories/grade.repository");
const invoice_repository_1 = require("../../finance/invoices/repositories/invoice.repository");
const student_repository_1 = require("../../students/repositories/student.repository");
const employee_repository_1 = require("../../teachers/repositories/employee.repository");
const dateFormat = (v) => (v ? new Date(v).toLocaleDateString("fr-FR") : "");
const numberFormat = (v) => (typeof v === "number" ? v.toLocaleString("fr-FR") : String(v ?? ""));
exports.REPORT_DEFINITIONS = [
    {
        id: "students",
        label: "Liste des élèves",
        module: "students",
        description: "Élèves inscrits, avec classe et statut.",
        columns: [
            { key: "registrationNo", header: "Matricule" },
            { key: "lastName", header: "Nom" },
            { key: "firstName", header: "Prénom" },
            { key: "className", header: "Classe" },
            { key: "status", header: "Statut" },
        ],
        async fetch(query) {
            if (!query.schoolId)
                return [];
            const result = await student_repository_1.studentRepository.list({
                schoolId: query.schoolId,
                classRoomId: query.classRoomId,
                status: query.status,
                page: 1,
                pageSize: 1000,
            });
            return result.items.map((s) => ({
                registrationNo: s.registrationNo,
                lastName: s.lastName,
                firstName: s.firstName,
                className: s.classRoom?.name ?? "—",
                status: s.status,
            }));
        },
    },
    {
        id: "employees",
        label: "Liste du personnel",
        module: "hr",
        description: "Enseignants et personnel administratif.",
        columns: [
            { key: "employeeNo", header: "Matricule" },
            { key: "lastName", header: "Nom" },
            { key: "firstName", header: "Prénom" },
            { key: "position", header: "Poste" },
            { key: "department", header: "Département" },
        ],
        async fetch(query) {
            if (!query.schoolId)
                return [];
            const result = await employee_repository_1.employeeRepository.list({ schoolId: query.schoolId, page: 1, pageSize: 1000 });
            return result.items.map((e) => ({
                employeeNo: e.employeeNo,
                lastName: e.user.lastName,
                firstName: e.user.firstName,
                position: e.position,
                department: e.department ?? "—",
            }));
        },
    },
    {
        id: "attendance",
        label: "Présence des élèves",
        module: "attendance",
        description: "Historique de présence (par classe et période).",
        columns: [
            { key: "date", header: "Date", format: dateFormat },
            { key: "studentName", header: "Élève" },
            { key: "registrationNo", header: "Matricule" },
            { key: "status", header: "Statut" },
            { key: "method", header: "Méthode" },
        ],
        async fetch(query) {
            if (!query.schoolId)
                return [];
            const rows = await studentAttendance_repository_1.studentAttendanceRepository.list({
                schoolId: query.schoolId,
                classRoomId: query.classRoomId,
                studentId: query.studentId,
                from: query.from,
                to: query.to,
            });
            return rows.map((r) => ({
                date: r.date,
                studentName: `${r.student.firstName} ${r.student.lastName}`,
                registrationNo: r.student.registrationNo,
                status: r.status,
                method: r.method,
            }));
        },
    },
    {
        id: "grades",
        label: "Relevé de notes",
        module: "grades",
        description: "Notes saisies pour une épreuve donnée.",
        columns: [
            { key: "studentName", header: "Élève" },
            { key: "registrationNo", header: "Matricule" },
            { key: "score", header: "Note", format: numberFormat },
        ],
        async fetch(query) {
            if (!query.examId)
                return [];
            const rows = await grade_repository_1.gradeRepository.list({ examId: query.examId });
            return rows.map((g) => ({
                studentName: `${g.student.firstName} ${g.student.lastName}`,
                registrationNo: g.student.registrationNo,
                score: g.score,
            }));
        },
    },
    {
        id: "discipline",
        label: "Registre disciplinaire",
        module: "discipline",
        description: "Sanctions, récompenses, retards et observations.",
        columns: [
            { key: "date", header: "Date", format: dateFormat },
            { key: "studentName", header: "Élève" },
            { key: "type", header: "Type" },
            { key: "severity", header: "Gravité" },
            { key: "title", header: "Titre" },
        ],
        async fetch(query) {
            if (!query.schoolId)
                return [];
            const rows = await discipline_repository_1.disciplineRepository.list({ schoolId: query.schoolId, studentId: query.studentId, type: query.status });
            return rows.map((r) => ({
                date: r.date,
                studentName: `${r.student.firstName} ${r.student.lastName}`,
                type: r.type,
                severity: r.severity,
                title: r.title,
            }));
        },
    },
    {
        id: "invoices",
        label: "Factures",
        module: "finance",
        description: "Factures émises, avec montant net et statut.",
        columns: [
            { key: "invoiceNo", header: "Facture" },
            { key: "studentName", header: "Élève" },
            { key: "category", header: "Catégorie" },
            { key: "amount", header: "Montant net", format: numberFormat },
            { key: "status", header: "Statut" },
        ],
        async fetch(query) {
            if (!query.schoolId)
                return [];
            const rows = await invoice_repository_1.invoiceRepository.list({ schoolId: query.schoolId, studentId: query.studentId, status: query.status });
            return rows.map((inv) => ({
                invoiceNo: inv.invoiceNo,
                studentName: `${inv.student.firstName} ${inv.student.lastName}`,
                category: inv.feeCategory.name,
                amount: inv.amount - inv.discountAmount,
                status: inv.status,
            }));
        },
    },
    {
        id: "cashier-journal",
        label: "Journal de caisse",
        module: "cashier",
        description: "Mouvements d'une session de caisse.",
        columns: [
            { key: "receiptNo", header: "Reçu" },
            { key: "type", header: "Type" },
            { key: "category", header: "Catégorie" },
            { key: "amount", header: "Montant", format: numberFormat },
            { key: "status", header: "Statut" },
        ],
        async fetch(query) {
            if (!query.cashSessionId)
                return [];
            const rows = await cashTransaction_repository_1.cashTransactionRepository.list({ cashSessionId: query.cashSessionId });
            return rows.map((t) => ({
                receiptNo: t.receiptNo,
                type: t.type === "IN" ? "Entrée" : "Sortie",
                category: t.category,
                amount: t.amount,
                status: t.status,
            }));
        },
    },
    {
        id: "accounting-balance",
        label: "Balance comptable",
        module: "accounting",
        description: "Débit / crédit / solde par compte sur une période.",
        columns: [
            { key: "accountCode", header: "Code" },
            { key: "accountName", header: "Compte" },
            { key: "debit", header: "Débit", format: numberFormat },
            { key: "credit", header: "Crédit", format: numberFormat },
            { key: "balance", header: "Solde", format: numberFormat },
        ],
        async fetch(query) {
            if (!query.schoolId)
                return [];
            return journal_repository_1.journalRepository.balance({ schoolId: query.schoolId, from: query.from, to: query.to });
        },
    },
    {
        id: "chart-of-accounts",
        label: "Plan comptable",
        module: "accounting",
        description: "Liste des comptes de l'établissement.",
        columns: [
            { key: "code", header: "Code" },
            { key: "name", header: "Nom" },
            { key: "type", header: "Type" },
        ],
        async fetch(query) {
            if (!query.schoolId)
                return [];
            return account_repository_1.accountRepository.list({ schoolId: query.schoolId });
        },
    },
];
function getReportDefinition(id) {
    return exports.REPORT_DEFINITIONS.find((r) => r.id === id);
}
//# sourceMappingURL=reportDefinitions.js.map