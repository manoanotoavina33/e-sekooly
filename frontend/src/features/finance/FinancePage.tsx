import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuthStore } from "@/hooks/useAuthStore";
import { cn, formatCurrency } from "@/lib/utils";
import {
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  Receipt,
  TrendingUp,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useFinanceSummary } from "./invoices/hooks/useInvoices";
import {
  useAllPayments,
  useStudentPaymentStatus,
} from "./payments/hooks/usePayments";
import { useFeeCategories } from "../cashier/hooks/useCashierPayment";
import { useCashRegisters, useCashSessions, useOpenCashSession } from "../cashier/hooks/useCashSessions";
import { StudentPaymentModal } from "../cashier/components/StudentPaymentModal";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "💵 Espèces",
  MOBILE_MONEY: "📱 Mobile Money",
  BANK_TRANSFER: "🏦 Virement",
  CARD: "💳 Carte",
  CHEQUE: "📄 Chèque",
};

const MONTHS = [
  { value: 1, label: "Janvier" },
  { value: 2, label: "Février" },
  { value: 3, label: "Mars" },
  { value: 4, label: "Avril" },
  { value: 5, label: "Mai" },
  { value: 6, label: "Juin" },
  { value: 7, label: "Juillet" },
  { value: 8, label: "Août" },
  { value: 9, label: "Septembre" },
  { value: 10, label: "Octobre" },
  { value: 11, label: "Novembre" },
  { value: 12, label: "Décembre" },
];

