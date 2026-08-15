import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuthStore } from "@/hooks/useAuthStore";
import { cn } from "@/lib/utils";
import { Megaphone, Plus } from "lucide-react";
import { useState } from "react";
import { AnnouncementFormModal } from "./components/AnnouncementFormModal";
import { ComposeMessageModal } from "./components/ComposeMessageModal";
import { useAnnouncements } from "./hooks/useAnnouncements";
import { useInbox, useMarkMessageRead, useSentMessages } from "./hooks/useMessages";

const AUDIENCE_LABELS: Record<string, string> = {
  ALL: "Tout le monde",
  STUDENTS: "Élèves",
  PARENTS: "Parents",
  TEACHERS: "Enseignants",
  STAFF: "Personnel",
};

export default function CommunicationPage() {
  const user = useAuthStore((s) => s.user);
  const schoolId = user?.schoolId ?? "";
  const [tab, setTab] = useState<"inbox" | "sent" | "announcements">("inbox");
  const [composeOpen, setComposeOpen] = useState(false);
  const [announcementOpen, setAnnouncementOpen] = useState(false);

  const { data: inbox } = useInbox();
  const { data: sent } = useSentMessages();
  const { data: announcements } = useAnnouncements(schoolId);
  const markRead = useMarkMessageRead();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Communication</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Messagerie interne et annonces.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setAnnouncementOpen(true)}>
            <Megaphone className="h-4 w-4" /> Nouvelle annonce
          </Button>
          <Button onClick={() => setComposeOpen(true)}>
            <Plus className="h-4 w-4" /> Nouveau message
          </Button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-100 dark:border-ink-700">
        {(["inbox", "sent", "announcements"] as const).map((t) => (
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
            {t === "inbox" ? "Boîte de réception" : t === "sent" ? "Envoyés" : "Annonces"}
          </button>
        ))}
      </div>

      {tab === "inbox" && (
        <div className="flex flex-col gap-3">
          {(inbox?.length ?? 0) === 0 && <Card className="text-center text-sm text-slate-400">Boîte de réception vide.</Card>}
          {inbox?.map((item) => (
            <Card
              key={item.id}
              onClick={() => !item.readAt && markRead.mutate(item.message.id)}
              className={cn("cursor-pointer", !item.readAt && "border-sky-200 bg-sky-50/40 dark:bg-ink-700/60")}
            >
              <div className="flex items-center justify-between">
                <h3 className={cn("text-sm", !item.readAt ? "font-bold text-slate-900 dark:text-white" : "font-medium text-slate-700 dark:text-slate-200")}>
                  {item.message.subject}
                </h3>
                <span className="text-xs text-slate-400">{new Date(item.message.createdAt).toLocaleDateString("fr-FR")}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                De {item.message.sender.firstName} {item.message.sender.lastName}
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.message.body}</p>
            </Card>
          ))}
        </div>
      )}

      {tab === "sent" && (
        <div className="flex flex-col gap-3">
          {(sent?.length ?? 0) === 0 && <Card className="text-center text-sm text-slate-400">Aucun message envoyé.</Card>}
          {sent?.map((msg) => (
            <Card key={msg.id}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-800 dark:text-white">{msg.subject}</h3>
                <span className="text-xs text-slate-400">{new Date(msg.createdAt).toLocaleDateString("fr-FR")}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                À {msg.recipients.map((r) => `${r.recipient.firstName} ${r.recipient.lastName}`).join(", ")}
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{msg.body}</p>
            </Card>
          ))}
        </div>
      )}

      {tab === "announcements" && (
        <div className="flex flex-col gap-3">
          {(announcements?.length ?? 0) === 0 && <Card className="text-center text-sm text-slate-400">Aucune annonce publiée.</Card>}
          {announcements?.map((a) => (
            <Card key={a.id}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{a.title}</h3>
                <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-600 dark:bg-sky-950/40 dark:text-sky-300">
                  {AUDIENCE_LABELS[a.audience]}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Par {a.author.firstName} {a.author.lastName} · {new Date(a.publishedAt).toLocaleDateString("fr-FR")}
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{a.body}</p>
            </Card>
          ))}
        </div>
      )}

      <ComposeMessageModal open={composeOpen} onClose={() => setComposeOpen(false)} schoolId={schoolId} />
      <AnnouncementFormModal open={announcementOpen} onClose={() => setAnnouncementOpen(false)} schoolId={schoolId} />
    </div>
  );
}
