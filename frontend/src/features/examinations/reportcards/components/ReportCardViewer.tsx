import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Download } from "lucide-react";
import { useState } from "react";
import { downloadReportCardPdf, useReportCard } from "../hooks/useReportCard";

export function ReportCardViewer({ examSessionId, studentId }: { examSessionId: string; studentId: string }) {
  const { data: report, isLoading, isError } = useReportCard(examSessionId, studentId);
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      await downloadReportCardPdf(examSessionId, studentId);
    } finally {
      setDownloading(false);
    }
  }

  if (isLoading) return <Card className="text-center text-sm text-slate-400">Calcul du bulletin…</Card>;
  if (isError || !report) {
    return (
      <Card className="text-center text-sm text-slate-400">
        Aucune note trouvée pour cet élève sur cette session.
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-base font-semibold text-slate-800 dark:text-white">
            {report.student.firstName} {report.student.lastName}
          </h3>
          <p className="text-xs text-slate-400">{report.classRoomName} · {report.sessionLabel}</p>
        </div>
        <Button size="sm" variant="secondary" onClick={handleDownload} isLoading={downloading}>
          <Download className="h-4 w-4" /> Télécharger le PDF
        </Button>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-ink-700">
            <th className="py-2 font-medium">Matière</th>
            <th className="py-2 font-medium">Coeff.</th>
            <th className="py-2 font-medium">Moyenne /20</th>
          </tr>
        </thead>
        <tbody>
          {report.subjects.map((s) => (
            <tr key={s.subjectId} className="border-b border-slate-50 last:border-0 dark:border-ink-700">
              <td className="py-2 text-slate-700 dark:text-slate-200">{s.subjectName}</td>
              <td className="py-2 text-slate-500 dark:text-slate-400">{s.coefficient}</td>
              <td className="py-2 font-medium text-slate-800 dark:text-white">{s.average.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid grid-cols-3 gap-3 rounded-xl bg-sky-50 p-4 text-center dark:bg-ink-700">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Moyenne générale</p>
          <p className="font-display text-lg font-bold text-sky-700 dark:text-sky-300">{report.overallAverage.toFixed(2)}/20</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Rang</p>
          <p className="font-display text-lg font-bold text-sky-700 dark:text-sky-300">{report.rank} / {report.totalStudents}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Mention</p>
          <p className="font-display text-lg font-bold text-sky-700 dark:text-sky-300">{report.mention}</p>
        </div>
      </div>
    </Card>
  );
}
