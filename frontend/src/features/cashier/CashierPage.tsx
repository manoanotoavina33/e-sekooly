import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuthStore } from "@/hooks/useAuthStore";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowUpRight,
  Calendar,
  Download,
  GraduationCap,
  Loader2,
  TrendingUp,
  Unlock,
  X,
  Wallet,
  Settings2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CashTransactionFormModal } from "./components/CashTransactionFormModal";
import { CloseSessionModal } from "./components/CloseSessionModal";
import { StudentPaymentModal } from "./components/StudentPaymentModal";
import { ReceiptData, ReceiptTicket } from "./components/ReceiptTicket";
import {
  JournalFilters,
  useCashRegisters,
  useCashSessionDetail,
  useCashSessionJournal,
  useCashSessions,
  useOpenCashSession,
} from "./hooks/useCashSessions";
import { useFeeCategories } from "./hooks/useCashierPayment";
import {
  downloadCashReceiptPdf,
  useCashTransactions,
} from "./hooks/useCashTransactions";
import { downloadReceiptPdf } from "@/features/finance/payments/hooks/usePayments";

export default function CashierPage() {
  const user = useAuthStore((s) => s.user);
  const schoolId = user?.schoolId ?? "";

  const { data: registers, isLoading: registersLoading } = useCashRegisters(schoolId);
  const { data: feeCategories } = useFeeCategories(schoolId);

  // Auto-select first register — no manual dropdown needed
  const [registerId, setRegisterId] = useState("");
  const [showRegisterPicker, setShowRegisterPicker] = useState(false);

  useEffect(() => {
    if (!registerId && registers && registers.length > 0) {
      setRegisterId(registers[0].id);
    }
  }, [registers, registerId]);

  const currentRegister = registers?.find((r) => r.id === registerId);

  const { data: openSessions } = useCashSessions(registerId || undefined, "OPEN");
  const currentSession = openSessions?.[0];
  const { data: sessionDetail } = useCashSessionDetail(currentSession?.id);
  const { data: transactions } = useCashTransactions(currentSession?.id);

  const openSessionMutation = useOpenCashSession();

  // Journal filters
  const currentYear = new Date().getFullYear();
  const [journalCategory, setJournalCategory] = useState("");
  const [journalMonth, setJournalMonth] = useState<number | undefined>(undefined);
  const [journalYear, setJournalYear] = useState<number | undefined>(undefined);

  const journalFilters: JournalFilters = {
    limit: 50,
    category: journalCategory || undefined,
    month: journalMonth,
    year: journalYear,
  };

  const { data: journalEntries, isLoading: journalLoading } = useCashSessionJournal(
    currentSession?.id,
    journalFilters
  );

  // Modals
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [previewReceipt, setPreviewReceipt] = useState<{
    receipt: ReceiptData;
    txId: string;
  } | null>(null);

  // Stats
  const todayStr = new Date().toDateString();
  const todayTxs =
    transactions?.filter(
      (tx) => new Date(tx.createdAt).toDateString() === todayStr && tx.status === "VALIDATED"
    ) ?? [];
  const todayIn = todayTxs.filter((t) => t.type === "IN").reduce((s, t) => s + t.amount, 0);

  // Loading
  if (registersLoading) {
    return (
      <div className="flex h-60 flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">Chargement de la caisse…</p>
      </div>
    );
  }

  // No register at all
  if (!registers || registers.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader name={currentRegister?.name} onSettings={() => setShowRegisterPicker(true)} />
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Wallet className="h-10 w-10 text-slate-300" />
          <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
            Aucune caisse configurée
          </p>
          <p className="text-sm text-slate-400">
            Demandez à un administrateur de créer une caisse pour votre école.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Caisse</h1>
            {currentRegister && (
              <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                {currentRegister.name}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Encaissements, journal de caisse et reçus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Bouton paiement direct — toujours visible si session ouverte */}
          {currentSession && (
            <Button size="lg" onClick={() => setPaymentModalOpen(true)}>
              <GraduationCap className="h-5 w-5" />
              Encaisser un paiement
            </Button>
          )}

          {/* Changer de caisse (si plusieurs) */}
          {registers.length > 1 && (
            <button
              onClick={() => setShowRegisterPicker((v) => !v)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 hover:border-sky-400 dark:border-ink-700 dark:bg-ink-800 dark:text-slate-300"
              title="Changer de caisse"
            >
              <Settings2 className="h-4 w-4" />
              Changer
            </button>
          )}
        </div>
      </div>

      {/* Register picker dropdown (conditionnel) */}
      {showRegisterPicker && registers.length > 1 && (
        <Card className="flex flex-col gap-2 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Sélectionner une caisse
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {registers.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setRegisterId(r.id);
                  setShowRegisterPicker(false);
                }}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                  registerId === r.id
                    ? "border-sky-500 bg-sky-50 dark:border-sky-400 dark:bg-sky-900/20"
                    : "border-slate-200 hover:border-sky-300 dark:border-ink-700"
                }`}
              >
                <Wallet className="h-5 w-5 text-sky-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{r.name}</p>
                  {r.location && <p className="text-xs text-slate-400">{r.location}</p>}
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* ── Aucune session ouverte → bouton d'activation immédiat ── */}
      {registerId && !currentSession && (
        <Card className="relative overflow-hidden flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-white opacity-60 dark:from-sky-950/20 dark:to-ink-800" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 dark:bg-sky-900/50">
              <Wallet className="h-8 w-8 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800 dark:text-white">
                La caisse est prête à être ouverte
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Cliquez pour démarrer la session et commencer à encaisser.
              </p>
            </div>
            <Button
              size="lg"
              isLoading={openSessionMutation.isPending}
              onClick={() => {
                openSessionMutation.mutate({ cashRegisterId: registerId, openingBalance: 0 });
              }}
              className="px-8"
            >
              <Unlock className="h-5 w-5" /> Ouvrir la caisse &amp; Encaisser
            </Button>
          </div>
        </Card>
      )}

      {/* ── Session active ── */}
      {registerId && currentSession && sessionDetail && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="flex items-center gap-4 border-l-4 border-l-emerald-500 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <ArrowUpRight className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total encaissé (session)</p>
                <p className="font-display text-xl font-bold text-emerald-600">
                  {formatCurrency(sessionDetail.totalIn)}
                </p>
              </div>
            </Card>
            <Card className="flex items-center gap-4 border-l-4 border-l-sky-500 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Encaissé aujourd'hui</p>
                <p className="font-display text-xl font-bold text-sky-700 dark:text-sky-300">
                  {formatCurrency(todayIn)}
                </p>
              </div>
            </Card>
            <Card className="flex items-center gap-4 border-l-4 border-l-amber-500 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Transactions du jour</p>
                <p className="font-display text-xl font-bold text-amber-600">
                  {todayTxs.length}
                </p>
              </div>
            </Card>
          </div>

          {/* Action secondaire : clôturer la session */}
          <div className="flex justify-end">
            <button
              onClick={() => setCloseModalOpen(true)}
              className="text-xs font-medium text-slate-400 hover:text-red-500 transition-colors"
            >
              Clôturer la session
            </button>
          </div>

          {/* Journal */}
          <Card className="overflow-x-auto p-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-ink-700">
              <div>
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Journal de caisse
                </h2>
                <span className="text-xs text-slate-400">
                  {journalEntries?.length ?? 0} paiement(s) enregistré(s)
                </span>
              </div>

              {/* Filtres */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={journalCategory}
                  onChange={(e) => setJournalCategory(e.target.value)}
                  className="h-8 min-w-[160px] rounded-lg border border-slate-200 bg-white px-2 text-xs outline-none focus:border-sky-400 dark:border-ink-700 dark:bg-ink-800 dark:text-white"
                >
                  <option value="">Toutes les catégories</option>
                  {feeCategories?.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                  {Array.from(new Set(journalEntries?.map((e) => e.feeCategoryName) ?? []))
                    .filter((n) => !feeCategories?.some((c) => c.name === n))
                    .map((n) => <option key={n} value={n}>{n}</option>)}
                </select>

                <select
                  value={journalMonth ?? ""}
                  onChange={(e) => setJournalMonth(e.target.value ? Number(e.target.value) : undefined)}
                  className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs outline-none focus:border-sky-400 dark:border-ink-700 dark:bg-ink-800 dark:text-white"
                >
                  <option value="">Tous les mois</option>
                  {["Janv","Févr","Mars","Avr","Mai","Juin","Juil","Août","Sept","Oct","Nov","Déc"].map((m, i) => (
                    <option key={i + 1} value={i + 1}>{m}</option>
                  ))}
                </select>

                <select
                  value={journalYear ?? ""}
                  onChange={(e) => setJournalYear(e.target.value ? Number(e.target.value) : undefined)}
                  className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs outline-none focus:border-sky-400 dark:border-ink-700 dark:bg-ink-800 dark:text-white"
                >
                  <option value="">Toutes années</option>
                  {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>

                {(journalCategory || journalMonth || journalYear) && (
                  <button
                    onClick={() => { setJournalCategory(""); setJournalMonth(undefined); setJournalYear(undefined); }}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-slate-100 dark:hover:bg-ink-700"
                  >
                    <X className="h-3 w-3" /> Réinit
                  </button>
                )}
              </div>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-ink-700">
                  <th className="px-4 py-3 font-medium">Reçu</th>
                  <th className="px-4 py-3 font-medium">Élève</th>
                  <th className="px-4 py-3 font-medium">Catégorie</th>
                  <th className="px-4 py-3 font-medium">Mois couvert</th>
                  <th className="px-4 py-3 font-medium">Montant</th>
                  <th className="px-4 py-3 font-medium">Facture</th>
                  <th className="px-4 py-3 font-medium">Heure</th>
                  <th className="px-4 py-3 font-medium text-right">Reçu</th>
                </tr>
              </thead>
              <tbody>
                {journalLoading && (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-slate-400">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    </td>
                  </tr>
                )}
                {!journalLoading && (journalEntries?.length ?? 0) === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-slate-400 text-sm">
                      Aucun paiement enregistré pour cette session.
                    </td>
                  </tr>
                )}
                {journalEntries?.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-sky-50/40 dark:border-ink-700 dark:hover:bg-ink-700/20"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {entry.receiptNo}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800 dark:text-white text-xs">
                        {entry.studentName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {entry.studentRegistrationNo}
                        {entry.className && ` · ${entry.className}`}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                      {entry.feeCategoryName}
                    </td>
                    <td className="px-4 py-3">
                      {entry.coveredMonth ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
                          <Calendar className="h-3 w-3" />
                          {entry.coveredMonth}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-600 text-sm">
                      +{formatCurrency(entry.amount)}
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-slate-400">
                      {entry.invoiceNo}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(entry.paidAt).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => downloadReceiptPdf(entry.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-sky-600 dark:hover:bg-ink-700"
                        title="Télécharger le reçu PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {/* ── Modals ── */}
      {sessionDetail && (
        <CloseSessionModal
          open={closeModalOpen}
          onClose={() => setCloseModalOpen(false)}
          session={sessionDetail}
        />
      )}
      {currentSession && (
        <>
          <CashTransactionFormModal
            open={txModalOpen}
            onClose={() => setTxModalOpen(false)}
            cashSessionId={currentSession.id}
          />
          <StudentPaymentModal
            open={paymentModalOpen}
            onClose={() => setPaymentModalOpen(false)}
            cashSessionId={currentSession.id}
          />
        </>
      )}

      {/* Receipt preview */}
      {previewReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-ink-900">
            <ReceiptTicket
              data={previewReceipt.receipt}
              onClose={() => setPreviewReceipt(null)}
              onDownloadPdf={() => downloadCashReceiptPdf(previewReceipt.txId, "A4")}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function PageHeader({ name, onSettings }: { name?: string; onSettings: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Caisse</h1>
          {name && (
            <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
              {name}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Encaissements, journal de caisse et reçus.
        </p>
      </div>
    </div>
  );
}
