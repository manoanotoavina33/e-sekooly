"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportCardService = void 0;
const AppError_1 = require("../../../../core/errors/AppError");
const reportcard_repository_1 = require("../repositories/reportcard.repository");
function computeMention(average) {
    if (average >= 16)
        return "Très Bien";
    if (average >= 14)
        return "Bien";
    if (average >= 12)
        return "Assez Bien";
    if (average >= 10)
        return "Passable";
    return "Insuffisant";
}
/**
 * Calcule, pour chaque élève, la moyenne par matière (ramenée sur 20) puis
 * la moyenne générale pondérée par les coefficients — exigence "Calcul
 * automatique / Moyenne" du module Notes.
 */
function computeStudentAverages(grades) {
    const byStudent = new Map();
    for (const grade of grades) {
        const studentMap = byStudent.get(grade.studentId) ?? new Map();
        const subjectEntry = studentMap.get(grade.exam.subjectId) ?? {
            name: grade.exam.subject.name,
            coefficient: grade.exam.subject.coefficient,
            scores: [],
        };
        subjectEntry.scores.push((grade.score / grade.exam.maxScore) * 20);
        studentMap.set(grade.exam.subjectId, subjectEntry);
        byStudent.set(grade.studentId, studentMap);
    }
    const results = new Map();
    for (const [studentId, subjectMap] of byStudent) {
        const subjects = Array.from(subjectMap.entries()).map(([subjectId, entry]) => ({
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
exports.reportCardService = {
    async generate(examSessionId, studentId) {
        const [session, student] = await Promise.all([
            reportcard_repository_1.reportCardRepository.findSession(examSessionId),
            reportcard_repository_1.reportCardRepository.findStudent(studentId),
        ]);
        if (!session)
            throw new AppError_1.NotFoundError("Session d'examens");
        if (!student)
            throw new AppError_1.NotFoundError("Élève");
        if (!student.classRoomId)
            throw new AppError_1.NotFoundError("Classe de l'élève");
        const grades = await reportcard_repository_1.reportCardRepository.findClassGradesForSession(examSessionId, student.classRoomId);
        const averages = computeStudentAverages(grades);
        // Classement : tri décroissant des moyennes générales de toute la classe.
        const ranking = Array.from(averages.entries())
            .map(([id, data]) => ({ id, overallAverage: data.overallAverage }))
            .sort((a, b) => b.overallAverage - a.overallAverage);
        const rank = ranking.findIndex((r) => r.id === studentId) + 1;
        const studentResult = averages.get(studentId);
        if (!studentResult) {
            throw new AppError_1.NotFoundError("Notes de l'élève pour cette session (aucune note saisie)");
        }
        return {
            student: {
                id: student.id,
                firstName: student.firstName,
                lastName: student.lastName,
                registrationNo: student.registrationNo,
            },
            classRoomName: student.classRoom.name,
            sessionLabel: session.label,
            subjects: studentResult.subjects,
            overallAverage: studentResult.overallAverage,
            rank,
            totalStudents: ranking.length,
            mention: computeMention(studentResult.overallAverage),
        };
    },
};
//# sourceMappingURL=reportcard.service.js.map