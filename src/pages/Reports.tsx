import { useCallback, useEffect, useState } from "react";
import { useApi } from "../useApi";
import type { KpiResponse } from "../types";

const ranges = [
    { value: "last24h", label: "Últimas 24 horas" },
    { value: "last7d", label: "Últimos 7 días" },
    { value: "last30d", label: "Últimos 30 días" },
];

export function Reports() {
    const { request } = useApi();
    const [range, setRange] = useState("last24h");
    const [report, setReport] = useState<KpiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchReport = useCallback(
        () => request<KpiResponse>(`/api/report/kpis?range=${range}`),
        [range, request],
    );

    const loadReport = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setReport(await fetchReport());
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "No se pudo cargar el reporte");
        } finally {
            setLoading(false);
        }
    }, [fetchReport]);

    useEffect(() => {
        let active = true;
        fetchReport()
            .then((data) => { if (active) setReport(data); })
            .catch((cause: unknown) => {
                if (active) setError(cause instanceof Error ? cause.message : "No se pudo cargar el reporte");
            })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [fetchReport]);

    const exportCsv = () => {
        if (!report) return;
        const rows = [
            ["Indicador", "Cantidad"],
            ["Período", report.periodo],
            ["Total de órdenes", String(report.totalOrdenes)],
            ["Creadas", String(report.creadas)],
            ["Asignadas", String(report.asignadas)],
            ["En desplazamiento", String(report.enDesplazamiento)],
            ["En ejecución", String(report.enEjecucion)],
            ["Cerradas", String(report.cerradas)],
            ["Canceladas", String(report.canceladas)],
        ];
        const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\r\n");
        const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = `digitalfix-reporte-${range}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const metrics: [string, number][] = report ? [
        ["Total de órdenes", report.totalOrdenes],
        ["Creadas", report.creadas],
        ["Asignadas", report.asignadas],
        ["En desplazamiento", report.enDesplazamiento],
        ["En ejecución", report.enEjecucion],
        ["Cerradas", report.cerradas],
        ["Canceladas", report.canceladas],
    ] : [];

    return (
        <section className="page">
            <header className="page-heading">
                <div>
                    <h2>Reportería</h2>
                    <p>Indicadores consultados desde el servicio de reportes.</p>
                </div>
                <div className="form-actions">
                    <select value={range} onChange={(event) => setRange(event.target.value)} aria-label="Período del reporte">
                        {ranges.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                    <button type="button" className="button-secondary" onClick={() => void loadReport()} disabled={loading}>
                        Actualizar
                    </button>
                    <button type="button" onClick={exportCsv} disabled={!report}>Exportar CSV</button>
                </div>
            </header>
            {error && <p className="error-message" role="alert">{error}</p>}
            {loading ? <p role="status">Cargando reporte...</p> : report && (
                <>
                    <p className="muted">Período informado por el backend: {report.periodo}</p>
                    <div className="metric-grid">
                        {metrics.map(([label, value]) => (
                            <article className="metric-card" key={label}>
                                <span>{label}</span>
                                <strong>{value}</strong>
                            </article>
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
