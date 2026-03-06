import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type TaskResponse } from "@shared/routes";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export const TASKS_QUERY_KEY = [api.tasks.list.path];

export function useTasks() {
  return useQuery<TaskResponse[]>({
    queryKey: TASKS_QUERY_KEY,
    queryFn: () => apiFetch(api.tasks.list.path),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: any) =>
      apiFetch(api.tasks.create.path, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      toast({ title: "Task created", description: "Your new task has been saved." });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to create task", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & any) =>
      apiFetch(buildUrl(api.tasks.update.path, { id }), {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to update task", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(buildUrl(api.tasks.delete.path, { id }), {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      toast({ title: "Task deleted", description: "The task was successfully removed." });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to delete task", description: err.message, variant: "destructive" });
    },
  });
}
