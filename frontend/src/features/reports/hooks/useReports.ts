import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export interface ReportSummary {
  id: string;
  label: string;
  module: string;
  description: string;
}

export function useReportList() {
  return useQuery({
    queryKey: ["report-list"],
    queryFn: async () => {
      const { data } = await api.get("/reports");
      return data.data as ReportSummary[];
    },
  });
}

export type ReportFormat = "csv" | "xlsx" | "pdf";

const MIME_TYPES: Record<ReportFormat, string> = {
  csv: "text/csv",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pdf: "application/pdf",
};

export async function downloadReport(
  reportId: string,
  format: ReportFormat,
  params: Record<string, string | undefined>
) {
  const { data } = await api.get(`/reports/${reportId}/export`, {
    params: { format, ...params },
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([data], { type: MIME_TYPES[format] }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${reportId}.${format}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
