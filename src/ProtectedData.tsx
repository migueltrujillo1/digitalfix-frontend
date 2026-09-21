import { useEffect, useState } from "react";
import { useApi } from "./useApi";

type WorkOrder = { id: number; descripcion: string; estado: string; tecnico?: string; fechaCreacion?: string };
type CatalogItem = { id: number; nombre: string; descripcion?: string; tipo: string; precio: number; stock: number; activo: boolean };
type Kpis = Record<string, string | number>;
type JwtClaims = { scp?: string; roles?: string[]; aud?: string; iss?: string };

const statuses = ["CREADA", "ASIGNADA", "EN_DESPLAZAMIENTO", "EN_EJECUCIÓN", "CERRADA", "CANCELADA"];

const statusLabels: Record<string, string> = {
  CREADA: "Creada",
  ASIGNADA: "Asignada",
  EN_DESPLAZAMIENTO: "En desplazamiento",
  EN_EJECUCIÓN: "En ejecución",
  CERRADA: "Cerrada",
  CANCELADA: "Cancelada",
};

const kpiLabels: Record<string, string> = {
  periodo: "Período",
  totalOrdenes: "Total de órdenes",
  creadas: "Creadas",
  asignadas: "Asignadas",
  enDesplazamiento: "En desplazamiento",
  enEjecucion: "En ejecución",
  cerradas: "Cerradas",
  canceladas: "Canceladas",
};

const kpiValueLabels: Record<string, string> = {
  ULTIMAS_24_HORAS: "Últimas 24 horas",
  ULTIMOS_7_DIAS: "Últimos 7 días",
  ULTIMOS_30_DIAS: "Últimos 30 días",
};

