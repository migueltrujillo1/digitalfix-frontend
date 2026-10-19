import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useApi } from "../useApi";
import type { WorkOrder } from "../types";

const statuses = ["CREADA", "ASIGNADA", "EN_DESPLAZAMIENTO", "EN_EJECUCIÓN", "CERRADA", "CANCELADA"];

export function WorkOrders() {
    const { request } = useApi();
    const [orders, setOrders] = useState<WorkOrder[]>([]);
    const [description, setDescription] = useState("");
    const [technician, setTechnician] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const fetchOrders = useCallback(() => request<WorkOrder[]>("/api/workorders"), [request]);

    const loadOrders = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setOrders(await fetchOrders());
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "No se pudieron cargar las órdenes");
        } finally {
            setLoading(false);
        }
    }, [fetchOrders]);

    useEffect(() => {
        let active = true;
        fetchOrders()
            .then((data) => { if (active) setOrders(data); })
            .catch((cause: unknown) => {
                if (active) setError(cause instanceof Error ? cause.message : "No se pudieron cargar las órdenes");
            })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [fetchOrders]);

    const createOrder = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        try {
            await request<WorkOrder>("/api/workorders", {
                method: "POST",
                body: JSON.stringify({
                    descripcion: description.trim(),
                    estado: "CREADA",
                    tecnico: technician.trim() || null,
                }),
            });
            setDescription("");
            setTechnician("");
            await loadOrders();
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "No se pudo crear la orden");
        } finally {
            setSaving(false);
        }
    };

    const updateStatus = async (id: number, estado: string) => {
        setError("");
        try {
            await request<WorkOrder>(`/api/workorders/${id}/status`, {
                method: "PUT",
                body: JSON.stringify({ estado }),
            });
            await loadOrders();
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "No se pudo actualizar la orden");
        }
    };

    return (
        <section className="page">
            <header className="page-heading">
                <div>
                    <h2>Órdenes de trabajo</h2>
                    <p>Consulta y administra las órdenes guardadas en el backend.</p>
                </div>
                <button className="button-secondary" type="button" onClick={() => void loadOrders()} disabled={loading}>
                    Actualizar
                </button>
            </header>

            <form className="form-card" onSubmit={createOrder}>
                <h3>Crear orden</h3>
                <div className="form-grid">
                    <label className="field-wide">
                        Descripción
                        <input value={description} onChange={(event) => setDescription(event.target.value)}
                            required maxLength={255} placeholder="Describe el trabajo solicitado" />
                    </label>
                    <label>
                        Técnico (opcional)
                        <input value={technician} onChange={(event) => setTechnician(event.target.value)}
                            maxLength={255} placeholder="Nombre del técnico" />
                    </label>
                </div>
                <button type="submit" disabled={saving}>{saving ? "Guardando..." : "Crear orden"}</button>
            </form>

            {error && <p className="error-message" role="alert">{error}</p>}

            <div className="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Descripción</th>
                            <th>Técnico</th>
                            <th>Fecha de creación</th>
                            <th>Estado</th>
                            <th>Actualizar estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan={6}>Cargando órdenes...</td></tr> :
                            orders.length === 0 ? <tr><td colSpan={6}>No hay órdenes registradas.</td></tr> :
                                orders.map((order) => (
                                    <tr key={order.id}>
                                        <td>WO-{String(order.id).padStart(3, "0")}</td>
                                        <td>{order.descripcion}</td>
                                        <td>{order.tecnico || "Sin asignar"}</td>
                                        <td>{order.fechaCreacion ? new Date(order.fechaCreacion).toLocaleString() : "—"}</td>
                                        <td><span className="status-badge">{order.estado}</span></td>
                                        <td>
                                            <select value={order.estado}
                                                onChange={(event) => void updateStatus(order.id, event.target.value)}
                                                aria-label={`Estado de orden ${order.id}`}>
                                                {statuses.map((value) => <option key={value} value={value}>{value}</option>)}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
