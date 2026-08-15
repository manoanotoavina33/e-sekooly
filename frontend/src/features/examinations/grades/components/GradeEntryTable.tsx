import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useStudents } from "@/features/students/hooks/useStudents";
import { Exam } from "@/features/examinations/exams/hooks/useExams";
import { useEffect, useMemo, useState } from "react";
import { useGrades, useSaveGrades } from "../hooks/useGrades";

export function GradeEntryTable({ schoolId, exam }: { schoolId: string; exam: Exam }) {
  const { data: studentsData } = useStudents({ schoolId, classRoomId: exam.classRoom.id, pageSize: 100 });
  const students = studentsData?.data ?? [];
  const { data: existingGrades } = useGrades(exam.id);
  const saveGrades = useSaveGrades();

  const [scores, setScores] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!existingGrades) return;
    const initial: Record<string, string> = {};
    for (const g of existingGrades) initial[g.studentId] = String(g.score);
    setScores(initial);
  }, [existingGrades]);

  const entries = useMemo(
    () =>
      students
        .filter((s) => scores[s.id] !== undefined && scores[s.id] !== "")
        .map((s) => ({ studentId: s.id, score: Number(scores[s.id]) })),
    [students, scores]
  );

  async function handleSave() {
    setSaved(false);
    await saveGrades.mutateAsync({ examId: exam.id, entries });
    setSaved(true);
  }

  return (
    <Card className="flex flex-col gap-4 p-0">
      <div className="flex items-center justify-between px-5 pt-5">
        <h3 className="font-display text-sm font-semibold text-slate-800 dark:text-white">
          {exam.subject.name} — {exam.classRoom.name} (barème /{exam.maxScore})
        </h3>
        <Button size="sm" onClick={handleSave} isLoading={saveGrades.isPending} disabled={entries.length === 0}>
          Enregistrer les notes
        </Button>
      </div>
      {saved && <p className="px-5 text-xs text-emerald-600">Notes enregistrées ✓</p>}
      {saveGrades.isError && (
        <p className="px-5 text-xs text-red-500">Une note dépasse peut-être le barème autorisé.</p>
      )}

      <div className="divide-y divide-slate-50 dark:divide-ink-700">
        {students.map((student) => (
          <div key={student.id} className="flex items-center justify-between gap-3 px-5 py-2.5">
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-white">
                {student.firstName} {student.lastName}
              </p>
              <p className="font-mono text-xs text-slate-400">{student.registrationNo}</p>
            </div>
            <input
              type="number"
              step="0.25"
              min={0}
              max={exam.maxScore}
              value={scores[student.id] ?? ""}
              onChange={(e) => setScores((prev) => ({ ...prev, [student.id]: e.target.value }))}
              className="h-9 w-24 rounded-lg border border-slate-200 bg-white px-3 text-right text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white"
              placeholder="—"
            />
          </div>
        ))}
        {students.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-slate-400">Aucun élève dans cette classe.</p>
        )}
      </div>
    </Card>
  );
}