function decodeClaims(token: string): JwtClaims {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(atob(payload).split("").map(c => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`).join("")));
  } catch { return {}; }
}

export function ProtectedData() {
  const { fetchWithToken, getAccessToken } = useApi();
  const [tab, setTab] = useState<"orders" | "catalog" | "report">("orders");
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [claims, setClaims] = useState<JwtClaims>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderForm, setOrderForm] = useState({ descripcion: "", tecnico: "" });
  const [catalogForm, setCatalogForm] = useState({ nombre: "", descripcion: "", tipo: "SERVICIO", precio: "", stock: "0" });

  const request = async (path: string, options?: RequestInit) => {
    const res = await fetchWithToken(path, options);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`);
    }
    if (res.status === 204) return null;
    return res.json();
  };

  const loadOrders = async () => setOrders(await request("/api/workorders"));
  const loadCatalog = async () => setCatalog(await request("/api/catalog/services"));
  const loadKpis = async () => setKpis(await request("/api/report/kpis?periodo=ultimas24h"));

  const run = async (fn: () => Promise<void>, success?: string) => {
    setLoading(true); setMessage("");
    try { await fn(); if (success) setMessage(success); }
    catch (e) { setMessage(e instanceof Error ? e.message : "Error inesperado"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    getAccessToken().then(t => setClaims(decodeClaims(t))).catch(() => undefined);
    run(loadOrders);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeTab = (next: typeof tab) => {
    setTab(next); setMessage("");
    if (next === "orders") run(loadOrders);
    if (next === "catalog") run(loadCatalog);
    if (next === "report") run(loadKpis);
  };

  const createOrder = () => run(async () => {
    await request("/api/workorders", { method: "POST", body: JSON.stringify({ ...orderForm, estado: "CREADA" }) });
    setOrderForm({ descripcion: "", tecnico: "" });
    await loadOrders();
  }, "Orden creada correctamente");

  const updateStatus = (id: number, status: string) => run(async () => {
    await request(`/api/workorders/${id}/status`, { method: "PUT", body: JSON.stringify({ estado: status }) });
    await loadOrders();
  }, "Estado actualizado");

  const createCatalogItem = () => run(async () => {
    await request("/api/catalog/services", { method: "POST", body: JSON.stringify({
      ...catalogForm, precio: Number(catalogForm.precio), stock: Number(catalogForm.stock), activo: true
    }) });
    setCatalogForm({ nombre: "", descripcion: "", tipo: "SERVICIO", precio: "", stock: "0" });
    await loadCatalog();
  }, "Elemento agregado al catálogo");

  return (
    <section className="panel">
      <div className="security-card">
        <strong>Sesión protegida con Microsoft Entra ID</strong>
        <span>Ámbito de acceso: {claims.scp || "sin ámbito"}</span>
        {claims.roles?.length ? <span>Roles: {claims.roles.join(", ")}</span> : null}
      </div>

      <nav className="tabs">
        <button className={tab === "orders" ? "active" : ""} onClick={() => changeTab("orders")}>Órdenes</button>
        <button className={tab === "catalog" ? "active" : ""} onClick={() => changeTab("catalog")}>Catálogo</button>
        <button className={tab === "report" ? "active" : ""} onClick={() => changeTab("report")}>KPIs</button>
      </nav>
      {message && <div className="message">{message}</div>}

      {tab === "orders" && <>
        <h2>Órdenes de trabajo</h2>
        <div className="form-row">
          <input placeholder="Descripción" value={orderForm.descripcion} onChange={e => setOrderForm({ ...orderForm, descripcion: e.target.value })} />
          <input placeholder="Técnico" value={orderForm.tecnico} onChange={e => setOrderForm({ ...orderForm, tecnico: e.target.value })} />
          <button disabled={loading || !orderForm.descripcion} onClick={createOrder}>Crear orden</button>
        </div>
        <div className="table-wrap"><table><thead><tr><th>ID</th><th>Descripción</th><th>Técnico</th><th>Estado</th><th>Actualizar</th></tr></thead><tbody>
          {orders.map(o => <tr key={o.id}><td>{o.id}</td><td>{o.descripcion}</td><td>{o.tecnico || "-"}</td><td><span className="badge">{statusLabels[o.estado] || o.estado}</span></td><td><select value={o.estado} onChange={e => updateStatus(o.id, e.target.value)}>{statuses.map(s => <option key={s} value={s}>{statusLabels[s] || s}</option>)}</select></td></tr>)}
        </tbody></table></div>
      </>}

      {tab === "catalog" && <>
        <h2>Catálogo de servicios y repuestos</h2>
        <div className="form-grid">
          <input placeholder="Nombre" value={catalogForm.nombre} onChange={e => setCatalogForm({ ...catalogForm, nombre: e.target.value })} />
          <input placeholder="Descripción" value={catalogForm.descripcion} onChange={e => setCatalogForm({ ...catalogForm, descripcion: e.target.value })} />
          <select value={catalogForm.tipo} onChange={e => setCatalogForm({ ...catalogForm, tipo: e.target.value })}><option value="SERVICIO">Servicio</option><option value="REPUESTO">Repuesto</option></select>
          <input type="number" min="0" step="0.01" placeholder="Precio" value={catalogForm.precio} onChange={e => setCatalogForm({ ...catalogForm, precio: e.target.value })} />
          <input type="number" min="0" placeholder="Stock" value={catalogForm.stock} onChange={e => setCatalogForm({ ...catalogForm, stock: e.target.value })} />
          <button disabled={loading || !catalogForm.nombre || !catalogForm.precio} onClick={createCatalogItem}>Agregar</button>
        </div>
        <div className="table-wrap"><table><thead><tr><th>ID</th><th>Nombre</th><th>Tipo</th><th>Precio</th><th>Stock</th><th>Activo</th></tr></thead><tbody>
          {catalog.map(i => <tr key={i.id}><td>{i.id}</td><td>{i.nombre}</td><td>{i.tipo}</td><td>${Number(i.precio).toLocaleString("es-CL")}</td><td>{i.stock}</td><td>{i.activo ? "Sí" : "No"}</td></tr>)}
        </tbody></table></div>
      </>}

      {tab === "report" && <>
        <div className="section-title"><h2>KPIs - últimas 24 horas</h2><button disabled={loading} onClick={() => run(loadKpis)}>Actualizar</button></div>
        <div className="kpi-grid">{kpis && Object.entries(kpis).map(([key, value]) => <article className="kpi" key={key}><span>{kpiLabels[key] || key}</span><strong>{typeof value === "string" ? (kpiValueLabels[value] || value) : value}</strong></article>)}</div>
      </>}
    </section>
  );
}
