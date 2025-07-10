
import { normalizeUser } from "@/types/user";
import { AUTH_STORAGE } from "@/lib/constants";
import { userService } from "@/services/userService";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
export function useLoginWithToken(
    options?: {
        onSuccess?: () => void;
        onError?: (err: unknown) => void;
    }
) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (token: string) => {
            localStorage.setItem(AUTH_STORAGE, token);
            const decoded: any = jwtDecode(token);
            const userId = decoded?.sub;
            if (!userId) throw new Error("Invalid token");

            const userData = await userService.getUserById(userId);
            if (!userData) throw new Error("User not found");

            localStorage.setItem("user_id", userId);

            const normalizedUser = normalizeUser(userData);
            queryClient.setQueryData(["user"], normalizedUser);
            return normalizedUser;
        },
        onSuccess: () => {
            window.history.replaceState({}, document.title, window.location.pathname);
            if (options?.onSuccess) {
                options.onSuccess();
            } else {
                navigate("/");
            }
        },
        onError: (err) => {
            console.error("Login with token failed", err);
            options?.onError?.(err);
        },
    });
}
