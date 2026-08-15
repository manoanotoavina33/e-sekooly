import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/hooks/useAuthStore";
import { formatCurrency } from "@/lib/utils";
import {
  BookOpen,
  Calendar,
  DollarSign,
  Download,
  FileBarChart,
  FileText,
  GraduationCap,
  Receipt,
  Scale,
  Search,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { ReportExportModal } from "./components/ReportExportModal";
import { ReportSummary, useReportList } from "./hooks/useReports";
import { useFinanceSummary } from "@/features/finance/invoices/hooks/useInvoices";

const MODULE_ICONS: Record<string, React.ElementType> = {
  students: GraduationCap,
  hr: Users,
  attendance: Calendar,
  grades: BookOpen,
  discipline: Scale,
  finance: Wallet,
  cashier: Receipt,
};

const MODULE_LABELS: Record<string, string> = {
  students: "Élèves",
  hr: "Enseignants & RH",
  attendance: "Présence",
  grades: "Examens & Notes",
  discipline: "Discipline",
  finance: "Finances",
  cashier: "Caisse",
};

const MODULE_COLORS: Record<string, { bg: string; text: string; border: string; hoverBg: string }> = {
  students: { bg: "bg-sky-50 dark:bg-sky-950/40", text: "text-sky-600 dark:text-sky-400", border: "border-sky-200 dark:border-sky-900/50", hoverBg: "hover:border-sky-400" },
  hr: { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-900/50", hoverBg: "hover:border-emerald-400" },
  attendance: { bg: "bg-indigo-50 dark:bg-indigo-950/40", text: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-200 dark:border-indigo-900/50", hoverBg: "hover:border-indigo-400" },
  grades: { bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-600 dark:text-violet-400", border: "border-violet-200 dark:border-violet-900/50", hoverBg: "hover:border-violet-400" },
  discipline: { bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-600 dark:text-rose-400", border: "border-rose-200 dark:border-rose-900/50", hoverBg: "hover:border-rose-400" },
  finance: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-600 dark:text-amber-400", border: "border-amber-200 dark:border-amber-900/50", hoverBg: "hover:border-amber-400" },
  cashier: { bg: "bg-teal-50 dark:bg-teal-950/40", text: "text-teal-600 dark:text-teal-400", border: "border-teal-200 dark:border-teal-900/50", hoverBg: "hover:border-teal-400" },
};

export default function ReportsPage() {
  const { data: reports, isLoading } = useReportList();
  const user = useAuthStore((s) => s.user);
  const { data: summary } = useFinanceSummary(user?.schoolId ?? "");
  const [selectedReport, setSelectedReport] = useState<ReportSummary | null>(null);
  const [search, setSearch] = useState("");
  const [activeModule, setActiveModule] = useState<string>("all");

  const filteredReports = (reports ?? []).filter((r) => {
    const matchesModule = activeModule === "all" || r.module === activeModule;
    const matchesSearch =
      r.label.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    return matchesModule && matchesSearch;
  });

  const grouped = filteredReports.reduce<Record<string, ReportSummary[]>>((acc, r) => {
    (acc[r.module] ??= []).push(r);
    return acc;
  }, {});

  const modulesList = Array.from(new Set((reports ?? []).map((r) => r.module)));

  return (
    <div className="flex flex-col gap-6">
      {/* Header avec gradient élégant */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-6 text-white shadow-xl dark:from-ink-900 dark:via-ink-800 dark:to-ink-900">
        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" /> Centre d'Exportation &amp; Analyses
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white mt-2">
              Rapports &amp; Analytics
            </h1>
            <p className="text-sm text-slate-300">
              Générez et téléchargez facilement les données clés de votre établissement aux formats PDF, Excel et CSV.
            </p>
          </div>
        </div>
      </div>

      {/* Aperçu rapide des finances */}
      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="flex items-center gap-4 p-4 border-l-4 border-l-sky-500">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total facturé</p>
              <p className="font-display text-xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(summary.totalInvoiced)}
              </p>
            </div>
          </Card>
          <Card className="flex items-center gap-4 p-4 border-l-4 border-l-emerald-500">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total collecté</p>
              <p className="font-display text-xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(summary.totalCollected)}
              </p>
            </div>
          </Card>
          <Card className="flex items-center gap-4 p-4 border-l-4 border-l-amber-500">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Receipt className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Encaissé restant</p>
              <p className="font-display text-xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(summary.totalOutstanding)}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Barre de recherche et Filtres par Module */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Rechercher un rapport (ex: Émargement, Bilan...)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveModule("all")}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
              activeModule === "all"
                ? "bg-sky-600 text-white shadow-md shadow-sky-500/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-ink-800 dark:text-slate-300 dark:hover:bg-ink-700"
            }`}
          >
            Tous les modules ({reports?.length ?? 0})
          </button>
          {modulesList.map((modKey) => (
            <button
              key={modKey}
              onClick={() => setActiveModule(modKey)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                activeModule === modKey
                  ? "bg-sky-600 text-white shadow-md shadow-sky-500/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-ink-800 dark:text-slate-300 dark:hover:bg-ink-700"
              }`}
            >
              {MODULE_LABELS[modKey] ?? modKey}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <Card className="flex h-40 items-center justify-center text-sm text-slate-400">
          Chargement des modèles de rapports...
        </Card>
      )}

      {/* RÉSULTAT VIDE */}
      {!isLoading && filteredReports.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <FileBarChart className="h-10 w-10 text-slate-300 mb-2" />
          <p className="text-base font-semibold text-slate-700 dark:text-slate-200">Aucun rapport trouvé</p>
          <p className="text-xs text-slate-400 mt-1">Essayez un autre mot-clé ou réinitialisez les filtres.</p>
        </Card>
      )}

      {/* Rapports groupés */}
      {!isLoading &&
        Object.entries(grouped).map(([moduleKey, moduleReports]) => {
          const Icon = MODULE_ICONS[moduleKey] ?? FileText;
          const styles = MODULE_COLORS[moduleKey] ?? {
            bg: "bg-slate-50 dark:bg-ink-800",
            text: "text-slate-600 dark:text-slate-400",
            border: "border-slate-200 dark:border-ink-700",
            hoverBg: "hover:border-slate-300",
          };

          return (
            <div key={moduleKey} className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5 pt-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${styles.bg} ${styles.text}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <h2 className="font-display text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {MODULE_LABELS[moduleKey] ?? moduleKey}
                </h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500 dark:bg-ink-800 dark:text-slate-400">
                  {moduleReports.length}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {moduleReports.map((report) => (
                  <div
                    key={report.id}
                    className={`group flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-ink-800 ${styles.border} ${styles.hoverBg}`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles.bg} ${styles.text}`}>
                          <FileText className="h-5 w-5" />
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-ink-700 dark:text-slate-400">
                          PDF • XLSX • CSV
                        </span>
                      </div>

                      <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                        {report.label}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                        {report.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 dark:border-ink-700 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-400">Rapport standard</span>
                      <Button
                        size="sm"
                        onClick={() => setSelectedReport(report)}
                        className="gap-1.5 shadow-sm"
                      >
                        <Download className="h-3.5 w-3.5" /> Exporter
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

      {selectedReport && (
        <ReportExportModal
          open={Boolean(selectedReport)}
          onClose={() => setSelectedReport(null)}
          report={selectedReport}
        />
      )}
    </div>
  );
}