export default function FinancePage() {
  const user = useAuthStore((s) => s.user);
  const schoolId = user?.schoolId ?? "";

  const now = new Date();
  const [tab, setTab] = useState<"payments" | "students">("payments");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // --- Payments tab filters ---
  const [pmtMonth, setPmtMonth] = useState<number | undefined>(undefined);
  const [pmtYear, setPmtYear] = useState<number | undefined>(undefined);
  const [pmtCategory, setPmtCategory] = useState<string>("");
  const [pmtSearch, setPmtSearch] = useState<string>("");

  // --- Students tab filters ---
  const [stuMonth, setStuMonth] = useState(now.getMonth() + 1);
  const [stuYear, setStuYear] = useState(now.getFullYear());
  const [stuFilter, setStuFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [stuSearch, setStuSearch] = useState("");

  const { data: summary } = useFinanceSummary(schoolId);
  const { data: feeCategories } = useFeeCategories(schoolId);
  const { data: rawPayments, isLoading: loadingPayments } = useAllPayments(
    schoolId,
    pmtMonth,
    pmtYear
  );
  const { data: studentStatuses, isLoading: loadingStudents } =
    useStudentPaymentStatus(schoolId, stuMonth, stuYear);

  // Résolution automatique de la session de caisse
  const { data: registers } = useCashRegisters(schoolId);
  const firstRegisterId = registers?.[0]?.id;
  const { data: openSessions } = useCashSessions(firstRegisterId, "OPEN");
  const openSessionMutation = useOpenCashSession();
  const currentSession = openSessions?.[0];

  async function handleOpenPayment() {
    if (!currentSession && firstRegisterId) {
      await openSessionMutation.mutateAsync({ cashRegisterId: firstRegisterId, openingBalance: 0 });
    }
    setPaymentModalOpen(true);
  }

  // Filtered payments by category and search term
  const payments = (rawPayments ?? []).filter((p) => {
    if (pmtCategory) {
      const pCat = (p.note ?? p.invoice.feeCategory.name).toLowerCase();
      if (!pCat.includes(pmtCategory.toLowerCase())) return false;
    }
    if (pmtSearch.trim()) {
      const q = pmtSearch.toLowerCase();
      const matchStudent =
        p.invoice.student.firstName.toLowerCase().includes(q) ||
        p.invoice.student.lastName.toLowerCase().includes(q) ||
        p.invoice.student.registrationNo.toLowerCase().includes(q);
      const matchReceipt = p.receiptNo.toLowerCase().includes(q);
      const matchNote = (p.note ?? "").toLowerCase().includes(q);
      if (!matchStudent && !matchReceipt && !matchNote) return false;
    }
    return true;
  });

  // Filtered students
  const filteredStudents = (studentStatuses ?? []).filter((s) => {
    if (stuFilter === "paid" && !s.hasPaid) return false;
    if (stuFilter === "unpaid" && s.hasPaid) return false;
    if (stuSearch.trim()) {
      const q = stuSearch.toLowerCase();
      return (
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.registrationNo.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const paidCount = (studentStatuses ?? []).filter((s) => s.hasPaid).length;
  const unpaidCount = (studentStatuses ?? []).filter((s) => !s.hasPaid).length;

  const yearOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Finances
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Suivi des paiements et des élèves.
          </p>
        </div>
        <Button
          onClick={handleOpenPayment}
          isLoading={openSessionMutation.isPending}
        >
          <GraduationCap className="h-4 w-4" /> Encaisser un paiement
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white">
            <Wallet className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total facturé</p>
            <p className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {(summary?.totalInvoiced ?? 0) && formatCurrency(summary?.totalInvoiced ?? 0)}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
            <TrendingUp className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total encaissé</p>
            <p className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {(summary?.totalCollected ?? 0) && formatCurrency(summary?.totalCollected ?? 0)}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white">
            <Receipt className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Solde restant dû</p>
            <p className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {(summary?.totalOutstanding ?? 0) && formatCurrency(summary?.totalOutstanding ?? 0)}
            </p>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 dark:border-ink-700">
        {(["payments", "students"] as const).map((t) => (
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
            {t === "payments" ? "Liste des paiements" : "Suivi élèves par mois"}
          </button>
        ))}
      </div>

      {/* ─── TAB: Paiements ─── */}
      {tab === "payments" && (
        <div className="flex flex-col gap-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-500 dark:text-slate-400">Filtrer par :</span>
            
            {/* Filtre catégorie dynamique */}
            <div className="relative">
              <select
                value={pmtCategory}
                onChange={(e) => setPmtCategory(e.target.value)}
                className="h-9 appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-sm dark:border-ink-700 dark:bg-ink-800 dark:text-white"
              >
                <option value="">Toutes les catégories</option>
                {feeCategories?.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-2 h-4 w-4 text-slate-400" />
            </div>

            <div className="relative">
              <select
                value={pmtMonth ?? ""}
                onChange={(e) => setPmtMonth(e.target.value ? Number(e.target.value) : undefined)}
                className="h-9 appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-sm dark:border-ink-700 dark:bg-ink-800 dark:text-white"
              >
                <option value="">Tous les mois</option>
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-2 h-4 w-4 text-slate-400" />
            </div>

            <div className="relative">
              <select
                value={pmtYear ?? ""}
                onChange={(e) => setPmtYear(e.target.value ? Number(e.target.value) : undefined)}
                className="h-9 appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-sm dark:border-ink-700 dark:bg-ink-800 dark:text-white"
              >
                <option value="">Toutes les années</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-2 h-4 w-4 text-slate-400" />
            </div>

            {/* Recherche */}
            <input
              type="text"
              value={pmtSearch}
              onChange={(e) => setPmtSearch(e.target.value)}
              placeholder="Rechercher par élève, reçu…"
              className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-ink-700 dark:bg-ink-800 dark:text-white"
            />

            {(pmtMonth || pmtYear || pmtCategory || pmtSearch) && (
              <button
                onClick={() => { setPmtMonth(undefined); setPmtYear(undefined); setPmtCategory(""); setPmtSearch(""); }}
                className="text-xs text-sky-500 hover:underline"
              >
                Réinitialiser
              </button>
            )}
          </div>

          <Card className="overflow-x-auto p-0">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 dark:border-ink-700">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Paiements reçus
              </h2>
              <span className="text-xs text-slate-400">{payments?.length ?? 0} paiement(s)</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-ink-700">
                  <th className="px-5 py-3 font-medium">Reçu N°</th>
                  <th className="px-5 py-3 font-medium">Élève</th>
                  <th className="px-5 py-3 font-medium">Motif</th>
                  <th className="px-5 py-3 font-medium">Montant</th>
                  <th className="px-5 py-3 font-medium">Mode</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {loadingPayments && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      Chargement…
                    </td>
                  </tr>
                )}
                {!loadingPayments && (payments?.length ?? 0) === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      Aucun paiement trouvé.
                    </td>
                  </tr>
                )}
                {payments?.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-sky-50/50 dark:border-ink-700 dark:hover:bg-ink-700/40"
                  >
                    <td className="px-5 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {p.receiptNo}
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-800 dark:text-white">
                      {p.invoice.student.firstName} {p.invoice.student.lastName}
                      <div className="text-xs font-normal text-slate-400">
                        {p.invoice.student.registrationNo}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                      {p.note ?? p.invoice.feeCategory.name}
                    </td>
                    <td className="px-5 py-3 font-semibold text-emerald-600">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                      {PAYMENT_METHOD_LABELS[p.method] ?? p.method}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-400">
                      {new Date(p.paidAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* ─── TAB: Suivi élèves ─── */}
      {tab === "students" && (
        <div className="flex flex-col gap-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-500 dark:text-slate-400">Mois :</span>
            <div className="relative">
              <select
                value={stuMonth}
                onChange={(e) => setStuMonth(Number(e.target.value))}
                className="h-9 appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-sm dark:border-ink-700 dark:bg-ink-800 dark:text-white"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-2 h-4 w-4 text-slate-400" />
            </div>
            <div className="relative">
              <select
                value={stuYear}
                onChange={(e) => setStuYear(Number(e.target.value))}
                className="h-9 appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-sm dark:border-ink-700 dark:bg-ink-800 dark:text-white"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-2 h-4 w-4 text-slate-400" />
            </div>

            {/* Status filter pills */}
            <div className="flex gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-ink-700 dark:bg-ink-800">
              {(["all", "paid", "unpaid"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setStuFilter(f)}
                  className={cn(
                    "rounded-lg px-3 py-1 text-xs font-medium transition-colors",
                    stuFilter === f
                      ? f === "paid"
                        ? "bg-emerald-500 text-white shadow-sm"
                        : f === "unpaid"
                        ? "bg-red-500 text-white shadow-sm"
                        : "bg-white text-slate-700 shadow-sm dark:bg-ink-700 dark:text-white"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  {f === "all" ? "Tous" : f === "paid" ? "✅ Payés" : "❌ Non payés"}
                </button>
              ))}
            </div>

            {/* Search */}
            <input
              type="text"
              value={stuSearch}
              onChange={(e) => setStuSearch(e.target.value)}
              placeholder="Rechercher un élève…"
              className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-ink-700 dark:bg-ink-800 dark:text-white"
            />
          </div>

          {/* Stats pills */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 dark:bg-emerald-950/30">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                {paidCount} payés
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 dark:bg-red-950/30">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                {unpaidCount} non payés
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 dark:bg-ink-800">
              <Users className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                {(studentStatuses ?? []).length} élèves au total
              </span>
            </div>
          </div>

          <Card className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-ink-700">
                  <th className="px-5 py-3 font-medium">Élève</th>
                  <th className="px-5 py-3 font-medium">Matricule</th>
                  <th className="px-5 py-3 font-medium">Classe</th>
                  <th className="px-5 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {loadingStudents && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                      Chargement…
                    </td>
                  </tr>
                )}
                {!loadingStudents && filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                      Aucun élève trouvé.
                    </td>
                  </tr>
                )}
                {filteredStudents.map((s) => (
                  <tr
                    key={s.id}
                    className={cn(
                      "border-b border-slate-50 last:border-0 dark:border-ink-700",
                      s.hasPaid
                        ? "hover:bg-emerald-50/40 dark:hover:bg-emerald-950/10"
                        : "hover:bg-red-50/40 dark:hover:bg-red-950/10"
                    )}
                  >
                    <td className="px-5 py-3 font-medium text-slate-800 dark:text-white">
                      {s.firstName} {s.lastName}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {s.registrationNo}
                    </td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                      {s.classRoom?.name ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      {s.hasPaid ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" />
                          Payé
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 dark:bg-red-950/40 dark:text-red-300">
                          <XCircle className="h-3 w-3" />
                          Non payé
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* Modal paiement direct — session résolue automatiquement */}
      {currentSession && (
        <StudentPaymentModal
          open={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          cashSessionId={currentSession.id}
        />
      )}
    </div>
  );
}
