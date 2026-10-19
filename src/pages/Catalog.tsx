import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useApi } from "../useApi";
import type { CatalogItem } from "../types";

export function Catalog() {
    const { request } = useApi();
    const [items, setItems] = useState<CatalogItem[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("SERVICIO");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("0");
    const [active, setActive] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const fetchItems = useCallback(() => request<CatalogItem[]>("/api/catalog/services"), [request]);

    const loadItems = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setItems(await fetchItems());
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "No se pudo cargar el catálogo");
        } finally {
            setLoading(false);
        }
    }, [fetchItems]);

    useEffect(() => {
        let active = true;
        fetchItems()
            .then((data) => { if (active) setItems(data); })
            .catch((cause: unknown) => {
                if (active) setError(cause instanceof Error ? cause.message : "No se pudo cargar el catálogo");
            })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [fetchItems]);

    const resetForm = () => {
        setEditingId(null);
        setName("");
        setDescription("");
        setType("SERVICIO");
        setPrice("");
        setStock("0");
        setActive(true);
    };

    const startEditing = (item: CatalogItem) => {
        setEditingId(item.id);
        setName(item.nombre);
        setDescription(item.descripcion || "");
        setType(item.tipo);
        setPrice(String(item.precio));
        setStock(String(item.stock));
        setActive(item.activo);
    };

    const saveItem = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        const payload = {
            nombre: name.trim(),
            descripcion: description.trim() || null,
            tipo: type,
            precio: Number(price),
            stock: Number(stock),
            activo: active,
        };
        try {
            await request<CatalogItem>(
                editingId === null ? "/api/catalog/services" : `/api/catalog/services/${editingId}`,
                { method: editingId === null ? "POST" : "PUT", body: JSON.stringify(payload) },
            );
            resetForm();
            await loadItems();
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "No se pudo guardar el ítem");
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="page">
            <header className="page-heading">
                <div>
                    <h2>Catálogo</h2>
                    <p>Servicios y repuestos persistidos en el backend.</p>
                </div>
                <button className="button-secondary" type="button" onClick={() => void loadItems()} disabled={loading}>
                    Actualizar
                </button>
            </header>

            <form className="form-card" onSubmit={saveItem}>
                <h3>{editingId === null ? "Nuevo ítem" : `Editar ítem #${editingId}`}</h3>
                <div className="form-grid">
                    <label>Nombre
                        <input value={name} onChange={(event) => setName(event.target.value)} required maxLength={255} />
                    </label>
                    <label>Tipo
                        <select value={type} onChange={(event) => setType(event.target.value)}>
                            <option value="SERVICIO">Servicio</option>
                            <option value="REPUESTO">Repuesto</option>
                        </select>
                    </label>
                    <label className="field-wide">Descripción
                        <input value={description} onChange={(event) => setDescription(event.target.value)} maxLength={255} />
                    </label>
                    <label>Precio
                        <input type="number" min="0" step="0.01" value={price}
                            onChange={(event) => setPrice(event.target.value)} required />
                    </label>
                    <label>Stock
                        <input type="number" min="0" step="1" value={stock}
                            onChange={(event) => setStock(event.target.value)} required />
                    </label>
                    <label className="checkbox-field">
                        <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
                        Activo
                    </label>
                </div>
                <div className="form-actions">
                    <button type="submit" disabled={saving}>{saving ? "Guardando..." : editingId === null ? "Crear ítem" : "Guardar cambios"}</button>
                    {editingId !== null && <button type="button" className="button-secondary" onClick={resetForm}>Cancelar</button>}
                </div>
            </form>

            {error && <p className="error-message" role="alert">{error}</p>}

            <div className="table-wrap">
                <table>
                    <thead>
                        <tr><th>Tipo</th><th>Nombre</th><th>Precio</th><th>Stock</th><th>Estado</th><th>Acciones</th></tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan={6}>Cargando catálogo...</td></tr> :
                            items.length === 0 ? <tr><td colSpan={6}>No hay ítems registrados.</td></tr> :
                                items.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.tipo === "SERVICE" ? "Servicio" : item.tipo === "SPARE_PART" ? "Repuesto" : item.tipo}</td>
                                        <td>{item.nombre}</td>
                                        <td>{Number(item.precio).toLocaleString("es-CL", { style: "currency", currency: "CLP" })}</td>
                                        <td>{item.stock}</td>
                                        <td><span className="status-badge">{item.activo ? "Activo" : "Inactivo"}</span></td>
                                        <td><button type="button" className="button-secondary" onClick={() => startEditing(item)}>Editar</button></td>
                                    </tr>
                                ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
