import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { Building2, Package, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type RoleType = "architect" | "customer" | "supplier";

const userTypes = [
  { label: "Architect", value: "architect", icon: Building2 },
  { label: "Supplier", value: "supplier", icon: Package },
  { label: "Customer", value: "customer", icon: Users },
];

export function GoogleCompleteRegistration({ className, ...props }: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const location = useLocation();

  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<RoleType>("architect");

  const [formData, setFormData] = useState({
    architect_info: "",
    customer_phone: "",
    customer_address: "",
    supplier_phone: "",
    supplier_address: "",
    company: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get("user_id");
    if (id) setUserId(id);
  }, [location.search]);

  if (!userId) {
    return (
      <div className="text-red-600 text-center mt-10">Error: Missing user ID</div>
    );
  }

  const handleRoleChange = (value: RoleType) => {
    setRole(value);
    setFormData({
      architect_info: "",
      customer_phone: "",
      customer_address: "",
      supplier_phone: "",
      supplier_address: "",
      company: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validatePasswords = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!formData.password || !formData.confirmPassword) {
      setError("Password and confirmation are required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validatePasswords()) {
      return;
    }

    if (role === "architect" && !formData.architect_info.trim()) {
      setError("Architect info is required");
      return;
    }
    if (role === "customer" && !formData.customer_phone.trim()) {
      setError("Customer phone is required");
      return;
    }
    if (
      role === "supplier" &&
      (!formData.supplier_phone.trim() ||
        !formData.company.trim() ||
        !formData.supplier_address.trim())
    ) {
      setError("Supplier phone, company, and address are required");
      return;
    }

    setLoading(true);

    try {
      const payload: Record<string, string> = {
        user_id: userId,
        role,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      };

      if (role === "architect") {
        payload.architect_info = formData.architect_info;
      }
      if (role === "customer") {
        payload.customer_phone = formData.customer_phone;
        payload.customer_address = formData.customer_address;
      }
      if (role === "supplier") {
        payload.supplier_phone = formData.supplier_phone;
        payload.company = formData.company;
        payload.supplier_address = formData.supplier_address;
      }

      const response = await fetch(
        "http://localhost:8000/auth/google/complete-registration",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(payload).toString(),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error("Error from server:", errText);
        setError("Registration failed");
        setLoading(false);
        return;
      }

      navigate("/");
    } catch (err) {
      console.error("Network error:", err);
      setError("Network error");
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
            <form onSubmit={handleSubmit} className="grid gap-6">
              
              <div className="grid gap-3">
                <Label htmlFor="role">Select your role:</Label>
                <RadioGroup
                  id="role"
                  value={role}
                  onValueChange={handleRoleChange}
                  className="grid grid-cols-3 gap-2"
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

              {[
                { id: "password", label: "Password", type: "password" },
                { id: "confirmPassword", label: "Confirm Password", type: "password" },
              ].map(({ id, label, type }) => (
                <div key={id} className="grid gap-3">
                  <Label htmlFor={id}>{label}</Label>
                  <Input
                    id={id}
                    name={id}
                    type={type}
                    required
                    value={formData[id as keyof typeof formData]}
                    onChange={handleChange}
                  />
                </div>
              ))}

              {role === "architect" && (
                <div className="grid gap-3">
                  <Label htmlFor="architect_info">Architect Info</Label>
                  <Input
                    id="architect_info"
                    name="architect_info"
                    type="text"
                    required
                    value={formData.architect_info}
                    onChange={handleChange}
                  />
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
                      name={role === "customer" ? "customer_phone" : "supplier_phone"}
                      type="text"
                      required
                      value={
                        formData[role === "customer" ? "customer_phone" : "supplier_phone"]
                      }
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor={role === "customer" ? "customer_address" : "supplier_address"}>
                      Address
                    </Label>
                    <Input
                      id={role === "customer" ? "customer_address" : "supplier_address"}
                      name={role === "customer" ? "customer_address" : "supplier_address"}
                      type="text"
                      value={
                        formData[role === "customer" ? "customer_address" : "supplier_address"]
                      }
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              {role === "supplier" && (
                <div className="grid gap-3">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    required
                    value={formData.company}
                    onChange={handleChange}
                  />
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
