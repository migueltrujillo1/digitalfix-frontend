import { NavLink } from "react-router-dom";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";

const links = [
    { to: "/dashboard", label: "Resumen" },
    { to: "/workorders", label: "Órdenes" },
    { to: "/catalog", label: "Catálogo" },
    { to: "/reports", label: "Reportes" },
    { to: "/audit", label: "Auditoría" },
];

export function NavBar() {
    const { instance } = useMsal();
    const isAuthenticated = useIsAuthenticated();

    if (!isAuthenticated) return null;

    return (
        <nav className="app-nav" aria-label="Navegación principal">
            <NavLink className="brand" to="/dashboard">DigitalFix</NavLink>
            <div className="nav-links">
                {links.map((link) => (
                    <NavLink key={link.to} to={link.to} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        {link.label}
                    </NavLink>
                ))}
            </div>
            <button type="button" className="button-secondary"
                onClick={() => void instance.logoutRedirect({ postLogoutRedirectUri: window.location.origin })}>
                Cerrar sesión
            </button>
        </nav>
    );
}
