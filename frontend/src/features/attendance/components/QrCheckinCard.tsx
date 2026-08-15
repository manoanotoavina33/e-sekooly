import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { QrCode } from "lucide-react";
import { useState } from "react";
import { useCheckinByQr } from "../hooks/useStudentAttendance";

/**
 * Pointage par QR code. En environnement réel, ce champ reçoit l'entrée d'un
 * lecteur de code-barres/QR USB (qui se comporte comme un clavier) ou d'une
 * scan webcam ; ici la saisie manuelle du jeton permet de tester le flux.
 */
export function QrCheckinCard({ schoolId }: { schoolId: string }) {
  const [token, setToken] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const checkin = useCheckinByQr();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) return;
    try {
      const record = await checkin.mutateAsync({ schoolId, qrCodeToken: token.trim() });
      setFeedback({ type: "success", message: `${record.student.firstName} ${record.student.lastName} marqué présent ✓` });
      setToken("");
    } catch {
      setFeedback({ type: "error", message: "QR code non reconnu pour cet établissement." });
    }
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sky-600 dark:text-sky-300">
        <QrCode className="h-5 w-5" />
        <h3 className="font-display text-sm font-semibold">Pointage par QR code</h3>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Scanner ou saisir le jeton QR de l'élève…"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="flex-1"
          autoFocus
        />
        <Button type="submit" isLoading={checkin.isPending}>
          Valider
        </Button>
      </form>
      {feedback && (
        <p className={feedback.type === "success" ? "text-sm text-emerald-600" : "text-sm text-red-500"}>
          {feedback.message}
        </p>
      )}
    </Card>
  );
}
