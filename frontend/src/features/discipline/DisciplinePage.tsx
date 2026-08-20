import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useStudents } from "@/features/students/hooks/useStudents";
import { useEffectiveSchoolId } from "@/hooks/useEffectiveSchoolId";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useState } from "react";
import { DisciplineFormModal } from "./components/DisciplineFormModal";
import { DisciplineRecord, DisciplineType, useDisciplineRecords } from "./hooks/useDiscipline";

const TYPE_LABELS: Record<DisciplineType, string> = {
  SANCTION: "Sanction",
  REWARD: "Récompense",
  LATENESS: "Retard",
  OBSERVATION: "Observation",
};

const TYPE_STYLES: Record<DisciplineType, string> = {
  SANCTION: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300",
  REWARD: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300",
  LATENESS: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300",
  OBSERVATION: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300",
};

export default function DisciplinePage() {
  const schoolId = useEffectiveSchoolId();
  const { data: studentsData } = useStudents({ schoolId, pageSize: 100 });
  const [studentId, setStudentId] = useState("");
  const { data: records, isLoading } = useDisciplineRecords(schoolId, studentId || undefined);
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Discipline</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sanctions, récompenses, retards et observations.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" /> Nouvelle entrée
        </Button>
      </div>

      <select
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        className="h-11 max-w-sm rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white"
      >
        <option value="">Tous les élèves</option>
        {studentsData?.data.map((s) => (
          <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
        ))}
      </select>

      <div className="flex flex-col gap-3">
        {isLoading && <Card className="text-center text-sm text-slate-400">Chargement…</Card>}
        {!isLoading && (records?.length ?? 0) === 0 && (
          <Card className="text-center text-sm text-slate-400">Aucune entrée disciplinaire.</Card>
        )}
        {records?.map((record: DisciplineRecord) => (
          <Card key={record.id} className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", TYPE_STYLES[record.type])}>
                  {TYPE_LABELS[record.type]}
                </span>
                <span className="text-xs text-slate-400">{new Date(record.date).toLocaleDateString("fr-FR")}</span>
              </div>
              <h3 className="mt-2 text-sm font-semibold text-slate-800 dark:text-white">{record.title}</h3>
              {record.description && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{record.description}</p>
              )}
              <p className="mt-2 text-xs text-slate-400">
                {record.student.firstName} {record.student.lastName} · {record.student.registrationNo}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <DisciplineFormModal open={formOpen} onClose={() => setFormOpen(false)} schoolId={schoolId} />
    </div>
  );
}
