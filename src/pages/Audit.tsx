import { useCallback, useEffect, useMemo, useState } from "react";
import { useApi } from "../useApi";
import type { AuditEvent } from "../types";

export function Audit() {
    const { request } = useApi();
    const [events, setEvents] = useState<AuditEvent[]>([]);
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchEvents = useCallback(
        () => request<AuditEvent[]>("/api/audit?limit=100"),
        [request],
    );

    const loadEvents = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setEvents(await fetchEvents());
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "No se pudo cargar la auditoría");
        } finally {
            setLoading(false);
        }
    }, [fetchEvents]);

    useEffect(() => {
        let active = true;
        fetchEvents()
            .then((data) => { if (active) setEvents(data); })
            .catch((cause: unknown) => {
                if (active) setError(cause instanceof Error ? cause.message : "No se pudo cargar la auditoría");
            })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [fetchEvents]);

    const filteredEvents = useMemo(() => {
        const query = filter.trim().toLowerCase();
        if (!query) return events;
        return events.filter((event) =>
            String(event.orderId).includes(query) || event.payload.toLowerCase().includes(query));
    }, [events, filter]);

    return (
        <section className="page">
            <header className="page-heading">
                <div>
                    <h2>Auditoría</h2>
                    <p>Eventos de auditoría procesados desde RabbitMQ y persistidos en PostgreSQL.</p>
                </div>
                <button className="button-secondary" type="button" onClick={() => void loadEvents()} disabled={loading}>
                    Actualizar
                </button>
            </header>
            <label className="filter-field">Filtrar por orden o evento
                <input value={filter} onChange={(event) => setFilter(event.target.value)}
                    placeholder="ID de orden o texto del evento" />
            </label>
            {error && <p className="error-message" role="alert">{error}</p>}
            <div className="table-wrap">
                <table>
                    <thead><tr><th>Evento</th><th>Orden</th><th>Fecha</th></tr></thead>
                    <tbody>
                        {loading ? <tr><td colSpan={3}>Cargando eventos...</td></tr> :
                            filteredEvents.length === 0 ? <tr><td colSpan={3}>No hay eventos de auditoría para mostrar.</td></tr> :
                                filteredEvents.map((event) => (
                                    <tr key={event.id}>
                                        <td>{event.payload}</td>
                                        <td>WO-{String(event.orderId).padStart(3, "0")}</td>
                                        <td>{new Date(event.createdAt).toLocaleString()}</td>
                                    </tr>
                                ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
