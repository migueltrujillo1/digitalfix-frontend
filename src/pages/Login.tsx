import { useState } from "react";
import { InteractionStatus } from "@azure/msal-browser";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { Navigate } from "react-router-dom";
import { loginRequest } from "../authConfig";

export function Login() {
    const { instance, inProgress } = useMsal();
    const isAuthenticated = useIsAuthenticated();
    const [error, setError] = useState("");

    if (isAuthenticated) return <Navigate to="/dashboard" replace />;

    const handleLogin = async () => {
        if (inProgress !== InteractionStatus.None) return;
        setError("");
        try {
            await instance.loginRedirect(loginRequest);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "No se pudo iniciar sesión con Microsoft");
        }
    };

    return (
        <main className="login-page">
            <section className="login-card">
                <span className="brand-mark">DF</span>
                <h1>Bienvenido a DigitalFix</h1>
                <p>Plataforma para órdenes de trabajo de mantención eléctrica.</p>
                {error && <p className="error-message" role="alert">{error}</p>}
                <button type="button" onClick={() => void handleLogin()}
                    disabled={inProgress !== InteractionStatus.None}>
                    {inProgress !== InteractionStatus.None ? "Conectando..." : "Iniciar sesión con Microsoft"}
                </button>
            </section>
        </main>
    );
}
