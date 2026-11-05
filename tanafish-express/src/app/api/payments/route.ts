import { NextResponse } from "next/server";

/**
 * Mock payment gateway for Telebirr, CBE Birr and Chapa.
 *
 * POST { provider, amount, orderId, phone? } → { status, transactionRef }
 *
 * To go live, branch on PAYMENTS_MODE=live and call:
 *  - Chapa:    POST https://api.chapa.co/v1/transaction/initialize  (Bearer CHAPA_SECRET_KEY)
 *  - Telebirr: H5/in-app "Super App" payment — sign the request with your app key, redirect to the toPayUrl
 *  - CBE Birr: merchant-initiated push to the customer's CBE Birr wallet
 * then confirm via the provider's webhook and flip orders.status to PAID + insert a `payments` row.
 */
const PROVIDERS = ["TELEBIRR", "CBE_BIRR", "CHAPA"] as const;
type Provider = (typeof PROVIDERS)[number];

export async function POST(req: Request) {
  const { provider, amount, orderId } = (await req.json()) as {
    provider: Provider;
    amount: number;
    orderId: string;
  };

  if (!PROVIDERS.includes(provider) || !(amount > 0) || !orderId) {
    return NextResponse.json({ status: "FAILED", error: "Invalid payment request" }, { status: 400 });
  }

  await new Promise((r) => setTimeout(r, 900)); // simulate USSD / wallet confirmation latency

  const prefix = { TELEBIRR: "TB", CBE_BIRR: "CB", CHAPA: "CH" }[provider];
  return NextResponse.json({
    status: "SUCCESS",
    provider,
    transactionRef: `${prefix}-${Date.now().toString(36).toUpperCase()}`,
  });
}
