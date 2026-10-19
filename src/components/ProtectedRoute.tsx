import { MsalAuthenticationTemplate } from "@azure/msal-react";
import { InteractionType } from "@azure/msal-browser";
import { loginRequest } from "../authConfig";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    return (
        <MsalAuthenticationTemplate
            interactionType={InteractionType.Redirect}
            authenticationRequest={loginRequest}
        >
            {children}
        </MsalAuthenticationTemplate>
    );
}