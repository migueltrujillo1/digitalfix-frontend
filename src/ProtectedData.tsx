import { useState } from "react";
import {
    AuthenticatedTemplate,
    UnauthenticatedTemplate,
} from "@azure/msal-react";
import { useApi } from "./useApi";

export function ProtectedData() {
    const { fetchWithToken } = useApi();
    const [data, setData] = useState<Record<string, unknown> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFetchData = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetchWithToken(`${import.meta.env.VITE_API_URL}/api/home`);
            if (!res.ok) throw new Error(`La API respondió HTTP ${res.status}`);
            const json = await res.json() as Record<string, unknown>;
            setData(json);
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo consultar la API");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <AuthenticatedTemplate>
                <button onClick={handleFetchData} disabled={loading}>
                    {loading ? "Consultando..." : "Obtener Datos del Usuario vía API"}
                </button>
                {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
                {error && <p className="error-message" role="alert">{error}</p>}
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
                <p>
                    ⚠️ Acceso denegado. Debes iniciar sesión para consultar este recurso.
                </p>
            </UnauthenticatedTemplate>
        </div>
    );
}