import { BrowserAuthorizationClient } from "@itwin/browser-authorization";

export async function getBentleyAuthClient(clientId: string, imsPrefix: string, scope: string = "itwin-platform"): Promise<BrowserAuthorizationClient> {
    const redirectUri = window.location.origin;

    if (imsPrefix == "dev-") {
        imsPrefix = "qa-";
    }

    const authClient = new BrowserAuthorizationClient({
        authority: `https://${imsPrefix}ims.bentley.com`,
        clientId: clientId,
        scope,
        redirectUri,
        responseType: "code"
    });

    authClient.signInRedirect();
    await authClient.handleSigninCallback();

    return authClient;
}
