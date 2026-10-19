export interface WorkOrder {
    id: number;
    descripcion: string;
    estado: string;
    tecnico: string | null;
    fechaCreacion: string;
}

export interface CatalogItem {
    id: number;
    nombre: string;
    descripcion: string | null;
    tipo: "SERVICIO" | "REPUESTO" | string;
    precio: number;
    stock: number;
    activo: boolean;
}

export interface KpiResponse {
    periodo: string;
    totalOrdenes: number;
    creadas: number;
    asignadas: number;
    enDesplazamiento: number;
    enEjecucion: number;
    cerradas: number;
    canceladas: number;
}

export interface AuditEvent {
    id: number;
    orderId: number;
    payload: string;
    createdAt: string;
}
