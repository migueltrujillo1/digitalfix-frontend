# DigitalFix — frontend React

Aplicación React + TypeScript + Vite para operar DigitalFix desde un navegador. El frontend se ejecuta localmente y consume las APIs autenticadas del BFF; no se conecta directamente a los puertos de cada microservicio.

## Requisitos

- Node.js LTS y npm.
- Backend DigitalFix iniciado con Docker Compose.
- Aplicación SPA de Microsoft Entra ID configurada con la URI de redirección `http://localhost:5173`.
- Scope delegado de la API que incluya `access_as_user`, concedido a la aplicación SPA.

## Configuración local

1. Copia `.env.example` como `.env`.
2. Completa el ID de aplicación, el ID de tenant y el scope delegado de Microsoft Entra ID. No agregues secretos de cliente: una aplicación SPA no puede mantenerlos confidenciales.
3. Conserva `VITE_API_URL=http://localhost:8080` para usar el BFF publicado por Docker Compose.

## Inicio

En una terminal, desde la carpeta del backend:

```powershell
docker compose up --build -d
docker compose ps
```

En otra terminal, desde esta carpeta:

```powershell
npm ci
npm run dev
```

Abre `http://localhost:5173` e inicia sesión con la cuenta autorizada en Microsoft Entra ID. Mantén el frontend en ese origen para que coincidan la URI de redirección y el origen CORS del BFF. Para detener la interfaz, usa `Ctrl+C`; para detener el backend, ejecuta `docker compose down` desde su carpeta.

## Funcionalidades conectadas

- Órdenes: consulta, creación y actualización de estado.
- Catálogo: consulta, creación y edición de servicios y repuestos.
- Panel y reportes: KPIs de 24 horas, 7 días o 30 días; descarga CSV.
- Auditoría: eventos procesados desde RabbitMQ, persistidos en PostgreSQL y consultados mediante el BFF.
- Administración RabbitMQ: creación y eliminación de colas, exchanges y bindings de prueba a través del BFF autenticado. Solo se permiten recursos con el prefijo `digitalfix.test.`; las eliminaciones son permanentes.

La API responde a través de `http://localhost:8080`. Las pantallas muestran errores de autenticación, configuración o conectividad cuando una solicitud falla.
