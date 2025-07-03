import { useLoginWithToken } from "../hooks/useLoginWithToken";

export default function GoogleAuthRedirect() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("access_token");
  const { error } = useLoginWithToken(token);

  return (
    <div style={{ textAlign: "center", paddingTop: "50px" }}>
      {error ? <p style={{ color: "red" }}>{error}</p> : <p>Redirigiendo, espera...</p>}
    </div>
  );
}
