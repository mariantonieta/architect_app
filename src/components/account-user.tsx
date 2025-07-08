import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { userService } from "@/services/userService";
import { useUser } from "@/context/UserContext";

type FormData = {
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
  company?: string;
  entity_type?: string;
};

export function AccountUser() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useUser();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      entity_type: "",
    },
  });

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    reset({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      entity_type: user.entity_type || "",
    });
  }, [user, navigate, reset]);

  async function onSubmit(data: FormData) {
    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const updatedUser = await userService.updateUser(user.id, data);
      const normalized = {
        ...user,
        ...updatedUser,
        name: `${updatedUser.first_name || ""} ${
          updatedUser.last_name || ""
        }`.trim(),
      };

      setUser(normalized);
      reset({
        first_name: updatedUser.first_name || "",
        last_name: updatedUser.last_name || "",
        email: updatedUser.email || "",
        entity_type: updatedUser.entity_type || "",
      });

      setSuccessMsg("Profile updated successfully");
      setShowPassword(false);
    } catch (e: any) {
      setError(e.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!user) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!confirmDelete) return;

    setLoading(true);
    setError(null);

    try {
      await userService.deleteUser(user.id);
      logout();
      navigate("/login");
    } catch (e: any) {
      setError(e.message || "Error deleting account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 rounded-full bg-gray-300">
              <AvatarFallback className="rounded-lg text-black flex items-center justify-center">
                {user?.first_name?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-bold">
                {user?.first_name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {user?.email || "email@example.com"}
              </p>
              {user?.entity_type && (
                <p className="text-sm text-muted-foreground">
                  Entity Type: {user.entity_type}
                </p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && <p className="text-red-600">{error}</p>}
          {successMsg && <p className="text-green-600">{successMsg}</p>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-1">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                type="text"
                {...register("first_name")}
                disabled={loading}
              />
              {errors.first_name && (
                <p className="text-red-500 text-sm">
                  {errors.first_name.message}
                </p>
              )}
            </div>

            <div className="grid gap-1">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                type="text"
                {...register("last_name")}
                disabled={loading}
              />
              {errors.last_name && (
                <p className="text-red-500 text-sm">
                  {errors.last_name.message}
                </p>
              )}
            </div>
            <div className="grid gap-1">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    value={user?.email || ""}
    disabled
    readOnly
  />
</div>

            {user?.role === "architect" && (
              <div className="grid gap-1">
                <Label htmlFor="entity_type">Entity Type</Label>
                <Input
                  id="entity_type"
                  type="text"
                  {...register("entity_type")}
                  disabled={loading}
                />
              </div>
            )}

            {!showPassword && (
              <Button
                type="button"
                variant="outline"
                className="mt-2"
                onClick={() => setShowPassword(true)}
                disabled={loading}
              >
                Change Password
              </Button>
            )}

            {showPassword && (
              <div className="grid gap-1">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  disabled={loading}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>
            )}
            <div className="grid gap-1">
              <Label>Role</Label>
              <Input value={user?.role || ""} disabled />
            </div>

            <div className="flex justify-between mt-6">
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Profile"}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
                type="button"
              >
                {loading ? "Deleting..." : "Delete Account"}
              </Button>
            </div>
          </form>

          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              try {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate("/");
                }
              } catch {
                navigate("/");
              }
            }}
            type="button"
          >
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
