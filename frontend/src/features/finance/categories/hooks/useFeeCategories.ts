import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface FeeCategory {
  id: string;
  name: string;
  description: string | null;
}

export function useFeeCategories(schoolId: string) {
  return useQuery({
    queryKey: ["fee-categories", schoolId],
    enabled: Boolean(schoolId),
    queryFn: async () => {
      const { data } = await api.get("/finance/categories", { params: { schoolId } });
      return data.data as FeeCategory[];
    },
  });
}

export function useCreateFeeCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { schoolId: string; name: string; description?: string }) => {
      const { data } = await api.post("/finance/categories", payload);
      return data.data as FeeCategory;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fee-categories"] }),
  });
}
