import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export interface ReportCard {
  student: { id: string; firstName: string; lastName: string; registrationNo: string };
  classRoomName: string;
  sessionLabel: string;
  semesterLabel: string | null;
  subjects: { subjectId: string; subjectName: string; coefficient: number; average: number }[];
  overallAverage: number;
  rank: number;
  totalStudents: number;
  mention: string;
  isThirdTrimester: boolean;
  decision: "ADMITTED_NEXT_CLASS" | "REPEAT" | null;
  familyAlert: boolean;
}

export function useReportCard(examSessionId?: string, studentId?: string) {
  return useQuery({
    queryKey: ["report-card", examSessionId, studentId],
    enabled: Boolean(examSessionId && studentId),
    queryFn: async () => {
      const { data } = await api.get(`/report-cards/${examSessionId}/${studentId}`);
      return data.data as ReportCard;
    },
    retry: false,
  });
}

export async function downloadReportCardPdf(examSessionId: string, studentId: string) {
  const { data } = await api.get(`/report-cards/${examSessionId}/${studentId}/pdf`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "bulletin.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
