import { accountRepository } from "../../accounting/accounts/repositories/account.repository";
import { journalRepository } from "../../accounting/journal/repositories/journal.repository";
import { studentAttendanceRepository } from "../../attendance/students/repositories/studentAttendance.repository";
import { cashTransactionRepository } from "../../cashier/transactions/repositories/cashTransaction.repository";
import { disciplineRepository } from "../../discipline/repositories/discipline.repository";
import { gradeRepository } from "../../examinations/grades/repositories/grade.repository";
import { invoiceRepository } from "../../finance/invoices/repositories/invoice.repository";
import { studentRepository } from "../../students/repositories/student.repository";
import { employeeRepository } from "../../teachers/repositories/employee.repository";
import { ReportColumn } from "../utils/csvExport";
import { ExportReportQuery } from "../validations/report.validation";

export interface ReportDefinition {
  id: string;
  label: string;
  module: string;
  description: string;
  columns: ReportColumn[];
  fetch: (query: ExportReportQuery) => Promise<Record<string, unknown>[]>;
}

const dateFormat = (v: unknown) => (v ? new Date(v as string).toLocaleDateString("fr-FR") : "");
const numberFormat = (v: unknown) => (typeof v === "number" ? v.toLocaleString("fr-FR") : String(v ?? ""));

export const REPORT_DEFINITIONS: ReportDefinition[] = [
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
      if (!query.schoolId) return [];
      const result = await studentRepository.list({
        schoolId: query.schoolId,
        classRoomId: query.classRoomId,
        status: query.status as never,
        page: 1,
        pageSize: 1000,
      });
      return result.items.map((s: typeof result.items[number]) => ({
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
      if (!query.schoolId) return [];
      const result = await employeeRepository.list({ schoolId: query.schoolId, page: 1, pageSize: 1000 });
      return result.items.map((e: typeof result.items[number]) => ({
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
      if (!query.schoolId) return [];
      const rows = await studentAttendanceRepository.list({
        schoolId: query.schoolId,
        classRoomId: query.classRoomId,
        studentId: query.studentId,
        from: query.from,
        to: query.to,
      });
      return rows.map((r: typeof rows[number]) => ({
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
      if (!query.examId) return [];
      const rows = await gradeRepository.list({ examId: query.examId });
      return rows.map((g: typeof rows[number]) => ({
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
      if (!query.schoolId) return [];
      const rows = await disciplineRepository.list({ schoolId: query.schoolId, studentId: query.studentId, type: query.status as never });
      return rows.map((r: typeof rows[number]) => ({
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
      if (!query.schoolId) return [];
      const rows = await invoiceRepository.list({ schoolId: query.schoolId, studentId: query.studentId, status: query.status as never });
      return rows.map((inv: typeof rows[number]) => ({
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
      if (!query.cashSessionId) return [];
      const rows = await cashTransactionRepository.list({ cashSessionId: query.cashSessionId });
      return rows.map((t: typeof rows[number]) => ({
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
      if (!query.schoolId) return [];
      return journalRepository.balance({ schoolId: query.schoolId, from: query.from, to: query.to });
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
      if (!query.schoolId) return [];
      return accountRepository.list({ schoolId: query.schoolId });
    },
  },
];

export function getReportDefinition(id: string) {
  return REPORT_DEFINITIONS.find((r) => r.id === id);
}
