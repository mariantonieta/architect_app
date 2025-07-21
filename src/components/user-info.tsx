import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { useUser } from "@/hooks/useUser";

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

export function UserInfo() {
  const navigate = useNavigate();

  const {
    data: user,
    isLoading,
    updateUser,
    updateUserStatus,
    deleteUser,
    deleteUserStatus,
  } = useUser();

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
      company: "",
      phone: "",
      address: "",
    },
  });

  useEffect(() => {
    if (!user && !isLoading) {
      navigate("/");
      return;
    }
    if (user) {
      reset({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        entity_type: user.entity_type || "",
        company: user.company || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user, isLoading, navigate, reset]);

  useEffect(() => {
    if (updateUserStatus === "success") {
      setSuccessMsg("Profile updated successfully");
      setError(null);
      setShowPassword(false);
    }
    if (updateUserStatus === "error") {
      setError("Error updating profile");
      setSuccessMsg(null);
    }
  }, [updateUserStatus]);

  useEffect(() => {
    if (deleteUserStatus === "success") {
      navigate("/login");
    }
    if (deleteUserStatus === "error") {
      setError("Error deleting account");
    }
  }, [deleteUserStatus, navigate]);

  function onSubmit(data: FormData) {
    if (!user) return;
    setError(null);
    setSuccessMsg(null);
    updateUser(data);
  }

  function handleDelete() {
    if (!user) return;
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account?"
    );
    if (!confirmDelete) return;
    setError(null);
    deleteUser();
  }

  if (isLoading || !user) return <p>Loading...</p>;
  const loading = updateUserStatus === "pending" || deleteUserStatus === "pending";

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
              <CardTitle className="text-lg font-bold">{user.first_name}</CardTitle>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && <p className="text-red-600">{error}</p>}
          {successMsg && <p className="text-green-600">{successMsg}</p>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-1">
              <Label htmlFor="first_name">First Name</Label>
              <Input id="first_name" {...register("first_name")} disabled={loading} />
            </div>

            <div className="grid gap-1">
              <Label htmlFor="last_name">Last Name</Label>
              <Input id="last_name" {...register("last_name")} disabled={loading} />
            </div>

            <div className="grid gap-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user.email} disabled readOnly />
            </div>

            {/* Si es architect, mostrar entity_type */}
            {user.role === "architect" && (
              <div className="grid gap-1">
                <Label htmlFor="entity_type">Entity Type</Label>
                <Input id="entity_type" {...register("entity_type")} disabled={loading} />
              </div>
            )}

            {/* Si es supplier, mostrar company, phone y address */}
            {user.role === "supplier" && (
              <>
                <div className="grid gap-1">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" {...register("company")} disabled={loading} />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" {...register("phone")} disabled={loading} />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" {...register("address")} disabled={loading} />
                </div>
              </>
            )}

            {showPassword ? (
              <div className="grid gap-1">
                <Label htmlFor="password">New Password</Label>
                <Input id="password" type="password" {...register("password")} disabled={loading} />
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPassword(true)}
                disabled={loading}
              >
                Change Password
              </Button>
            )}

            <div className="grid gap-1">
              <Label>Role</Label>
              <Input value={user.role} disabled />
            </div>

            <div className="flex justify-between mt-6">
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Profile"}
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                {loading ? "Deleting..." : "Delete Account"}
              </Button>
            </div>
          </form>

          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate(-1)}
            type="button"
          >
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
