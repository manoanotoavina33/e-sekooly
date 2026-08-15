import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { useSyncHistory } from "../hooks/useSync";

const STATUS_STYLES: Record<string, string> = {
  SUCCESS: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300",
  PARTIAL: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300",
  FAILED: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300",
};

export function SyncPanel({ schoolId }: { schoolId: string }) {
  const { data: logs, isLoading } = useSyncHistory(schoolId);

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white">
          <RefreshCw className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-display text-sm font-semibold text-slate-800 dark:text-white">
            Synchronisation Offline ⇄ Serveur
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            En mode hors-ligne, les appareils enregistrent localement (SQLite) puis synchronisent
            automatiquement avec le serveur (PostgreSQL) dès qu'une connexion Internet est
            disponible. Le journal ci-dessous trace les derniers lots synchronisés depuis chaque
            appareil (API <code className="rounded bg-slate-100 px-1 dark:bg-ink-700">/api/sync/push</code> et{" "}
            <code className="rounded bg-slate-100 px-1 dark:bg-ink-700">/api/sync/pull</code>).
          </p>
        </div>
      </Card>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-ink-700">
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Appareil</th>
              <th className="px-5 py-3 font-medium">Sens</th>
              <th className="px-5 py-3 font-medium">Enregistrements</th>
              <th className="px-5 py-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">Chargement…</td></tr>}
            {!isLoading && (logs?.length ?? 0) === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">Aucune synchronisation enregistrée pour le moment.</td></tr>
            )}
            {logs?.map((log) => (
              <tr key={log.id} className="border-b border-slate-50 last:border-0 dark:border-ink-700">
                <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{new Date(log.createdAt).toLocaleString("fr-FR")}</td>
                <td className="px-5 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{log.deviceId}</td>
                <td className="px-5 py-3 text-slate-700 dark:text-slate-200">{log.direction === "PUSH" ? "Envoi (Push)" : "Réception (Pull)"}</td>
                <td className="px-5 py-3 text-slate-700 dark:text-slate-200">{log.recordCount}</td>
                <td className="px-5 py-3">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", STATUS_STYLES[log.status])}>
                    {log.status === "SUCCESS" ? "Réussie" : log.status === "PARTIAL" ? "Partielle" : "Échouée"}
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
