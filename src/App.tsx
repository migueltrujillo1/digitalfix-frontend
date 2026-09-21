import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { loginRequest } from "./authConfig";
import { ProtectedData } from "./ProtectedData";
import "./App.css";

export default function App() {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const currentUser = instance.getActiveAccount() || accounts[0];

  const handleLogin = () => inProgress === InteractionStatus.None && instance.loginRedirect(loginRequest).catch(console.error);
  const handleLogout = () => inProgress === InteractionStatus.None && instance.logoutRedirect({ postLogoutRedirectUri: window.location.origin }).catch(console.error);

  return <main className="app-shell">
    <header className="topbar"><div><span className="eyebrow">Plataforma de gestión técnica</span><h1>DigitalFix</h1></div>{isAuthenticated && <button className="secondary" onClick={handleLogout}>Cerrar sesión</button>}</header>
    {!isAuthenticated ? <section className="login-card"><h2>Acceso al portal técnico</h2><p>Autenticación institucional mediante Microsoft Entra ID.</p><button onClick={handleLogin} disabled={inProgress !== InteractionStatus.None}>{inProgress !== InteractionStatus.None ? "Autenticando..." : "Iniciar sesión con Microsoft"}</button></section>
    : <><div className="welcome"><div><span>Usuario autenticado</span><strong>{currentUser?.name || currentUser?.username}</strong></div><span className="status-dot">● Sesión activa</span></div><ProtectedData /></>}
  </main>;
}
