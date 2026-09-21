import { useMsal } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { loginRequest } from "./authConfig";

export function useApi() {
  const { instance, accounts } = useMsal();

  const getAccessToken = async () => {
    const account = instance.getActiveAccount() || accounts[0];
    if (!account) throw new Error("No hay una cuenta activa");

    try {
      const response = await instance.acquireTokenSilent({ ...loginRequest, account });
      return response.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        await instance.acquireTokenRedirect(loginRequest);
        throw new Error("Se requiere autenticación interactiva");
      }
      throw error;
    }
  };

  const fetchWithToken = async (path: string, options: RequestInit = {}) => {
    const accessToken = await getAccessToken();
    const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
    if (!baseUrl) throw new Error("VITE_API_URL no está configurada");

    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${accessToken}`);
    if (options.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    return fetch(`${baseUrl}${path}`, { ...options, headers });
  };

  return { fetchWithToken, getAccessToken };
}
