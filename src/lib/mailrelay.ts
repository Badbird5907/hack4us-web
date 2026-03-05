import { createClient } from "@/lib/mailrelay-openapi/client";

declare global {
  var mailRelayClient: ReturnType<typeof createClient>;
}

export const getMailRelayClient = () => {
  if (globalThis.mailRelayClient) {
    return globalThis.mailRelayClient;
  }
  const client = createClient({
    baseUrl: process.env.MAILRELAY_BASE_URL,
    headers: {
      'X-AUTH-TOKEN': process.env.MAILRELAY_API_KEY,
    }
  });
  globalThis.mailRelayClient = client;
  return client;
}