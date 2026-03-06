import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type UserResponse } from "@shared/routes";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export const USERS_QUERY_KEY = [api.users.list.path];

export function useUsers() {
  return useQuery<UserResponse[]>({
    queryKey: USERS_QUERY_KEY,
    queryFn: () => apiFetch(api.users.list.path),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(buildUrl(api.users.delete.path, { id }), {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      toast({ title: "User deleted", description: "The user has been removed from the system." });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to delete user", description: err.message, variant: "destructive" });
    },
  });
}
