import { NextRequest, NextResponse } from "next/server";
import { getOwnedPendulumTokenIds } from "@/lib/opensea";
import { resolveWalletOrEnsInput } from "@/lib/ens";

export async function GET(request: NextRequest) {
  try {
    const rawInput = String(request.nextUrl.searchParams.get("wallet") ?? "");
    if (!rawInput.trim()) {
      return NextResponse.json({ error: "Enter a wallet address or ENS name." }, { status: 400 });
    }

    const resolved = await resolveWalletOrEnsInput(rawInput);
    const { fetchedAt, tokenIds } = await getOwnedPendulumTokenIds(resolved.resolvedAddress);

    return NextResponse.json({
      input: resolved.input,
      inputType: resolved.inputType,
      ensName: resolved.ensName,
      wallet: resolved.resolvedAddress.toLowerCase(),
      fetchedAt,
      count: tokenIds.length,
      tokenIds,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch wallet pendulums.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
