import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Package, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  company: string;
  entity_type: string;
  role: "customer" | "supplier" | "architect";
};

export function RegisterForm({ className, ...props }: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  

  const [formData, setFormData] = useState<RegisterFormData>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    company: "",
    entity_type: "",
    role: "architect",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: RegisterFormData["role"]) => {
    setFormData((prev) => ({
      ...prev,
      role: value,
      phone: "",
      address: "",
      company: "",
      entity_type: "",
    }));
  };

  const validatePasswords = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!validatePasswords()) return;

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        confirm_password: formData.confirmPassword,
      };
      await authService.register(submitData);
      navigate("/login");
    } catch (err) {
      setError("Registration failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex justify-center items-center min-h-screen", className)} {...props}>
      <div className="w-full max-w-md flex flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Create an Account</CardTitle>
            <CardDescription>Sign up to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-6">

              <div className="grid gap-3">
                <Label htmlFor="role">Role:</Label>
                <RadioGroup
                  id="role"
                  value={formData.role}
                  onValueChange={handleRoleChange}
                  className="grid grid-cols-2 gap-2"
                  disabled
                >
                  {userTypes.map(({ label, value, icon: Icon }) => (
                    <Label
                      key={value}
                      htmlFor={`role-${value}`}
                      className="flex items-center gap-2 border rounded-lg p-3 cursor-pointer hover:border-primary data-[state=checked]:border-primary transition-all"
                    >
                      <RadioGroupItem id={`role-${value}`} value={value} />
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              {/* Inputs básicos */}
              {[
                { id: "first_name", label: "First Name", required: true, type: "text" },
                { id: "last_name", label: "Last Name", required: true, type: "text" },
                { id: "email", label: "Email", required: true, type: "email" },
                { id: "password", label: "Password", required: true, type: "password" },
                { id: "confirmPassword", label: "Confirm Password", required: true, type: "password" },
              ].map(({ id, label, required, type }) => (
                <div key={id} className="grid gap-3">
                  <Label htmlFor={id}>{label}</Label>
                  <Input
                    id={id}
                    name={id}
                    type={type}
                    required={required}
                    value={formData[id as keyof RegisterFormData] as string}
                    onChange={handleInputChange}
                  />
                </div>
              ))}

              {/* Campos condicionales */}
              {["supplier", "customer"].includes(formData.role) && (
                <>
                  {["phone", "address"].map((field) => (
                    <div key={field} className="grid gap-3">
                      <Label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                      <Input
                        id={field}
                        name={field}
                        type="text"
                        value={formData[field as keyof RegisterFormData] || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  ))}
                </>
              )}

              {formData.role === "architect" && (
                <div className="grid gap-3">
                  <Label htmlFor="entity_type">Entity Type</Label>
                  <Input
                    id="entity_type"
                    name="entity_type"
                    type="text"
                    value={formData.entity_type}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {formData.role === "supplier" && (
                <div className="grid gap-3">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleInputChange}
                  />
                </div>
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
