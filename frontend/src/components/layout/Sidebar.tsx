import { Logo } from "@/components/ui/Logo";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useSchool } from "@/features/settings/hooks/useSchoolSettings";
import { cn } from "@/lib/utils";
import {
  BarChart3, BookOpen, Calendar, ClipboardList, GraduationCap, LayoutDashboard, Lock,
  MessageSquare, Settings, ShieldAlert, UserCheck, Users, Wallet, X
} from "lucide-react";
import { NavLink } from "react-router-dom";

interface NavItem {
  label: string;
  to?: string;
  icon: React.ElementType;
  comingSoon?: boolean;
}

// Module 1 : seul le Dashboard et les Paramètres sont fonctionnels.
// Les autres entrées sont affichées "à venir" pour montrer la feuille de
// route complète du logiciel (elles seront activées module par module).
const NAV_ITEMS: NavItem[] = [
  { label: "Tableau de bord", to: "/dashboard", icon: LayoutDashboard },
  { label: "Élèves", to: "/students", icon: GraduationCap },
  { label: "Enseignants", to: "/teachers", icon: Users },
  { label: "Classes & Matières", to: "/academics", icon: BookOpen },
  { label: "Emploi du temps", to: "/timetable", icon: Calendar },
  { label: "Présence", to: "/attendance", icon: UserCheck },
  { label: "Examens & Notes", to: "/examinations", icon: ClipboardList },
  { label: "Discipline", to: "/discipline", icon: ShieldAlert },
  { label: "Communication", to: "/communication", icon: MessageSquare },
  { label: "Finances", to: "/finance", icon: Wallet },
  { label: "Caisse", to: "/cashier", icon: Wallet },
  { label: "Rapports", to: "/reports", icon: BarChart3 },
  { label: "Paramètres", to: "/settings", icon: Settings },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = useAuthStore((s) => s.user);
  const schoolId = user?.schoolId ?? "";
  const { data: school } = useSchool(schoolId);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-100 bg-white transition-transform duration-200 dark:border-ink-700 dark:bg-ink-800",
          "lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Logo src={school?.logoUrl ?? undefined} />
          <button onClick={onClose} className="lg:hidden text-slate-400">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            if (item.comingSoon || !item.to) {
              return (
                <div
                  key={item.label}
                  className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 dark:text-slate-500"
                  title="Module à venir"
                >
                  <Icon className="h-4.5 w-4.5" />
                  {item.label}
                  <Lock className="ml-auto h-3.5 w-3.5" />
                </div>
              );
            }
            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sky-500 text-white shadow-glow"
                      : "text-slate-600 hover:bg-sky-50 dark:text-slate-300 dark:hover:bg-ink-700"
                  )
                }
              >
                <Icon className="h-4.5 w-4.5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-400 dark:border-ink-700">
          Connecté en tant que{" "}
          <span className="font-medium text-slate-600 dark:text-slate-300">
            {user?.roles?.[0] ?? "Utilisateur"}
          </span>
        </div>
      </aside>
    </>
  );
}
