import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import { useLoginWithToken } from "@/hooks/useLoginWithToken";
import { toast } from "sonner";

type FormData = {
  email: string;
  password: string;
};

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();
  // const [error, setError] = useState<string | null>(null);

  const loginWithToken = useLoginWithToken({
    onSuccess: () => {
      navigate("/");
    },
    onError: () => {
      toast.error("Login failed. Please try again.");
      // setError("Invalid credentialsss");
    },
  });

  // useEffect(() => {
  //   debugger
  //   const params = new URLSearchParams(window.location.search);
  //   const token = params.get("access_token");

  //   if (token) {
  //     loginWithToken.mutate(token);
  //     params.delete("access_token");
  //     const url =
  //       window.location.pathname +
  //       (params.toString() ? `?${params.toString()}` : "");
  //     window.history.replaceState({}, document.title, url);
  //   }
  // }, []);

  const onSubmit = async (data: FormData) => {
    // setError(null);
    try {
      const response = await authService.login(data.email, data.password);
      loginWithToken.mutate(response.access_token);
    } catch (err) {
      console.error(err);
      toast.error("Login failed. Please try again.");
      // setError("Invalid credentials");
    }
  };

  return (
    <div
      className={cn("flex justify-center items-center min-h-screen", className)}
      {...props}
    >
      <div className="w-full max-w-md flex flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardDescription>
              <Button
                variant="outline"
                className="w-full mb-4"
                type="button"
                onClick={() => {
                  window.location.href =
                    "http://localhost:8000/auth/google/login";
                }}
              >
                Sign in with Google
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
            {loginWithToken.error && (
              <p className="text-red-600 mb-4 text-center">
                Login failed. Please try again.
              </p>
            )}
            {/* {error && <p className="text-red-600 mb-4 text-center">{error}</p>} */}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    {...register("email", { required: "Email is required" })}
                    aria-invalid={errors.email ? "true" : "false"}
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password", {
                      required: "Password is required",
                    })}
                    aria-invalid={errors.password ? "true" : "false"}
                  />
                  {errors.password && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.password.message}
                    </p>
                  )}
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
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || loginWithToken.isPending}
                >
                  {isSubmitting || loginWithToken.isPending
                    ? "Logging in..."
                    : "Login"}
                </Button>
              </div>
              <div className="text-center text-sm mt-4">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="hover:underline underline-offset-4 text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  Sign up
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
