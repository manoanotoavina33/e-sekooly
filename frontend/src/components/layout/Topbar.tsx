import { useAuthStore } from "@/hooks/useAuthStore";
import { useMarkNotificationRead, useMyNotifications } from "@/features/communication/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { Bell, LogOut, Menu, Moon, Search, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [notifOpen, setNotifOpen] = useState(false);

  const { data: notifications } = useMyNotifications(user?.schoolId ?? "");
  const markRead = useMarkNotificationRead();
  const unreadCount = notifications?.filter((n) => !n.readAt).length ?? 0;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  function handleLogout() {
    clear();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-100 bg-white/80 px-4 backdrop-blur dark:border-ink-700 dark:bg-ink-900/80">
      <button onClick={onMenuClick} className="text-slate-500 lg:hidden">
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden max-w-md flex-1 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-400 sm:flex dark:bg-ink-800">
        <Search className="h-4 w-4" />
        <span>Rechercher un élève, un enseignant, une classe…</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => setIsDark((v) => !v)}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-ink-800"
        >
          {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-ink-800"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-sky-500" />
            )}
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-12 z-50 max-h-96 w-80 overflow-y-auto rounded-2xl border border-slate-100 bg-white p-2 shadow-glow dark:border-ink-700 dark:bg-ink-800">
                {(notifications?.length ?? 0) === 0 && (
                  <p className="px-3 py-6 text-center text-sm text-slate-400">Aucune notification</p>
                )}
                {notifications?.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => !n.readAt && markRead.mutate(n.id)}
                    className={cn(
                      "block w-full rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-sky-50 dark:hover:bg-ink-700",
                      !n.readAt && "bg-sky-50/60 dark:bg-ink-700/60"
                    )}
                  >
                    <p className={cn("font-medium", !n.readAt ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300")}>
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">{n.body}</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="ml-1 flex items-center gap-2 border-l border-slate-100 pl-3 dark:border-ink-700">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-sm font-semibold text-white">
            {user ? `${user.firstName[0]}${user.lastName[0]}` : "?"}
          </div>
          <div className="hidden text-sm sm:block">
            <p className="font-medium text-slate-800 dark:text-white">
              {user ? `${user.firstName} ${user.lastName}` : "Invité"}
            </p>
            <p className="text-xs text-slate-400">{user?.roles?.[0]}</p>
          </div>
          <button onClick={handleLogout} className="ml-2 rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-ink-800">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
