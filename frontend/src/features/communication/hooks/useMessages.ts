import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface InboxItem {
  id: string;
  readAt: string | null;
  message: { id: string; subject: string; body: string; createdAt: string; sender: { firstName: string; lastName: string } };
}

export interface SentMessage {
  id: string;
  subject: string;
  body: string;
  createdAt: string;
  recipients: { recipient: { firstName: string; lastName: string } }[];
}

export function useInbox() {
  return useQuery({
    queryKey: ["messages-inbox"],
    queryFn: async () => {
      const { data } = await api.get("/messages/inbox");
      return data.data as InboxItem[];
    },
  });
}

export function useSentMessages() {
  return useQuery({
    queryKey: ["messages-sent"],
    queryFn: async () => {
      const { data } = await api.get("/messages/sent");
      return data.data as SentMessage[];
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { schoolId: string; subject: string; body: string; recipientIds: string[] }) => {
      const { data } = await api.post("/messages", payload);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["messages-sent"] }),
  });
}

export function useMarkMessageRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/messages/${id}/read`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["messages-inbox"] }),
  });
}
