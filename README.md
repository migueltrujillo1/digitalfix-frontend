# 🔧 DigitalFix - Frontend

Frontend de **DigitalFix**, una plataforma para la gestión de órdenes de trabajo y servicios técnicos.

La aplicación permite autenticarse mediante **Microsoft Entra ID**, administrar órdenes de trabajo, consultar el catálogo de servicios y visualizar indicadores (KPIs).

## 🚀 Tecnologías

- ⚛️ React + TypeScript
- ⚡ Vite
- 🔐 Microsoft Entra ID + MSAL
- ☁️ AWS API Gateway
- 🔑 Autenticación mediante JWT

## ✨ Funcionalidades

- Inicio y cierre de sesión con Microsoft.
- Obtención y envío automático del Access Token.
- Gestión de órdenes de trabajo.
- Gestión del catálogo de servicios y repuestos.
- Consulta de KPIs.
- Consumo del backend mediante AWS API Gateway.
- Protección de recursos mediante JWT.

## 🏗️ Arquitectura

```text
React
  │
  ├── Microsoft Entra ID
  │       └── Autenticación / JWT
  │
  ▼
AWS API Gateway
  │
  ▼
DigitalFix BFF
  │
  ├── WorkOrders
  ├── Catalog
  └── Report
```

## ▶️ Ejecutar el proyecto

Clonar el repositorio e instalar las dependencias:

```bash
npm install
```

Crear el archivo `.env` con la configuración correspondiente y luego ejecutar:

```bash
npm run dev
```

La aplicación estará disponible en:

```text
http://localhost:5173
```


Desarrollado como parte de la evaluación de **Desarrollo Cloud Native**.