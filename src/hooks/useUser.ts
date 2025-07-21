import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import { normalizeUser, type User } from "@/types/user";
import { AUTH_STORAGE } from "@/lib/constants";

export function useUser() {
  const queryClient = useQueryClient();
  const token = localStorage.getItem(AUTH_STORAGE);
  const userId = token ? JSON.parse(atob(token.split(".")[1]))?.sub : null;

  const userQuery = useQuery<User>({
    queryKey: ["user", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID not found");
      const userData = await userService.getUserById(userId);
      return normalizeUser(userData);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const updateUserMutation = useMutation({
    mutationFn: (data: Partial<User>) => userService.updateUser(userId, data),
    onSuccess: (updatedData) => {
      const normalized = normalizeUser(updatedData);
      queryClient.setQueryData(["user", userId], normalized);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: () => userService.deleteUser(userId),
    onSuccess: () => {
      localStorage.removeItem("user");
      localStorage.removeItem("auth_token");
      queryClient.removeQueries({ queryKey: ["user", userId] });
queryClient.removeQueries({ queryKey: ["currentUser"] });

    },
  });

  return {
    ...userQuery,
    updateUser: updateUserMutation.mutate,
    updateUserStatus: updateUserMutation.status,
    deleteUser: deleteUserMutation.mutate,
    deleteUserStatus: deleteUserMutation.status,
  };
}
