import React, { useState } from "react";
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

export function ResetPasswordRequest({ className }: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authService.recoverPassword(email);
      navigate("/login"); 
    } catch (err) {
      setError("Failed to send the email. Please check the address.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex justify-center items-center min-h-screen", className)}>
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
            <CardTitle className="text-xl">Reset Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Enter your email to reset your password</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="youremail@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error && <p className="text-red-600">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Email"}
                </Button>
              </div>
              <div className="text-center text-sm mt-4">
                Remembered your password?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="underline underline-offset-4 text-blue-600 hover:text-blue-800"
                >
                  Back to login
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
