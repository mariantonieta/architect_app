import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginWithToken } from "../hooks/useLoginWithToken";

export default function GoogleAuthRedirect() {
  const navigate = useNavigate();
  const [localError, setLocalError] = useState<string | null>(null);

  const params = new URLSearchParams(window.location.search);
  const token = params.get("access_token");

  const loginWithToken = useLoginWithToken({
    onSuccess: () => {
      params.delete("access_token");
      const url = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
      window.history.replaceState({}, document.title, url);
      navigate("/");
    },
    onError: () => {
      setLocalError("Login with Google failed. Please try again.");
    },
  });

  useEffect(() => {
    if (token) {
      loginWithToken.mutate(token);
    }
  }, [token, loginWithToken]);

  if (!token) return null;

  return (
    <div style={{ textAlign: "center", paddingTop: "50px" }}>
      {localError ? (
        <p style={{ color: "red" }}>{localError}</p>
      ) : (
        <p>Redirecting, please wait...</p>
      )}
    </div>
  );
}
