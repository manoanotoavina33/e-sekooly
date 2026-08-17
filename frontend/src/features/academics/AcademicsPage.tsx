import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useSchool } from "@/features/settings/hooks/useSchoolSettings";
import { cn } from "@/lib/utils";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ClassRoomFormModal } from "./classrooms/components/ClassRoomFormModal";
import { ClassRoom, useDeleteClassRoom, useClassRooms } from "./classrooms/hooks/useClassRooms";
import { SubjectFormModal } from "./subjects/components/SubjectFormModal";
import { Subject, useDeleteSubject, useSubjects } from "./subjects/hooks/useSubjects";

const LEVEL_SUGGESTIONS: Record<string, string[]> = {
  PRIMARY: ["CP", "CE1", "CE2", "CM1", "CM2"],
  COLLEGE: ["6ème", "5ème", "4ème", "3ème"],
  LYCEE: ["Seconde", "Première", "Terminale"],
  UNIVERSITE: ["L1", "L2", "L3", "M1", "M2", "Doctorat"],
};

const SUBJECT_SUGGESTIONS: Record<string, string[]> = {
  PRIMARY: ["Français", "Mathématiques", "Découverte du monde", "Arts plastiques", "EPS", "Musique"],
  COLLEGE: ["Français", "Mathématiques", "Histoire-Géographie", "SVT", "Physique-Chimie", "Arts plastiques", "EPS", "Musique", "Technologie"],
  LYCEE: ["Français", "Mathématiques", "Histoire-Géographie", "Physique-Chimie", "SVT", "Philosophie", "Arts plastiques", "EPS", "NSI", "SES", "HGGSP"],
  UNIVERSITE: ["Mathématiques", "Physique", "Informatique", "Droit", "Économie", "Médecine", "Langues", "Lettres"],
};

