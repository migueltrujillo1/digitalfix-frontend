import { useCallback, useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { useApi } from "../useApi";
import type { KpiResponse } from "../types";

export function Dashboard() {
    const { accounts } = useMsal();
    const { request } = useApi();
    const [kpis, setKpis] = useState<KpiResponse | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchKpis = useCallback(
        () => request<KpiResponse>("/api/report/kpis?range=last24h"),
        [request],
    );

    const loadKpis = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setKpis(await fetchKpis());
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "No se pudieron cargar los indicadores");
        } finally {
            setLoading(false);
        }
    }, [fetchKpis]);

    useEffect(() => {
        let active = true;
        fetchKpis()
            .then((data) => { if (active) setKpis(data); })
            .catch((cause: unknown) => {
                if (active) setError(cause instanceof Error ? cause.message : "No se pudieron cargar los indicadores");
            })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [fetchKpis]);

    const metrics = [
        ["Total de órdenes", kpis?.totalOrdenes],
        ["Creadas", kpis?.creadas],
        ["Asignadas", kpis?.asignadas],
        ["En ejecución", (kpis?.enDesplazamiento ?? 0) + (kpis?.enEjecucion ?? 0)],
        ["Cerradas", kpis?.cerradas],
        ["Canceladas", kpis?.canceladas],
    ] as const;

    return (
        <section className="page">
            <header className="page-heading">
                <div>
                    <h2>Panel de operaciones</h2>
                    <p>Bienvenido, <strong>{accounts[0]?.name || accounts[0]?.username}</strong>.</p>
                </div>
                <button className="button-secondary" type="button" onClick={() => void loadKpis()} disabled={loading}>
                    Actualizar
                </button>
            </header>
            <h3>Indicadores de las últimas 24 horas</h3>
            {error && <p className="error-message" role="alert">{error}</p>}
            {loading ? <p role="status">Cargando indicadores...</p> : kpis && (
                <div className="metric-grid">
                    {metrics.map(([label, value]) => (
                        <article className="metric-card" key={label}>
                            <span>{label}</span>
                            <strong>{value ?? 0}</strong>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
