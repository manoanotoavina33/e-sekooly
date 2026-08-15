import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useClassRooms } from "@/features/academics/classrooms/hooks/useClassRooms";
import { useCashRegisters, useCashSessions } from "@/features/cashier/hooks/useCashSessions";
import { useExamSessions, useExams } from "@/features/examinations/exams/hooks/useExams";
import { useStudents } from "@/features/students/hooks/useStudents";
import { useAuthStore } from "@/hooks/useAuthStore";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { useState } from "react";
import { downloadReport, ReportFormat, ReportSummary } from "../hooks/useReports";

// Champs de filtre pertinents pour chaque rapport (le backend accepte tous
// les champs mais ignore ceux non utilisés par le rapport sélectionné).
const REPORT_FIELDS: Record<string, string[]> = {
  students: ["classRoomId", "status"],
  employees: [],
  attendance: ["classRoomId", "studentId", "from", "to"],
  grades: ["examSession", "exam"],
  discipline: ["studentId", "status"],
  invoices: ["studentId", "status"],
  "cashier-journal": ["cashRegister", "cashSession"],
  "accounting-balance": ["from", "to"],
  "chart-of-accounts": [],
};

export function ReportExportModal({ open, onClose, report }: { open: boolean; onClose: () => void; report: ReportSummary }) {
  const user = useAuthStore((s) => s.user);
  const schoolId = user?.schoolId ?? "";
  const fields = REPORT_FIELDS[report.id] ?? [];

  const [classRoomId, setClassRoomId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [examSessionId, setExamSessionId] = useState("");
  const [examId, setExamId] = useState("");
  const [cashRegisterId, setCashRegisterId] = useState("");
  const [cashSessionId, setCashSessionId] = useState("");
  const [downloadingFormat, setDownloadingFormat] = useState<ReportFormat | null>(null);

  const { data: classRooms } = useClassRooms(schoolId);
  const { data: studentsData } = useStudents({ schoolId, pageSize: 100 });
  const { data: examSessions } = useExamSessions(schoolId);
  const { data: exams } = useExams(examSessionId || undefined);
  const { data: cashRegisters } = useCashRegisters(schoolId);
  const { data: cashSessions } = useCashSessions(cashRegisterId || undefined);

  async function handleExport(format: ReportFormat) {
    setDownloadingFormat(format);
    try {
      await downloadReport(report.id, format, {
        schoolId,
        classRoomId: classRoomId || undefined,
        studentId: studentId || undefined,
        status: status || undefined,
        from: from || undefined,
        to: to || undefined,
        examId: examId || undefined,
        cashSessionId: cashSessionId || undefined,
      });
    } finally {
      setDownloadingFormat(null);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={report.label}>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{report.description}</p>

      <div className="flex flex-col gap-4">
        {fields.includes("classRoomId") && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Classe (optionnel)</label>
            <select value={classRoomId} onChange={(e) => setClassRoomId(e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white">
              <option value="">Toutes les classes</option>
              {classRooms?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}

        {fields.includes("studentId") && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Élève (optionnel)</label>
            <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white">
              <option value="">Tous les élèves</option>
              {studentsData?.data.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
            </select>
          </div>
        )}

        {fields.includes("status") && (
          <Input label="Statut (optionnel)" placeholder="ex: ACTIVE, PAID…" value={status} onChange={(e) => setStatus(e.target.value)} />
        )}

        {(fields.includes("from") || fields.includes("to")) && (
          <div className="grid grid-cols-2 gap-3">
            <Input label="Du" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <Input label="Au" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        )}

        {fields.includes("exam") && (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Session d'examens</label>
              <select value={examSessionId} onChange={(e) => { setExamSessionId(e.target.value); setExamId(""); }} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white">
                <option value="">Sélectionner…</option>
                {examSessions?.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Épreuve</label>
              <select value={examId} onChange={(e) => setExamId(e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white">
                <option value="">Sélectionner…</option>
                {exams?.map((e) => <option key={e.id} value={e.id}>{e.subject.name} — {e.classRoom.name}</option>)}
              </select>
            </div>
          </>
        )}

        {fields.includes("cashSession") && (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Caisse</label>
              <select value={cashRegisterId} onChange={(e) => { setCashRegisterId(e.target.value); setCashSessionId(""); }} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white">
                <option value="">Sélectionner…</option>
                {cashRegisters?.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Session de caisse</label>
              <select value={cashSessionId} onChange={(e) => setCashSessionId(e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white">
                <option value="">Sélectionner…</option>
                {cashSessions?.map((s) => (
                  <option key={s.id} value={s.id}>{new Date(s.openedAt).toLocaleDateString("fr-FR")} — {s.status === "OPEN" ? "Ouverte" : "Clôturée"}</option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className="mt-2 flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={() => handleExport("csv")} isLoading={downloadingFormat === "csv"}>
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Button variant="secondary" onClick={() => handleExport("xlsx")} isLoading={downloadingFormat === "xlsx"}>
            <FileSpreadsheet className="h-4 w-4" /> Excel
          </Button>
          <Button onClick={() => handleExport("pdf")} isLoading={downloadingFormat === "pdf"}>
            <FileText className="h-4 w-4" /> PDF
          </Button>
        </div>
      </div>
    </Modal>
  );
}
