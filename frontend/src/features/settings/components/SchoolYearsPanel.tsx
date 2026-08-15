import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useState } from "react";
import {
  School,
  useCreateSchoolYear,
  useCreateSemester,
  useSetCurrentSchoolYear,
} from "../hooks/useSchoolSettings";

export function SchoolYearsPanel({ school }: { school: School }) {
  const [label, setLabel] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [semesterFormFor, setSemesterFormFor] = useState<string | null>(null);
  const [semesterLabel, setSemesterLabel] = useState("");
  const [semesterStart, setSemesterStart] = useState("");
  const [semesterEnd, setSemesterEnd] = useState("");

  const createYear = useCreateSchoolYear(school.id);
  const setCurrentYear = useSetCurrentSchoolYear(school.id);
  const createSemester = useCreateSemester(school.id);

  async function handleCreateYear(e: React.FormEvent) {
    e.preventDefault();
    await createYear.mutateAsync({ label, startDate, endDate });
    setLabel("");
    setStartDate("");
    setEndDate("");
  }

  async function handleCreateSemester(e: React.FormEvent, schoolYearId: string) {
    e.preventDefault();
    await createSemester.mutateAsync({ schoolYearId, label: semesterLabel, startDate: semesterStart, endDate: semesterEnd });
    setSemesterFormFor(null);
    setSemesterLabel("");
    setSemesterStart("");
    setSemesterEnd("");
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <h3 className="mb-3 font-display text-sm font-semibold text-slate-800 dark:text-white">Nouvelle année scolaire</h3>
        <form onSubmit={handleCreateYear} className="flex flex-wrap items-end gap-3">
          <Input label="Libellé" placeholder="2026-2027" value={label} onChange={(e) => setLabel(e.target.value)} className="w-40" />
          <Input label="Début" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label="Fin" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <Button type="submit" isLoading={createYear.isPending}>
            <Plus className="h-4 w-4" /> Créer
          </Button>
        </form>
      </Card>

      {school.schoolYears.map((year) => (
        <Card key={year.id} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-sm font-semibold text-slate-800 dark:text-white">{year.label}</h3>
              {year.isCurrent && (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
                  Année en cours
                </span>
              )}
            </div>
            {!year.isCurrent && (
              <Button size="sm" variant="secondary" onClick={() => setCurrentYear.mutate(year.id)} isLoading={setCurrentYear.isPending}>
                Définir comme année en cours
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {year.semesters.map((s) => (
              <span key={s.id} className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 dark:bg-ink-700 dark:text-sky-300">
                {s.label}
              </span>
            ))}
            <button
              onClick={() => setSemesterFormFor(semesterFormFor === year.id ? null : year.id)}
              className={cn(
                "rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs text-slate-500 hover:border-sky-400 hover:text-sky-600 dark:border-ink-700 dark:text-slate-400"
              )}
            >
              + Semestre/Trimestre
            </button>
          </div>

          {semesterFormFor === year.id && (
            <form onSubmit={(e) => handleCreateSemester(e, year.id)} className="flex flex-wrap items-end gap-3 border-t border-slate-100 pt-3 dark:border-ink-700">
              <Input label="Libellé" placeholder="Trimestre 1" value={semesterLabel} onChange={(e) => setSemesterLabel(e.target.value)} className="w-40" />
              <Input label="Début" type="date" value={semesterStart} onChange={(e) => setSemesterStart(e.target.value)} />
              <Input label="Fin" type="date" value={semesterEnd} onChange={(e) => setSemesterEnd(e.target.value)} />
              <Button type="submit" size="sm" isLoading={createSemester.isPending}>Ajouter</Button>
            </form>
          )}
        </Card>
      ))}

      {school.schoolYears.length === 0 && (
        <Card className="text-center text-sm text-slate-400">Aucune année scolaire créée.</Card>
      )}
    </div>
  );
}
