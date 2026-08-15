import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useClassRooms } from "@/features/academics/classrooms/hooks/useClassRooms";
import { Download, Edit, Plus, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { StudentFormModal } from "./components/StudentFormModal";
import { StudentStatusBadge } from "./components/StudentStatusBadge";
import { Student, useDeleteStudent, useStudents } from "./hooks/useStudents";

export default function StudentsPage() {
  const user = useAuthStore((s) => s.user);
  const schoolId = user?.schoolId ?? "";

  // Dynamic authorization check: ADMIN or SUPER_ADMIN or users with 'students.manage' / 'students.create'
  const isUserAdmin = user?.roles.some((r) =>
    ["ADMIN", "SUPER_ADMIN", "DIRECTOR", "SECRETARY"].includes(r)
  );

  const [search, setSearch] = useState("");
  const [classRoomId, setClassRoomId] = useState("");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const { data: classRooms } = useClassRooms(schoolId);
  const { data, isLoading } = useStudents({ schoolId, search, classRoomId, page, pageSize: 10 });
  const deleteStudentMutation = useDeleteStudent();

  const students = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 10));

  function handleCreate() {
    setSelectedStudent(null);
    setFormOpen(true);
  }

  function handleEdit(student: Student) {
    setSelectedStudent(student);
    setFormOpen(true);
  }

  function handleDeleteClick(student: Student) {
    setStudentToDelete(student);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!studentToDelete) return;
    await deleteStudentMutation.mutateAsync(studentToDelete.id);
    setDeleteModalOpen(false);
    setStudentToDelete(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Élèves</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{total} élève(s) enregistré(s)</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="md">
            <Upload className="h-4 w-4" /> Import Excel
          </Button>
          <Button variant="secondary" size="md">
            <Download className="h-4 w-4" /> Export Excel
          </Button>
          {isUserAdmin && (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4" /> Nouvel élève
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <Input
          placeholder="Rechercher par nom ou matricule…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
        <div className="flex flex-col gap-1.5 min-w-[200px]">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Filtrer par classe</label>
          <select
            value={classRoomId}
            onChange={(e) => {
              setClassRoomId(e.target.value);
              setPage(1);
            }}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-400 dark:border-ink-700 dark:bg-ink-800 dark:text-white"
          >
            <option value="">Toutes les classes</option>
            {classRooms?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.level})
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-ink-700">
              <th className="px-5 py-3 font-medium">Matricule</th>
              <th className="px-5 py-3 font-medium">Nom complet</th>
              <th className="px-5 py-3 font-medium">Classe</th>
              <th className="px-5 py-3 font-medium">Statut</th>
              {isUserAdmin && <th className="px-5 py-3 font-medium text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={isUserAdmin ? 5 : 4} className="px-5 py-8 text-center text-slate-400">
                  Chargement…
                </td>
              </tr>
            )}
            {!isLoading && students.length === 0 && (
              <tr>
                <td colSpan={isUserAdmin ? 5 : 4} className="px-5 py-8 text-center text-slate-400">
                  Aucun élève trouvé.
                </td>
              </tr>
            )}
            {students.map((student) => (
              <tr
                key={student.id}
                className="border-b border-slate-50 last:border-0 hover:bg-sky-50/50 dark:border-ink-700 dark:hover:bg-ink-700/40"
              >
                <td className="px-5 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                  {student.registrationNo}
                </td>
                <td className="px-5 py-3 font-medium text-slate-800 dark:text-white">
                  {student.firstName} {student.lastName}
                </td>
                <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                  {student.classRoom?.name ?? "—"}
                </td>
                <td className="px-5 py-3">
                  <StudentStatusBadge status={student.status} />
                </td>
                {isUserAdmin && (
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(student)}
                        title="Modifier cet élève"
                      >
                        <Edit className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(student)}
                        title="Supprimer cet élève"
                      >
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

      {/* Form Modal for Create & Update */}
      <StudentFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedStudent(null);
        }}
        schoolId={schoolId}
        student={selectedStudent}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setStudentToDelete(null);
        }}
        title="Confirmer la suppression"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Êtes-vous sûr de vouloir supprimer l'élève{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {studentToDelete?.firstName} {studentToDelete?.lastName}
            </span>{" "}
            ({studentToDelete?.registrationNo}) ? Cette action est irréversible.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="danger"
              isLoading={deleteStudentMutation.isPending}
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
