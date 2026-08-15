import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useEmployees } from "@/features/teachers/hooks/useEmployees";
import { LogIn, LogOut } from "lucide-react";
import { useStaffAttendance, useStaffCheckin, useStaffCheckout } from "../hooks/useStaffAttendance";

function formatTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function StaffAttendanceTable({ schoolId }: { schoolId: string }) {
  const today = new Date().toISOString().slice(0, 10);
  const { data: employeesData } = useEmployees({ schoolId, pageSize: 100 });
  const { data: attendance } = useStaffAttendance({ schoolId, from: today, to: today });
  const checkin = useStaffCheckin();
  const checkout = useStaffCheckout();

  const attendanceByEmployee = new Map((attendance ?? []).map((a) => [a.employeeId, a]));

  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-ink-700">
            <th className="px-5 py-3 font-medium">Employé</th>
            <th className="px-5 py-3 font-medium">Arrivée</th>
            <th className="px-5 py-3 font-medium">Départ</th>
            <th className="px-5 py-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {employeesData?.data.map((emp) => {
            const record = attendanceByEmployee.get(emp.id);
            return (
              <tr key={emp.id} className="border-b border-slate-50 last:border-0 dark:border-ink-700">
                <td className="px-5 py-3 font-medium text-slate-800 dark:text-white">
                  {emp.user.firstName} {emp.user.lastName}
                </td>
                <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{formatTime(record?.checkIn ?? null)}</td>
                <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{formatTime(record?.checkOut ?? null)}</td>
                <td className="px-5 py-3">
                  {!record?.checkIn ? (
                    <Button size="sm" variant="secondary" onClick={() => checkin.mutate(emp.id)} isLoading={checkin.isPending}>
                      <LogIn className="h-3.5 w-3.5" /> Arrivée
                    </Button>
                  ) : !record?.checkOut ? (
                    <Button size="sm" variant="secondary" onClick={() => checkout.mutate(emp.id)} isLoading={checkout.isPending}>
                      <LogOut className="h-3.5 w-3.5" /> Départ
                    </Button>
                  ) : (
                    <span className="text-xs text-emerald-600">Journée complète ✓</span>
                  )}
                </td>
              </tr>
            );
          })}
          {(employeesData?.data.length ?? 0) === 0 && (
            <tr>
              <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                Aucun employé trouvé.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}
