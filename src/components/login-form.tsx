import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService } from "@/services/authServices"
import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { AUTH_STORAGE } from "@/lib/constants"
import { jwtDecode } from "jwt-decode"

function useLoginWithToken(token: string | null) {
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
        console.error("Error en login con token:", err);
        setError("No se pudo completar el login");
      }
    };

    login();
  }, [token, navigate]);

  return { error };
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Extraemos el token de la URL
  const params = new URLSearchParams(window.location.search);
  const token = params.get("access_token");

  // Usamos el hook para login con token (Google)
  const { error: googleLoginError } = useLoginWithToken(token);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await authService.login(email, password);

      localStorage.setItem(AUTH_STORAGE, data.access_token);

      const decodedToken: any = jwtDecode(data.access_token);
      const userId = decodedToken.sub;

      if (!userId) {
        throw new Error("User ID not found in token");
      }

      const userData = await authService.getUserById(userId);

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: userId,
          name: userData.first_name,
          email: userData.email,
          role: userData.role_name,
        })
      );

      console.log("Login successful:", data, userData);
      navigate("/");
    } catch (err: any) {
      console.error(err);
      setError("Invalid credentials or server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex justify-center items-center min-h-screen", className)} {...props}>
      <div className="w-full max-w-md flex flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
                <CardDescription>
              <Button
                variant="outline"
                className="w-full mb-4"
                type="button"
                onClick={() => {
                  window.location.href = "http://localhost:8000/auth/google/login";
                }}
              >
                {/* SVG Google icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2" style={{width: "18px", height: "18px"}}>
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
               Google
              </Button>
            </CardDescription>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or 
                  </span>
                </div>
            <CardTitle className="text-xl">Login</CardTitle>
           
          </CardHeader>
          <CardContent>
            {/* Mostrar error del login con Google */}
            {googleLoginError && <p className="text-red-600 mb-4 text-center">{googleLoginError}</p>}

            <form onSubmit={handleSubmit}>
              <div className="grid gap-6">
            
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="underline underline-offset-4 text-blue-600 hover:text-blue-800"
                  >
                    Sign up
                  </button>
                </div>
              </div>
            </form>
             
    
          </CardContent>
           
        </Card>
         
        <div className="text-muted-foreground text-center text-xs">
          By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
          and <a href="#">Privacy Policy</a>.
        </div>
      </div>
    </div>
  )
}
