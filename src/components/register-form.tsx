import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Building2, Package, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {jwtDecode} from "jwt-decode"; 

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { authService } from "@/services/authServices";

const userTypes = [
  { label: "Architect", value: "architect", icon: Building2 },
  { label: "Supplier", value: "supplier", icon: Package },
  { label: "Customer", value: "customer", icon: Users },
];

type RegisterFormData = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  address?: string;
  company?: string;
  entity_type?: string;
  role: "customer" | "supplier" | "architect";
};

type JwtPayload = {
  sub: string;
  role: string;
  exp: number;
};

export function RegisterForm({ className, ...props }: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [decodedRole, setDecodedRole] = useState<RegisterFormData["role"] | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      role: "architect",
    },
  });

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        console.log("Token decodificado:", decoded); 
        if (decoded.role) {
          const roleValue = decoded.role as RegisterFormData["role"];
          setValue("role", roleValue, { shouldValidate: true });
          setDecodedRole(roleValue);
        }
      } catch (error) {
        console.error("Invalid token", error);
           setDecodedRole("architect");
      }
    }
  }, [searchParams, setValue]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const role = watch("role");
  const selectedRole = decodedRole ?? role;

  const password = watch("password");

  const onRoleChange = (value: string) => {

    if (!decodedRole) {
      setValue("role", value as RegisterFormData["role"], { shouldValidate: true });
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    setLoading(true);
    try {
      const { confirmPassword, ...rest } = data;
      const submitData = { ...rest, confirm_password: confirmPassword };
      await authService.register(submitData);
      console.log(JSON.stringify(submitData, null, 2));
      navigate("/login");
    } catch (err) {
      setError("Registration failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex justify-center items-center min-h-screen pt-12", className)} {...props}>
      <div className="w-full max-w-md flex flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Create an Account</CardTitle>
            <CardDescription>Sign up to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="role">Role</Label>
                <RadioGroup
                  id="role"
                  value={selectedRole}
                  onValueChange={onRoleChange}
                  className="grid grid-cols-2 gap-2"
                >
                  {userTypes.map(({ label, value, icon: Icon }) => (
                    <Label
                      key={value}
                      htmlFor={`role-${value}`}
                      className="flex items-center gap-2 border rounded-lg p-3 cursor-pointer hover:border-primary data-[state=checked]:border-primary transition-all"
                    >
                      <RadioGroupItem
                        id={`role-${value}`}
                        value={value}
                        {...register("role")}
                        disabled={decodedRole !== null && decodedRole !== value}
                      />
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  type="text"
                  {...register("first_name", { required: "First name is required" })}
                />
                {errors.first_name && (
                  <p className="text-sm text-red-500">{errors.first_name.message}</p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  type="text"
                  {...register("last_name", { required: "Last name is required" })}
                />
                {errors.last_name && (
                  <p className="text-sm text-red-500">{errors.last_name.message}</p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", { required: "Email is required" })}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Password must be at least 6 characters" },
                  })}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) => value === password || "Passwords do not match",
                  })}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>

              {["supplier", "customer"].includes(selectedRole) && (
                <>
                  {["phone", "address"].map((field) => (
                    <div key={field} className="grid gap-3">
                      <Label htmlFor={field}>
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </Label>
                      <Input id={field} type="text" {...register(field as keyof RegisterFormData)} />
                    </div>
                  ))}
                </>
              )}

              {selectedRole === "architect" && (
                <div className="grid gap-3">
                  <Label htmlFor="entity_type">Entity Type</Label>
                  <Input id="entity_type" type="text" {...register("entity_type")} />
                </div>
              )}

              {selectedRole === "supplier" && (
                <div className="grid gap-3">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" type="text" {...register("company")} />
                </div>
              )}

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Sign Up"}
              </Button>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <a href="/login" className="underline underline-offset-4">
                  Login
                </a>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-muted-foreground text-center text-xs">
          By signing up, you agree to our{" "}
          <a href="#" className="underline underline-offset-4">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline underline-offset-4">
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </div>
  );
}
