import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { WorkOrders } from "./pages/WorkOrders";
import { Catalog } from "./pages/Catalog";
import { Reports } from "./pages/Reports";
import { Audit } from "./pages/Audit";

export default function App() {
    return (
        <BrowserRouter>
            <NavBar />
            <main className="app-content">
                <Routes>
                    {/* Ruta Pública */}
                    <Route path="/login" element={<Login />} />

                    {/* Rutas Protegidas */}
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/workorders" element={<ProtectedRoute><WorkOrders /></ProtectedRoute>} />
                    <Route path="/catalog" element={<ProtectedRoute><Catalog /></ProtectedRoute>} />
                    <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                    <Route path="/audit" element={<ProtectedRoute><Audit /></ProtectedRoute>} /> 

                    {/* Redirección por defecto */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </main>
        </BrowserRouter>
    );
}