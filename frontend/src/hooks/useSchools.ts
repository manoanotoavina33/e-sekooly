import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export interface School {
  id: string;
  name: string;
  shortName: string;
  currency: string;
}

export function useSchools() {
  return useQuery({
    queryKey: ["schools"],
    queryFn: async () => {
      const { data } = await api.get("/schools");
      return data.data as School[];
    },
  });
}
