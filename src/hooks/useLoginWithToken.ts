import { useUser, normalizeUser } from "@/context/UserContext"
import { AUTH_STORAGE } from "@/lib/constants"
import { userService } from "@/services/userService"
import { jwtDecode } from "jwt-decode"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export function useLoginWithToken(token: string | null | undefined) {
    const navigate = useNavigate()
    const [error, setError] = useState<string | null>(null)
    const { setUser } = useUser()

    useEffect(() => {
        if (!token) return

        const login = async () => {
            try {
                localStorage.setItem(AUTH_STORAGE, token)

                const decoded: any = jwtDecode(token)
                const userId = decoded?.sub
                console.log("Decoded token:", decoded)

                if (!userId) {
                    throw new Error("Invalid token: missing 'sub'")
                }

                const userData = await userService.getUserById(userId)

                if (!userData) {
                    throw new Error("User data not found")
                }
                const normalizedUser = normalizeUser(userData)

                localStorage.setItem("user", JSON.stringify(normalizedUser))
                setUser(normalizedUser)

                window.history.replaceState({}, document.title, window.location.pathname)
                navigate("/")
            } catch (err: any) {
                setError("Could not complete login")
            }
        }

        login()
    }, [token, navigate, setUser])

    return { error }
}
