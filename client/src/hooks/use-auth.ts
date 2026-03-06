import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type UserResponse, type AuthResponse } from "@shared/routes";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export const AUTH_QUERY_KEY = ["/api/users/me"];

export function useAuth() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery<UserResponse | null>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      if (!localStorage.getItem("auth_token")) return null;
      try {
        const data = await apiFetch(api.users.me.path);
        return data;
      } catch (err: any) {
        if (err.status === 401) {
          localStorage.removeItem("auth_token");
        }
        return null;
      }
    },
    staleTime: Infinity,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const res: AuthResponse = await apiFetch(api.auth.login.path, {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      return res;
    },
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.token);
      queryClient.setQueryData(AUTH_QUERY_KEY, data.user);
      toast({ title: "Welcome back", description: `Logged in as ${data.user.username}` });
    },
    onError: (err: Error) => {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const res: AuthResponse = await apiFetch(api.auth.register.path, {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      return res;
    },
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.token);
      queryClient.setQueryData(AUTH_QUERY_KEY, data.user);
      toast({ title: "Account created", description: "Welcome to the application!" });
    },
    onError: (err: Error) => {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
    },
  });

  const logout = () => {
    localStorage.removeItem("auth_token");
    queryClient.setQueryData(AUTH_QUERY_KEY, null);
    queryClient.clear(); // Clear all cached data
    toast({ title: "Logged out", description: "You have been securely logged out." });
  };

  return {
    user,
    isLoading,
    error,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
