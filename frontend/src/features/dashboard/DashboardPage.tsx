import { Card } from "@/components/ui/Card";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useStudents } from "@/features/students/hooks/useStudents";
import { useTeacherCount } from "@/features/teachers/hooks/useEmployees";
import { useClassRooms } from "@/features/academics/classrooms/hooks/useClassRooms";
import { GraduationCap, School, Users, UserPlus, FileSpreadsheet, ArrowRight, CheckCircle2 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { StatCard } from "./StatCard";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const schoolId = user?.schoolId ?? "";

  // Dynamic counts & real data
  const { data: studentsData, isLoading: studentsLoading } = useStudents({ schoolId, pageSize: 10 });
  const studentCount = studentsData?.meta.total;
  const recentStudents = studentsData?.data.slice(0, 5) ?? [];

  const { data: teacherCount, isLoading: teachersLoading } = useTeacherCount(schoolId);
  const { data: classRooms, isLoading: classRoomsLoading } = useClassRooms(schoolId);

  const totalClasses = classRooms?.length ?? 0;

  // Calcul dynamique du nombre d'élèves par classe pour le graphique
  const classDistribution = (classRooms ?? []).map((c) => ({
    name: c.name,
    effectif: c._count?.students ?? 0,
  }));

  const colors = ["#0284c7", "#0d9488", "#16a34a", "#ca8a04", "#9333ea", "#e11d48"];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Bonjour {user?.firstName ?? ""} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Aperçu en temps réel de votre établissement scolaire.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/students"
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-500 transition-colors"
          >
            <UserPlus className="h-4 w-4" /> Gérer les élèves
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Élèves inscrits"
          value={studentsLoading ? "…" : studentCount !== undefined ? String(studentCount) : "0"}
          icon={GraduationCap}
          accent="bg-sky-500"
          trend={studentCount !== undefined ? { value: `${studentCount} au total`, direction: "up" } : undefined}
        />
        <StatCard
          label="Classes actives"
          value={classRoomsLoading ? "…" : String(totalClasses)}
          icon={School}
          accent="bg-amber-500"
          trend={{ value: `${totalClasses} ouvertes`, direction: "up" }}
        />
        <StatCard
          label="Enseignants & Personnel"
          value={teachersLoading ? "…" : teacherCount !== undefined ? String(teacherCount) : "0"}
          icon={Users}
          accent="bg-emerald-500"
          trend={teacherCount !== undefined ? { value: `${teacherCount} actifs`, direction: "up" } : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Graphique de répartition des élèves par classe */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-800 dark:text-white">
                Répartition des élèves par classe
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Effectifs enregistrés par salle de classe</p>
            </div>
            <Link to="/academics/classrooms" className="text-xs font-medium text-sky-600 hover:underline dark:text-sky-400 flex items-center gap-1">
              Voir tout <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {classDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={classDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} className="text-xs" />
                <Tooltip
                  cursor={{ fill: "rgba(0, 0, 0, 0.04)" }}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                />
                <Bar dataKey="effectif" radius={[6, 6, 0, 0]} barSize={36}>
                  {classDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-52 items-center justify-center text-sm text-slate-400">
              Aucune classe enregistrée pour le moment.
            </div>
          )}
        </Card>

        {/* Derniers élèves inscrits */}
        <Card className="flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-slate-800 dark:text-white">
              Dernières inscriptions
            </h2>
            <Link to="/students" className="text-xs font-medium text-sky-600 hover:underline dark:text-sky-400">
              Tous
            </Link>
          </div>

          <div className="flex flex-col divide-y divide-slate-100 dark:divide-ink-700">
            {studentsLoading && <p className="py-6 text-center text-xs text-slate-400">Chargement...</p>}
            {!studentsLoading && recentStudents.length === 0 && (
              <p className="py-6 text-center text-xs text-slate-400">Aucun élève inscrit.</p>
            )}
            {recentStudents.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-800 dark:text-white">
                    {s.firstName} {s.lastName}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{s.registrationNo}</span>
                </div>
                <span className="rounded-md bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                  {s.classRoom?.name ?? "Non assigné"}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Raccourcis & Modules prêts */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          to="/students"
          className="group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 transition-all hover:border-sky-300 hover:shadow-md dark:border-ink-700 dark:bg-ink-800"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                Module Élèves
              </p>
              <p className="text-xs text-slate-400">Gestion complète &amp; filtres</p>
            </div>
          </div>
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        </Link>

        <Link
          to="/academics/classrooms"
          className="group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 transition-all hover:border-amber-300 hover:shadow-md dark:border-ink-700 dark:bg-ink-800"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <School className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Salles de classes
              </p>
              <p className="text-xs text-slate-400">Niveaux &amp; capacités</p>
            </div>
          </div>
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        </Link>

        <Link
          to="/teachers"
          className="group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 transition-all hover:border-emerald-300 hover:shadow-md dark:border-ink-700 dark:bg-ink-800"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Enseignants &amp; Staff
              </p>
              <p className="text-xs text-slate-400">Effectifs &amp; postes</p>
            </div>
          </div>
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        </Link>
      </div>
    </div>
  );
}

