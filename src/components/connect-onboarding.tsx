"use client";

import { loadConnectAndInitialize } from "@stripe/connect-js";
import { ConnectAccountManagement, ConnectAccountOnboarding, ConnectComponentsProvider, ConnectNotificationBanner, ConnectPayouts } from "@stripe/react-connect-js";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ConnectOnboarding({ publishableKey, showOnboarding }: { publishableKey: string; showOnboarding: boolean }) {
  const router = useRouter();
  const [connectInstance] = useState(() =>
    loadConnectAndInitialize({
      publishableKey,
      fetchClientSecret: async () => {
        const response = await fetch("/api/stripe/connect-session", { method: "POST" });
        const payload = (await response.json()) as { clientSecret?: string; error?: string };
        if (!response.ok || !payload.clientSecret) throw new Error(payload.error || "Payout setup could not be opened.");
        return payload.clientSecret;
      },
      appearance: { overlays: "dialog", variables: { colorPrimary: "#09090b" } },
    }),
  );

  return (
    <ConnectComponentsProvider connectInstance={connectInstance}>
      <div className="mt-4 space-y-4">
        <ConnectNotificationBanner />
        {showOnboarding ? <ConnectAccountOnboarding onExit={() => router.refresh()} /> : null}
        <ConnectAccountManagement />
        <ConnectPayouts />
      </div>
    </ConnectComponentsProvider>
  );
}
