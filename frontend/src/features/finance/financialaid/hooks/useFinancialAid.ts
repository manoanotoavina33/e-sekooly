import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type FinancialAidType = "SCHOLARSHIP" | "DISCOUNT";

export interface FinancialAid {
  id: string;
  type: FinancialAidType;
  label: string;
  percentage: number | null;
  fixedAmount: number | null;
  isActive: boolean;
  student: { firstName: string; lastName: string; registrationNo: string };
}

export function useFinancialAids(schoolId: string, studentId?: string) {
  return useQuery({
    queryKey: ["financial-aids", schoolId, studentId],
    enabled: Boolean(schoolId),
    queryFn: async () => {
      const { data } = await api.get("/finance/financial-aid", { params: { schoolId, studentId } });
      return data.data as FinancialAid[];
    },
  });
}

export function useCreateFinancialAid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      schoolId: string;
      studentId: string;
      type: FinancialAidType;
      label: string;
      percentage?: number;
      fixedAmount?: number;
    }) => {
      const { data } = await api.post("/finance/financial-aid", payload);
      return data.data as FinancialAid;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["financial-aids"] }),
  });
}
