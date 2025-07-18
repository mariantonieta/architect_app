import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import { normalizeUser, type User } from "@/types/user";
import { AUTH_STORAGE } from "@/lib/constants";

export function useCurrentUser() {
  const token = localStorage.getItem(AUTH_STORAGE);
  const userId = token ? JSON.parse(atob(token.split(".")[1]))?.sub : null;

  const query = useQuery<User>({
    queryKey: ["currentUser", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID not found");
      const userData = await userService.getUserById(userId);
      return normalizeUser(userData);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
    error: query.error,
    role: query.data?.role,
    isArchitect: query.data?.role === "architect",
    isCustomer: query.data?.role === "customer", 
    isSupplier: query.data?.role === "supplier",
  };
}
