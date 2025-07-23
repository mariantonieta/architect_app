import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLoginWithToken } from "../hooks/useLoginWithToken";

const styles = {
  container: {
    display: "flex" as const,
    flexDirection: "column" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    minHeight: "50vh",
    padding: "20px"
  },
  errorContainer: {
    textAlign: "center" as const
  },
  errorText: {
    color: "red",
    marginBottom: "16px"
  },
  button: {
    padding: "8px 16px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer" as const
  },
  loadingContainer: {
    textAlign: "center" as const
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #3498db",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px"
  },
  subtitle: {
    fontSize: "14px",
    color: "#666"
  }
};

export default function GoogleAuthRedirect() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const hasExecuted = useRef(false);
  
  const token = searchParams.get("access_token");

  // Validar que el token existe y no está vacío
  const isValidToken = token && token.trim().length > 0;

  const loginWithToken = useLoginWithToken({
    onSuccess: () => {
      console.log("Login successful - cleaning URL and redirecting");
      // Limpiar el token de la URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("access_token");
      setSearchParams(newSearchParams, { replace: true });
      
      // Asegurar redirección con un pequeño delay
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 0);
    },
    onError: (error) => {
      console.error("Login error:", error);
      // Redirigir al login en caso de error
      navigate("/login?error=google_auth_failed", { replace: true });
    },
  });

  // Manejar login con token válido
  useEffect(() => {
    if (isValidToken && !loginWithToken.isPending && !hasExecuted.current) {
      hasExecuted.current = true;
      loginWithToken.mutate(token);
    }
  }, [isValidToken, token, loginWithToken.mutate, loginWithToken.isPending]);

  useEffect(() => {
    if (loginWithToken.isSuccess) {
      console.log("Login successful, should redirect to home");
    }
  }, [loginWithToken.isSuccess]);

  return (
    <div style={styles.container}>
      {loginWithToken.isError ? (
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>
            Login with Google failed. Please try again.
          </p>
          <button 
            onClick={() => navigate("/login", { replace: true })}
            style={styles.button}
          >
            Back to Login
          </button>
        </div>
      ) : (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
          <p>Authenticating with Google...</p>
          <p style={styles.subtitle}>
            Please wait while we log you in.
          </p>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
