import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useStudents } from "@/features/students/hooks/useStudents";
import { useAuthStore } from "@/hooks/useAuthStore";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ExamFormModal } from "./exams/components/ExamFormModal";
import { ExamSessionFormModal } from "./exams/components/ExamSessionFormModal";
import { useExamSessions, useExams } from "./exams/hooks/useExams";
import { GradeEntryTable } from "./grades/components/GradeEntryTable";
import { ReportCardViewer } from "./reportcards/components/ReportCardViewer";

const TYPE_LABELS: Record<string, string> = {
  DEVOIR: "Devoir",
  COMPOSITION: "Composition",
  EXAM_BLANC: "Examen blanc",
  EXAM_OFFICIEL: "Examen officiel",
};

export default function ExaminationsPage() {
  const user = useAuthStore((s) => s.user);
  const schoolId = user?.schoolId ?? "";
  const [tab, setTab] = useState<"sessions" | "grades" | "reportcards">("sessions");

  const { data: sessions } = useExamSessions(schoolId);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const { data: exams } = useExams(selectedSessionId || undefined);
  const [selectedExamId, setSelectedExamId] = useState("");

  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [examModalOpen, setExamModalOpen] = useState(false);

  const { data: reportStudents } = useStudents({ schoolId, pageSize: 100 });
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const selectedExam = exams?.find((e) => e.id === selectedExamId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Examens &amp; Notes</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Sessions d'examens, saisie des notes, et bulletins avec moyenne, classement et mention.
        </p>
      </div>

      <div className="flex gap-2 border-b border-slate-100 dark:border-ink-700">
        {(["sessions", "grades", "reportcards"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              tab === t
                ? "border-sky-500 text-sky-600 dark:text-sky-400"
                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            )}
          >
            {t === "sessions" ? "Sessions & Épreuves" : t === "grades" ? "Saisie des notes" : "Bulletins"}
          </button>
        ))}
      </div>

      {/* Sélecteur de session, commun aux 3 onglets */}
      <Card className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Session d'examens</label>
          <select
            value={selectedSessionId}
            onChange={(e) => { setSelectedSessionId(e.target.value); setSelectedExamId(""); }}
            className="h-11 min-w-[260px] rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white"
          >
            <option value="">Sélectionner…</option>
            {sessions?.map((s) => (
              <option key={s.id} value={s.id}>{s.label} ({TYPE_LABELS[s.type]})</option>
            ))}
          </select>
        </div>
        <Button variant="secondary" size="md" onClick={() => setSessionModalOpen(true)}>
          <Plus className="h-4 w-4" /> Nouvelle session
        </Button>
      </Card>

      {tab === "sessions" && (
        <div className="flex flex-col gap-4">
          {selectedSessionId && (
            <div className="flex justify-end">
              <Button onClick={() => setExamModalOpen(true)}>
                <Plus className="h-4 w-4" /> Ajouter une épreuve
              </Button>
            </div>
          )}
          <Card className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-ink-700">
                  <th className="px-5 py-3 font-medium">Matière</th>
                  <th className="px-5 py-3 font-medium">Classe</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Barème</th>
                  <th className="px-5 py-3 font-medium">Notes saisies</th>
                </tr>
              </thead>
              <tbody>
                {!selectedSessionId && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">Sélectionnez une session pour voir ses épreuves.</td></tr>
                )}
                {selectedSessionId && (exams?.length ?? 0) === 0 && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">Aucune épreuve ajoutée à cette session.</td></tr>
                )}
                {exams?.map((exam) => (
                  <tr key={exam.id} className="border-b border-slate-50 last:border-0 hover:bg-sky-50/50 dark:border-ink-700 dark:hover:bg-ink-700/40">
                    <td className="px-5 py-3 font-medium text-slate-800 dark:text-white">{exam.subject.name}</td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{exam.classRoom.name}</td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{new Date(exam.date).toLocaleDateString("fr-FR")}</td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">/{exam.maxScore}</td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{exam._count?.grades ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {tab === "grades" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Épreuve</label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="h-11 max-w-md rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white"
            >
              <option value="">Sélectionner une épreuve…</option>
              {exams?.map((e) => (
                <option key={e.id} value={e.id}>{e.subject.name} — {e.classRoom.name}</option>
              ))}
            </select>
          </div>
          {selectedExam ? (
            <GradeEntryTable schoolId={schoolId} exam={selectedExam} />
          ) : (
            <Card className="text-center text-sm text-slate-400">Sélectionnez une épreuve pour saisir les notes.</Card>
          )}
        </div>
      )}

      {tab === "reportcards" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Élève</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="h-11 max-w-md rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white"
            >
              <option value="">Sélectionner un élève…</option>
              {reportStudents?.data.map((s) => (
                <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.registrationNo})</option>
              ))}
            </select>
          </div>
          {selectedSessionId && selectedStudentId ? (
            <ReportCardViewer examSessionId={selectedSessionId} studentId={selectedStudentId} />
          ) : (
            <Card className="text-center text-sm text-slate-400">
              Sélectionnez une session et un élève pour générer le bulletin.
            </Card>
          )}
        </div>
      )}

      <ExamSessionFormModal open={sessionModalOpen} onClose={() => setSessionModalOpen(false)} schoolId={schoolId} />
      {selectedSessionId && (
        <ExamFormModal
          open={examModalOpen}
          onClose={() => setExamModalOpen(false)}
          schoolId={schoolId}
          examSessionId={selectedSessionId}
        />
      )}
    </div>
  );
}
