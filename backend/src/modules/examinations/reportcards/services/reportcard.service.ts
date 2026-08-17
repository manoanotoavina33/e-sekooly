import { NotFoundError } from "../../../../core/errors/AppError";
import { reportCardRepository } from "../repositories/reportcard.repository";

export interface SubjectResult {
  subjectId: string;
  subjectName: string;
  coefficient: number;
  average: number; // moyenne de l'élève dans cette matière, ramenée sur 20
}

export interface ReportCard {
  student: { id: string; firstName: string; lastName: string; registrationNo: string };
  classRoomName: string;
  sessionLabel: string;
  semesterLabel: string | null;
  subjects: SubjectResult[];
  overallAverage: number;
  rank: number;
  totalStudents: number;
  mention: string;
  isThirdTrimester: boolean;
  decision: "ADMITTED_NEXT_CLASS" | "REPEAT" | null;
  familyAlert: boolean;
}

function computeMention(average: number): string {
  if (average >= 16) return "Très Bien";
  if (average >= 14) return "Bien";
  if (average >= 12) return "Assez Bien";
  if (average >= 10) return "Passable";
  return "Insuffisant";
}

/**
 * Calcule, pour chaque élève, la moyenne par matière (ramenée sur 20) puis
 * la moyenne générale pondérée par les coefficients — exigence "Calcul
 * automatique / Moyenne" du module Notes.
 */
function computeStudentAverages(
  grades: Awaited<ReturnType<typeof reportCardRepository.findClassGradesForSession>>
) {
  const byStudent = new Map<string, Map<string, { name: string; coefficient: number; scores: number[] }>>();

  for (const grade of grades) {
    const studentMap = byStudent.get(grade.studentId) ?? new Map();
    const subjectEntry = studentMap.get(grade.exam.subjectId) ?? {
      name: grade.exam.subject.name,
      coefficient: grade.exam.subject.coefficient,
      scores: [] as number[],
    };
    subjectEntry.scores.push((grade.score / grade.exam.maxScore) * 20);
    studentMap.set(grade.exam.subjectId, subjectEntry);
    byStudent.set(grade.studentId, studentMap);
  }

  const results = new Map<
    string,
    { subjects: SubjectResult[]; overallAverage: number }
  >();

  for (const [studentId, subjectMap] of byStudent) {
    const subjects: SubjectResult[] = Array.from(subjectMap.entries()).map(([subjectId, entry]) => ({
      subjectId,
      subjectName: entry.name,
      coefficient: entry.coefficient,
      average: Math.round((entry.scores.reduce((a, b) => a + b, 0) / entry.scores.length) * 100) / 100,
    }));

    const totalCoefficient = subjects.reduce((sum, s) => sum + s.coefficient, 0);
    const weightedSum = subjects.reduce((sum, s) => sum + s.average * s.coefficient, 0);
    const overallAverage = totalCoefficient > 0 ? Math.round((weightedSum / totalCoefficient) * 100) / 100 : 0;

    results.set(studentId, { subjects, overallAverage });
  }

  return results;
}

export const reportCardService = {
  async generate(examSessionId: string, studentId: string): Promise<ReportCard> {
    const session = await reportCardRepository.findSession(examSessionId);
    const student = await reportCardRepository.findStudent(studentId);
    const semester = session?.semesterId ? await reportCardRepository.findSemester(session.semesterId) : null;
    if (!session) throw new NotFoundError("Session d'examens");
    if (!student) throw new NotFoundError("Élève");
    if (!student.classRoomId) throw new NotFoundError("Classe de l'élève");

    const grades = await reportCardRepository.findClassGradesForSession(examSessionId, student.classRoomId);
    const averages = computeStudentAverages(grades);

    const ranking = Array.from(averages.entries())
      .map(([id, data]) => ({ id, overallAverage: data.overallAverage }))
      .sort((a, b) => b.overallAverage - a.overallAverage);

    const rank = ranking.findIndex((r) => r.id === studentId) + 1;
    const studentResult = averages.get(studentId);

    if (!studentResult) {
      throw new NotFoundError("Notes de l'élève pour cette session (aucune note saisie)");
    }

    const semesterLabel = semester?.label ?? null;
    const isThirdTrimester = Boolean(
      semesterLabel && (
        semesterLabel.toLowerCase().includes("3") ||
        semesterLabel.toLowerCase().includes("troisième") ||
        semesterLabel.toLowerCase().includes("trimestre 3")
      )
    );
    const decision = isThirdTrimester
      ? studentResult.overallAverage >= 10
        ? "ADMITTED_NEXT_CLASS"
        : "REPEAT"
      : null;
    const familyAlert = studentResult.overallAverage < 4;

    return {
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        registrationNo: student.registrationNo,
      },
      classRoomName: student.classRoom!.name,
      sessionLabel: session.label,
      semesterLabel,
      subjects: studentResult.subjects,
      overallAverage: studentResult.overallAverage,
      rank,
      totalStudents: ranking.length,
      mention: computeMention(studentResult.overallAverage),
      isThirdTrimester,
      decision,
      familyAlert,
    };
  },
};
