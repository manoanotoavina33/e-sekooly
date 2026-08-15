import { useRef } from "react";
import { Printer, X, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

export interface ReceiptData {
  receiptNo: string;
  schoolName?: string;
  studentName: string;
  studentRegistrationNo: string;
  className?: string;
  feeName: string;
  amount: number;
  amountPaid: number;
  balance: number;
  method: string;
  paidAt: string;
  cashierName?: string;
}

const METHOD_LABELS: Record<string, string> = {
  CASH: "Espèces",
  MOBILE_MONEY: "Mobile Money",
  BANK_TRANSFER: "Virement bancaire",
  CARD: "Carte bancaire",
  CHEQUE: "Chèque",
};

interface ReceiptTicketProps {
  data: ReceiptData;
  onClose: () => void;
  onDownloadPdf?: () => void;
  onNewPayment?: () => void;
}

export function ReceiptTicket({ data, onClose, onDownloadPdf, onNewPayment }: ReceiptTicketProps) {
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank", "width=420,height=700");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Reçu ${data.receiptNo}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; font-size: 11px; width: 72mm; padding: 4mm; color: #111; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 4px 0; }
            .row { display: flex; justify-content: space-between; margin: 2px 0; }
            .logo { font-size: 14px; font-weight: bold; margin-bottom: 2px; }
            .title { font-size: 12px; font-weight: bold; letter-spacing: 1px; margin: 4px 0; }
            .amount-box { border: 1px solid #000; padding: 4px; margin: 6px 0; text-align: center; }
            .amount-big { font-size: 18px; font-weight: bold; }
            .footer { font-size: 9px; text-align: center; margin-top: 8px; color: #555; }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  }

  function handlePrintPdf() {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank", "width=420,height=700");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Reçu ${data.receiptNo}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; font-size: 11px; width: 72mm; padding: 4mm; color: #111; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 4px 0; }
            .row { display: flex; justify-content: space-between; margin: 2px 0; }
            .logo { font-size: 14px; font-weight: bold; margin-bottom: 2px; }
            .title { font-size: 12px; font-weight: bold; letter-spacing: 1px; margin: 4px 0; }
            .amount-box { border: 1px solid #000; padding: 4px; margin: 6px 0; text-align: center; }
            .amount-big { font-size: 18px; font-weight: bold; }
            .footer { font-size: 9px; text-align: center; margin-top: 8px; color: #555; }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  }

  const formattedDate = new Date(data.paidAt).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });

  const totalLabel = data.amount > 0 ? "Total :" : "Montant dû :";

  return (
    <div className="flex flex-col gap-4">
      {/* Action buttons */}
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4" /> Imprimer
        </Button>
        <Button variant="secondary" size="sm" onClick={handlePrintPdf}>
          <FileText className="h-4 w-4" /> Imprimer PDF
        </Button>
        {onDownloadPdf && (
          <Button variant="secondary" size="sm" onClick={onDownloadPdf}>
            <Download className="h-4 w-4" /> PDF A4
          </Button>
        )}
        {onNewPayment && (
          <Button size="sm" onClick={onNewPayment}>
            <Download className="h-4 w-4 rotate-180" /> Nouveau paiement
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" /> Fermer
        </Button>
      </div>

      {/* Ticket preview */}
      <div className="flex justify-center">
        <div
          ref={printRef}
          className="relative w-72 max-w-full rounded-lg border-2 border-slate-300 bg-white p-4 font-mono text-[11px] shadow-lg dark:border-slate-600 dark:bg-slate-50"
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          {/* Watermark / logo header */}
          <div className="mb-2 border-b-2 border-dashed border-slate-300 pb-2 text-center">
            <div className="text-lg font-bold text-slate-900">🏫 {data.schoolName ?? "E-SEKOOLY"}</div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500">Reçu de paiement</div>
          </div>

          {/* Receipt number & date */}
          <div className="mb-2 space-y-1 text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>N° Reçu :</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">{data.receiptNo}</span>
            </div>
            <div className="flex justify-between">
              <span>Date :</span>
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className="my-2 border-t border-dashed border-slate-300" />

          {/* Student info */}
          <div className="mb-1 text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">
            Élève
          </div>
          <div className="mb-2 space-y-1 text-slate-700">
            <div className="flex justify-between">
              <span>Nom :</span>
              <span className="font-bold text-slate-900 dark:text-white">{data.studentName}</span>
            </div>
            <div className="flex justify-between">
              <span>Matricule :</span>
              <span className="font-mono">{data.studentRegistrationNo}</span>
            </div>
            {data.className && (
              <div className="flex justify-between">
                <span>Classe :</span>
                <span>{data.className}</span>
              </div>
            )}
          </div>

          <div className="my-2 border-t border-dashed border-slate-300" />

          {/* Payment info */}
          <div className="mb-1 text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">
            Paiement
          </div>
          <div className="mb-2 space-y-1 text-slate-700">
            <div className="flex justify-between">
              <span>Type :</span>
              <span className="font-bold text-slate-900 dark:text-white">{data.feeName}</span>
            </div>
            <div className="flex justify-between">
              <span>Mode :</span>
              <span>{METHOD_LABELS[data.method] ?? data.method}</span>
            </div>
          </div>

          <div className="my-2 border-t border-dashed border-slate-300" />

          {/* Amount box */}
          <div className="rounded border-2 border-slate-400 p-3 text-center dark:border-slate-600">
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Montant payé</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(data.amountPaid)}
            </div>
          </div>

          {/* Totals */}
          <div className="mt-2 space-y-1 text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>{totalLabel}</span>
              <span>{formatCurrency(data.amount)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className={data.balance > 0 ? "text-amber-600" : "text-emerald-600 dark:text-emerald-400"}>
                {data.balance > 0 ? "Reste à payer :" : "Solde :"}
              </span>
              <span className={data.balance > 0 ? "text-amber-600" : "text-emerald-600 dark:text-emerald-400"}>
                {formatCurrency(Math.abs(data.balance))}
                {data.balance === 0 && " ✓"}
              </span>
            </div>
          </div>

          <div className="my-2 border-t border-dashed border-slate-300" />

          {/* Footer */}
          {data.cashierName && (
            <div className="text-slate-500 dark:text-slate-400">
              Caissier : {data.cashierName}
            </div>
          )}
          <div className="mt-3 text-center text-[9px] text-slate-400">
            Merci pour votre paiement. Conservez ce reçu.
            <br />
            Document généré par E-Sekooly
          </div>
        </div>
      </div>
    </div>
  );
}