export default function AcademicsPage() {
  const user = useAuthStore((s) => s.user);
  const schoolId = user?.schoolId ?? "";
  const { data: school } = useSchool(schoolId);
  const schoolTypeCodes = school?.schoolTypes.map((st) => st.schoolType.code) ?? [];
  const suggestedLevels = schoolTypeCodes.flatMap((code) => LEVEL_SUGGESTIONS[code] ?? []);
  const suggestedSubjects = schoolTypeCodes.flatMap((code) => SUBJECT_SUGGESTIONS[code] ?? []);

  const isUserAdmin = user?.roles.some((r) =>
    ["ADMIN", "SUPER_ADMIN", "DIRECTOR", "SECRETARY"].includes(r)
  );

  const [tab, setTab] = useState<"classes" | "subjects">("classes");

  // Classes state
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [selectedClassRoom, setSelectedClassRoom] = useState<ClassRoom | null>(null);
  const [deleteClassModalOpen, setDeleteClassModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<ClassRoom | null>(null);

  // Subjects state
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [deleteSubjectModalOpen, setDeleteSubjectModalOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  const { data: classRooms, isLoading: loadingClasses } = useClassRooms(schoolId);
  const { data: subjects, isLoading: loadingSubjects } = useSubjects(schoolId);

  const deleteClassMutation = useDeleteClassRoom();
  const deleteSubjectMutation = useDeleteSubject();

  // Handlers Classes
  function handleCreateClass() {
    setSelectedClassRoom(null);
    setClassModalOpen(true);
  }

  function handleEditClass(c: ClassRoom) {
    setSelectedClassRoom(c);
    setClassModalOpen(true);
  }

  function handleDeleteClassClick(c: ClassRoom) {
    setClassToDelete(c);
    setDeleteClassModalOpen(true);
  }

  async function confirmDeleteClass() {
    if (!classToDelete) return;
    await deleteClassMutation.mutateAsync(classToDelete.id);
    setDeleteClassModalOpen(false);
    setClassToDelete(null);
  }

  // Handlers Subjects
  function handleCreateSubject() {
    setSelectedSubject(null);
    setSubjectModalOpen(true);
  }

  function handleEditSubject(s: Subject) {
    setSelectedSubject(s);
    setSubjectModalOpen(true);
  }

  function handleDeleteSubjectClick(s: Subject) {
    setSubjectToDelete(s);
    setDeleteSubjectModalOpen(true);
  }

  async function confirmDeleteSubject() {
    if (!subjectToDelete) return;
    await deleteSubjectMutation.mutateAsync(subjectToDelete.id);
    setDeleteSubjectModalOpen(false);
    setSubjectToDelete(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Classes &amp; Matières</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Organisez les classes de l'établissement et le catalogue de matières.
          </p>
        </div>
        {isUserAdmin && (
          <Button onClick={() => (tab === "classes" ? handleCreateClass() : handleCreateSubject())}>
            <Plus className="h-4 w-4" /> {tab === "classes" ? "Nouvelle classe" : "Nouvelle matière"}
          </Button>
        )}
      </div>

      <div className="flex gap-2 border-b border-slate-100 dark:border-ink-700">
        {(["classes", "subjects"] as const).map((t) => (
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
            {t === "classes" ? "Classes" : "Matières"}
          </button>
        ))}
      </div>

      {tab === "classes" && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-ink-700">
                <th className="px-5 py-3 font-medium">Classe</th>
                <th className="px-5 py-3 font-medium">Niveau</th>
                <th className="px-5 py-3 font-medium">Filière / Section</th>
                <th className="px-5 py-3 font-medium">Salle</th>
                <th className="px-5 py-3 font-medium">Effectif</th>
                <th className="px-5 py-3 font-medium">Responsable</th>
                {isUserAdmin && <th className="px-5 py-3 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loadingClasses && (
                <tr><td colSpan={isUserAdmin ? 7 : 6} className="px-5 py-8 text-center text-slate-400">Chargement…</td></tr>
              )}
              {!loadingClasses && (classRooms?.length ?? 0) === 0 && (
                <tr><td colSpan={isUserAdmin ? 7 : 6} className="px-5 py-8 text-center text-slate-400">Aucune classe créée.</td></tr>
              )}
              {classRooms?.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 last:border-0 hover:bg-sky-50/50 dark:border-ink-700 dark:hover:bg-ink-700/40">
                  <td className="px-5 py-3 font-medium text-slate-800 dark:text-white">{c.name}</td>
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{c.level}</td>
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{[c.track, c.section].filter(Boolean).join(" / ") || "—"}</td>
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{c.room ?? "—"}</td>
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{c._count?.students ?? 0} / {c.capacity}</td>
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                    {c.homeroomTeacher ? `${c.homeroomTeacher.user.firstName} ${c.homeroomTeacher.user.lastName}` : "—"}
                  </td>
                  {isUserAdmin && (
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditClass(c)} title="Modifier cette classe">
                          <Edit className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteClassClick(c)} title="Supprimer cette classe">
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
      )}

      {tab === "subjects" && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-ink-700">
                <th className="px-5 py-3 font-medium">Matière</th>
                <th className="px-5 py-3 font-medium">Coefficient</th>
                <th className="px-5 py-3 font-medium">Heures / semaine</th>
                {isUserAdmin && <th className="px-5 py-3 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loadingSubjects && (
                <tr><td colSpan={isUserAdmin ? 4 : 3} className="px-5 py-8 text-center text-slate-400">Chargement…</td></tr>
              )}
              {!loadingSubjects && (subjects?.length ?? 0) === 0 && (
                <tr><td colSpan={isUserAdmin ? 4 : 3} className="px-5 py-8 text-center text-slate-400">Aucune matière créée.</td></tr>
              )}
              {subjects?.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-sky-50/50 dark:border-ink-700 dark:hover:bg-ink-700/40">
                  <td className="px-5 py-3 font-medium text-slate-800 dark:text-white">{s.name}</td>
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{s.coefficient}</td>
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{s.hoursPerWeek}h</td>
                  {isUserAdmin && (
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditSubject(s)} title="Modifier cette matière">
                          <Edit className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteSubjectClick(s)} title="Supprimer cette matière">
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
      )}

      {/* Class Form Modal */}
      <ClassRoomFormModal
        open={classModalOpen}
        onClose={() => { setClassModalOpen(false); setSelectedClassRoom(null); }}
        schoolId={schoolId}
        classRoom={selectedClassRoom}
        suggestedLevels={suggestedLevels}
      />

      {/* Subject Form Modal */}
      <SubjectFormModal
        open={subjectModalOpen}
        onClose={() => { setSubjectModalOpen(false); setSelectedSubject(null); }}
        schoolId={schoolId}
        subject={selectedSubject}
        suggestedSubjects={suggestedSubjects}
      />

      {/* Class Delete Confirmation Modal */}
      <Modal
        open={deleteClassModalOpen}
        onClose={() => { setDeleteClassModalOpen(false); setClassToDelete(null); }}
        title="Confirmer la suppression de la classe"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Voulez-vous vraiment supprimer la classe <span className="font-semibold text-slate-900 dark:text-white">{classToDelete?.name}</span> ? Cette action est irréversible.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setDeleteClassModalOpen(false)}>Annuler</Button>
            <Button variant="danger" isLoading={deleteClassMutation.isPending} onClick={confirmDeleteClass}>
              Supprimer définitivement
            </Button>
          </div>
        </div>
      </Modal>

      {/* Subject Delete Confirmation Modal */}
      <Modal
        open={deleteSubjectModalOpen}
        onClose={() => { setDeleteSubjectModalOpen(false); setSubjectToDelete(null); }}
        title="Confirmer la suppression de la matière"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Voulez-vous vraiment supprimer la matière <span className="font-semibold text-slate-900 dark:text-white">{subjectToDelete?.name}</span> ? Cette action est irréversible.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setDeleteSubjectModalOpen(false)}>Annuler</Button>
            <Button variant="danger" isLoading={deleteSubjectMutation.isPending} onClick={confirmDeleteSubject}>
              Supprimer définitivement
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
