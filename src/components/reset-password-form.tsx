import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/services/authServices";
import { useTranslation } from "react-i18next";

export function ResetPasswordForm() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromURL = params.get("token");

    if (tokenFromURL) {
      setToken(tokenFromURL);

      const cleanUrl = location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [location]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError(t("auth.dontMatch"));
      return;
    }

    if (!token) {
      setError(t("auth.tokenRequired"));
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      navigate("/login");
    } catch (err) {
      setError("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl font-bold ">
              {t("auth.reset")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="token" className="mb-2">
                  Token
                </Label>
                <Input
                  id="token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  placeholder={t("auth.tokenEmail")}
                />
              </div>

              <div>
                <Label htmlFor="new-password" className="mb-2">
                  {t("auth.newPassword")}
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder={t("auth.newPassword")}
                />
              </div>

              <div>
                <Label htmlFor="confirm-password" className="mb-2">
                  {t("auth.confirmPassword ")}
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder={t("auth.confirmPassword")}
                />
              </div>

              {error && <p className="text-red-600 text-center">{error}</p>}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? t("auth.resetting") : t("auth.reset")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
