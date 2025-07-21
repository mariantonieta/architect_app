import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { Building2, Package, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { authService } from "@/services/authServices";

import { useForm } from "react-hook-form";

type RoleType = "architect" | "customer" | "supplier";

const userTypes = [
  { label: "Architect", value: "architect", icon: Building2 },
  { label: "Supplier", value: "supplier", icon: Package },
  { label: "Customer", value: "customer", icon: Users },
];

type FormData = {
  role: RoleType;
  password: string;
  confirmPassword: string;
  architect_info?: string;
  customer_phone?: string;
  customer_address?: string;
  supplier_phone?: string;
  supplier_address?: string;
  company?: string;
};

export function GoogleCompleteRegistration({ className, ...props }: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const location = useLocation();

  const [userId, setUserId] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      role: "architect",
      password: "",
      confirmPassword: "",
      architect_info: "",
      customer_phone: "",
      customer_address: "",
      supplier_phone: "",
      supplier_address: "",
      company: "",
    },
  });

  const role = watch("role");
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get("user_id");
    if (id) setUserId(id);
  }, [location.search]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    setError(null);

    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (data.role === "architect" && !data.architect_info?.trim()) {
      setError("Architect info is required");
      return;
    }

    if (data.role === "customer" && !data.customer_phone?.trim()) {
      setError("Customer phone is required");
      return;
    }

    if (
      data.role === "supplier" &&
      (!data.supplier_phone?.trim() ||
        !data.company?.trim() ||
        !data.supplier_address?.trim())
    ) {
      setError("Supplier phone, company, and address are required");
      return;
    }

    if (!userId) {
      setError("User ID missing");
      return;
    }

    setLoading(true);

    try {
      const payload: Record<string, string> = {
        user_id: userId,
        role: data.role,
        password: data.password,
        confirm_password: data.confirmPassword,
      };

      if (data.role === "architect") {
        payload.architect_info = data.architect_info!;
      }
      if (data.role === "customer") {
        payload.customer_phone = data.customer_phone!;
        payload.customer_address = data.customer_address || "";
      }
      if (data.role === "supplier") {
        payload.supplier_phone = data.supplier_phone!;
        payload.company = data.company!;
        payload.supplier_address = data.supplier_address!;
      }

      const res = await authService.completeGoogleRegistration(payload);

      if (res.access_token) {
        navigate(`/auth/google/callback?access_token=${res.access_token}`);
      } else {
        setError("Token no recibido");
      }
    } catch (err) {
      console.error(err);
      setError("Falló el registro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex justify-center items-center min-h-screen", className)} {...props}>
      <div className="w-full max-w-md flex flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-semibold">Complete your registration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="role">Select your role:</Label>
                <RadioGroup
                  id="role"
                  value={role}
                  onValueChange={(val) => setValue("role", val as RoleType)}
                  className="grid grid-cols-3 gap-2"
                  
                >
                  {userTypes.map(({ label, value, icon: Icon }) => (
                    <Label
                      key={value}
                      htmlFor={`role-${value}`}
                      className="flex items-center gap-2 border rounded-lg p-3 cursor-pointer hover:border-primary data-[state=checked]:border-primary transition-all"
                    >
                      <RadioGroupItem id={`role-${value}`} value={value} {...register("role")} />
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Minimum length is 6" },
                  })}
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              {role === "architect" && (
                <div className="grid gap-3">
                  <Label htmlFor="architect_info">Entity Type</Label>
                  <Input
                    id="architect_info"
                    type="text"
                    {...register("architect_info", {
                      required: "Architect info is required",
                    })}
                  />
                  {errors.architect_info && (
                    <p className="text-sm text-red-600">{errors.architect_info.message}</p>
                  )}
                </div>
              )}

              {(role === "customer" || role === "supplier") && (
                <>
                  <div className="grid gap-3">
                    <Label htmlFor={role === "customer" ? "customer_phone" : "supplier_phone"}>
                      Phone
                    </Label>
                    <Input
                      id={role === "customer" ? "customer_phone" : "supplier_phone"}
                      type="text"
                      {...register(role === "customer" ? "customer_phone" : "supplier_phone", {
                        required: "Phone is required",
                      })}
                    />
                    {errors.customer_phone && (
                      <p className="text-sm text-red-600">{errors.customer_phone.message}</p>
                    )}
                    {errors.supplier_phone && (
                      <p className="text-sm text-red-600">{errors.supplier_phone.message}</p>
                    )}
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor={role === "customer" ? "customer_address" : "supplier_address"}>
                      Address
                    </Label>
                    <Input
                      id={role === "customer" ? "customer_address" : "supplier_address"}
                      type="text"
                      {...register(role === "customer" ? "customer_address" : "supplier_address")}
                    />
                  </div>
                </>
              )}

              {role === "supplier" && (
                <div className="grid gap-3">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    type="text"
                    {...register("company", { required: "Company is required" })}
                  />
                  {errors.company && (
                    <p className="text-sm text-red-600">{errors.company.message}</p>
                  )}
                </div>
              )}

              {error && <p className="text-red-600">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Submitting..." : "Complete Registration"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
