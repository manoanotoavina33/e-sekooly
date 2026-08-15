import axios from "axios";
import { useAuthStore } from "@/hooks/useAuthStore";
import { enqueueMutation } from "@/lib/offlineDb";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const MUTATION_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (!original || original._skipQueue) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry && !isRefreshing) {
      original._retry = true;
      isRefreshing = true;
      try {
        const { data } = await api.post("/auth/refresh");
        useAuthStore.getState().setAccessToken(data.data.accessToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().clear();
      } finally {
        isRefreshing = false;
      }
    }

    if (!navigator.onLine && MUTATION_METHODS.has(original.method ?? "GET")) {
      try {
        await enqueueMutation({
          method: original.method ?? "POST",
          url: original.url ?? "",
          headers: (original.headers as Record<string, string>) ?? {},
          body: original.data,
          createdAt: new Date().toISOString(),
        });
        return { data: { success: true, queued: true } } as any;
      } catch {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

let isRefreshing = false;
