import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { AlertTriangle, Download, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useBackups, useCreateBackup, useRestoreBackup } from "../hooks/useBackup";

function formatSize(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300",
  PENDING: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300",
  FAILED: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300",
};

export function BackupPanel({ schoolId }: { schoolId: string }) {
  const { data: backups, isLoading } = useBackups(schoolId);
  const createBackup = useCreateBackup(schoolId);
  const restoreBackup = useRestoreBackup(schoolId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreResult, setRestoreResult] = useState<Record<string, number> | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const results = await restoreBackup.mutateAsync(file);
    setRestoreResult(results);
    e.target.value = "";
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-sm font-semibold text-slate-800 dark:text-white">Sauvegarde</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Génère un fichier JSON complet des données de l'établissement, téléchargé immédiatement.
          </p>
        </div>
        <Button onClick={() => createBackup.mutate()} isLoading={createBackup.isPending}>
          <Download className="h-4 w-4" /> Sauvegarder maintenant
        </Button>
      </Card>

      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-sm font-semibold text-slate-800 dark:text-white">Restauration</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sélectionnez un fichier de sauvegarde .json précédemment généré.
            </p>
          </div>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()} isLoading={restoreBackup.isPending}>
            <Upload className="h-4 w-4" /> Restaurer un fichier
          </Button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />
        </div>

        <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          La restauration ne supprime jamais de données existantes : elle met à jour ou recrée les
          enregistrements présents dans le fichier, par sécurité.
        </div>

        {restoreResult && (
          <div className="rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            Restauration terminée :{" "}
            {Object.entries(restoreResult).map(([model, count]) => `${model} (${count})`).join(", ")}
          </div>
        )}
      </Card>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-ink-700">
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Taille</th>
              <th className="px-5 py-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400">Chargement…</td></tr>}
            {!isLoading && (backups?.length ?? 0) === 0 && (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400">Aucune sauvegarde effectuée.</td></tr>
            )}
            {backups?.map((b) => (
              <tr key={b.id} className="border-b border-slate-50 last:border-0 dark:border-ink-700">
                <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{new Date(b.createdAt).toLocaleString("fr-FR")}</td>
                <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{b.type === "MANUAL" ? "Manuelle" : "Automatique"}</td>
                <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{formatSize(b.sizeBytes)}</td>
                <td className="px-5 py-3">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", STATUS_STYLES[b.status])}>
                    {b.status === "COMPLETED" ? "Terminée" : b.status === "PENDING" ? "En cours" : "Échouée"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
