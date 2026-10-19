import { useCallback } from "react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./authConfig";

export class ApiError extends Error {
    readonly status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

export function useApi() {
    const { instance, accounts } = useMsal();

    const fetchWithToken = useCallback(async (url: string, options: RequestInit = {}) => {
        const account = instance.getActiveAccount() || accounts[0];
        if (!account) throw new Error("No hay una cuenta activa");

        let accessToken: string;
        try {
            const result = await instance.acquireTokenSilent({ ...loginRequest, account });
            accessToken = result.accessToken;
        } catch (error) {
            if (error instanceof InteractionRequiredAuthError) {
                await instance.acquireTokenRedirect(loginRequest);
                throw new Error("Se requiere iniciar sesión nuevamente", { cause: error });
            }
            throw new Error("No se pudo obtener un token para la API", { cause: error });
        }

        const headers = new Headers(options.headers);
        headers.set("Authorization", `Bearer ${accessToken}`);
        if (options.body && !headers.has("Content-Type")) {
            headers.set("Content-Type", "application/json");
        }

        try {
            return await fetch(url, { ...options, headers });
        } catch (error) {
            throw new Error("No se pudo conectar con el backend", { cause: error });
        }
    }, [accounts, instance]);

    const request = useCallback(async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
        const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");
        if (!apiUrl) throw new Error("Falta configurar VITE_API_URL en el archivo .env");

        const response = await fetchWithToken(`${apiUrl}${path}`, options);
        const body = await response.text();
        if (!response.ok) {
            let message = body || `La API respondió HTTP ${response.status}`;
            try {
                const parsed = JSON.parse(body) as { message?: string; error?: string };
                message = parsed.message || parsed.error || message;
            } catch {
                // Las respuestas de error pueden no ser JSON.
            }
            throw new ApiError(message, response.status);
        }
        if (response.status === 204 || !body) return undefined as T;

        try {
            return JSON.parse(body) as T;
        } catch (error) {
            throw new Error("El backend devolvió una respuesta JSON inválida", { cause: error });
        }
    }, [fetchWithToken]);

    return { request, fetchWithToken };
}
