import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { authService } from "@/services/authServices";
import { AUTH_STORAGE } from "@/lib/constants";

export function useLoginWithToken(token: string | null) {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return;

        const login = async () => {
            try {
                localStorage.setItem(AUTH_STORAGE, token);

                const decoded: any = jwtDecode(token);
                const userId = decoded?.sub;

                if (!userId) {
                    throw new Error("Token inválido: no contiene 'sub'");
                }

                const userData = await authService.getUserById(userId);

                if (!userData) {
                    throw new Error("No se encontraron datos del usuario");
                }

                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        id: userId,
                        name: userData.first_name,
                        email: userData.email,
                        role: userData.role_name,
                    })
                );

                window.history.replaceState({}, document.title, window.location.pathname);
                navigate("/");
            } catch (err: any) {
                console.error("Error login with token:", err);
                setError("The login could not be completed");
            }
        };

        login();
    }, [token, navigate]);

    return { error };
}
