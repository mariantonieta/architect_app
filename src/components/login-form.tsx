import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authServices";
import { useNavigate } from "react-router-dom";
import { AUTH_STORAGE } from "@/lib/constants";
import { jwtDecode } from "jwt-decode";
import { ResetPasswordRequest } from "./reset-password-request";

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
          throw new Error("Invalid token: missing 'sub'");
        }

        const userData = await authService.getUserById(userId);

        if (!userData) {
          throw new Error("User data not found");
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
        console.error("Error logging in with token:", err);
        setError("Could not complete login");
      }
    };

    login();
  }, [token, navigate]);

  return { error };
}

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const token = params.get("access_token");

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
                Google
              </Button>
            </CardDescription>
            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
              <span className="bg-card text-muted-foreground relative z-10 px-2">Or</span>
            </div>
            <CardTitle className="text-xl">Login</CardTitle>
          </CardHeader>
          <CardContent>
            {googleLoginError && (
              <p className="text-red-600 mb-4 text-center">{googleLoginError}</p>
            )}

            <form onSubmit={handleSubmit}>
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
                  onClick={(e) => {
    e.preventDefault();
    navigate("/reset-password");
  }}
                >
                  Forgot your password?
                </a>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </div>
              <div className="text-center text-sm mt-4">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="underline underline-offset-4 text-blue-600 hover:text-blue-800"
                >
                  Sign up
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-muted-foreground text-center text-xs mt-4">
          By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
          and <a href="#">Privacy Policy</a>.
        </div>
      </div>
    </div>
  );
}
