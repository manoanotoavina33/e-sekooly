import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useSchool } from "@/features/settings/hooks/useSchoolSettings";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { EmployeeFormModal } from "./components/EmployeeFormModal";
import { Employee, useDeleteEmployee, useEmployees } from "./hooks/useEmployees";

const POSITION_SUGGESTIONS: Record<string, string[]> = {
  PRIMARY: ["Instituteur", "Instituteur adjoint", "Directeur d'école", "Secrétaire"],
  COLLEGE: ["Professeur", "Professeur principal", "Conseiller principal d'éducation", "Surveillant", "Secrétaire"],
  LYCEE: ["Professeur", "Professeur principal", "Conseiller principal d'éducation", "Surveillant", "Secrétaire"],
  UNIVERSITE: ["Professeur des universités", "Maître de conférences", "ATER", "Doctorant", "Secrétaire"],
};

export default function TeachersPage() {
  const user = useAuthStore((s) => s.user);
  const schoolId = user?.schoolId ?? "";
  const { data: school } = useSchool(schoolId);
  const schoolTypeCodes = school?.schoolTypes.map((st) => st.schoolType.code) ?? [];
  const suggestedPositions = schoolTypeCodes.flatMap((code) => POSITION_SUGGESTIONS[code] ?? []);

  const isUserAdmin = user?.roles.some((r) =>
    ["ADMIN", "SUPER_ADMIN", "DIRECTOR"].includes(r)
  );

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const { data, isLoading } = useEmployees({ schoolId, search, page, pageSize: 10 });
  const deleteEmployeeMutation = useDeleteEmployee();

  const employees = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 10));

  function handleCreate() {
    setSelectedEmployee(null);
    setFormOpen(true);
  }

  function handleEdit(emp: Employee) {
    setSelectedEmployee(emp);
    setFormOpen(true);
  }

  function handleDeleteClick(emp: Employee) {
    setEmployeeToDelete(emp);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!employeeToDelete) return;
    await deleteEmployeeMutation.mutateAsync(employeeToDelete.id);
    setDeleteModalOpen(false);
    setEmployeeToDelete(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Enseignants &amp; Personnel
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{total} employé(s) enregistré(s)</p>
        </div>
        {isUserAdmin && (
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4" /> Nouveau recrutement
          </Button>
        )}
      </div>

      <Input
        placeholder="Rechercher par nom, matricule ou poste…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="max-w-sm"
      />

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-ink-700">
                <th className="px-5 py-3 font-medium">Matricule</th>
                <th className="px-5 py-3 font-medium">Nom complet</th>
                <th className="px-5 py-3 font-medium">Poste</th>
                <th className="px-5 py-3 font-medium">Département</th>
                <th className="px-5 py-3 font-medium">Statut</th>
                {isUserAdmin && <th className="px-5 py-3 font-medium text-right">Actions</th>}
              </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={isUserAdmin ? 6 : 5} className="px-5 py-8 text-center text-slate-400">
                  Chargement…
                </td>
              </tr>
            )}
            {!isLoading && employees.length === 0 && (
              <tr>
                <td colSpan={isUserAdmin ? 6 : 5} className="px-5 py-8 text-center text-slate-400">
                  Aucun employé trouvé.
                </td>
              </tr>
            )}
            {employees.map((emp) => (
              <tr
                key={emp.id}
                className="border-b border-slate-50 last:border-0 hover:bg-sky-50/50 dark:border-ink-700 dark:hover:bg-ink-700/40"
              >
                <td className="px-5 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{emp.employeeNo}</td>
                <td className="px-5 py-3 font-medium text-slate-800 dark:text-white">
                  {emp.user.firstName} {emp.user.lastName}
                </td>
                <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{emp.position}</td>
                <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{emp.department ?? "—"}</td>
                <td className="px-5 py-3">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold",
                      emp.isActive
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    )}
                  >
                    {emp.isActive ? "Actif" : "Inactif"}
                  </span>
                </td>
                {isUserAdmin && (
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(emp)} title="Modifier cet employé">
                        <Edit className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(emp)} title="Supprimer cet employé">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Précédent
          </Button>
          <span className="text-sm text-slate-500">
            Page {page} / {totalPages}
          </span>
          <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Suivant
          </Button>
        </div>
      )}

      {/* Employee Form Modal (Create & Edit) */}
      <EmployeeFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedEmployee(null);
        }}
        schoolId={schoolId}
        employee={selectedEmployee}
        suggestedPositions={suggestedPositions}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setEmployeeToDelete(null);
        }}
        title="Confirmer la suppression"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Êtes-vous sûr de vouloir supprimer l'employé{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {employeeToDelete?.user.firstName} {employeeToDelete?.user.lastName}
            </span>{" "}
            ({employeeToDelete?.employeeNo}) ? Cette action est irréversible.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="danger"
              isLoading={deleteEmployeeMutation.isPending}
              onClick={confirmDelete}
            >
              Supprimer définitivement
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
