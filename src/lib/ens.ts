import { createPublicClient, getAddress, http, isAddress } from "viem";
import { normalize } from "viem/ens";
import { mainnet } from "viem/chains";

type EnsCacheEntry = {
  address: string | null;
  expiresAt: number;
};

const ENS_CACHE_TTL_MS = 5 * 60_000;
const ensCache = new Map<string, EnsCacheEntry>();

function getRpcUrls() {
  const urls = [
    process.env.PUBLIC_MAINNET_RPC_URL?.trim(),
    "https://ethereum-rpc.publicnode.com",
    "https://ethereum.publicnode.com",
    "https://eth-mainnet.public.blastapi.io",
  ].filter((value): value is string => Boolean(value));

  return Array.from(new Set(urls));
}

async function resolveEnsName(name: string) {
  const normalizedName = normalize(name.toLowerCase());
  const cached = ensCache.get(normalizedName);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return cached.address;
  }

  for (const rpcUrl of getRpcUrls()) {
    try {
      const client = createPublicClient({
        chain: mainnet,
        transport: http(rpcUrl, { timeout: 8_000 }),
      });

      const address = await client.getEnsAddress({ name: normalizedName });
      const checksummed = address ? getAddress(address) : null;
      ensCache.set(normalizedName, {
        address: checksummed,
        expiresAt: now + ENS_CACHE_TTL_MS,
      });
      return checksummed;
    } catch {
      continue;
    }
  }

  throw new Error("Failed to resolve ENS with public RPC providers.");
}

export async function resolveWalletOrEnsInput(input: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Wallet input is required.");
  }

  if (isAddress(trimmed)) {
    return {
      input: trimmed,
      inputType: "address" as const,
      resolvedAddress: getAddress(trimmed),
      ensName: null,
    };
  }

  if (trimmed.toLowerCase().endsWith(".eth")) {
    const resolvedAddress = await resolveEnsName(trimmed);
    if (!resolvedAddress) {
      throw new Error("Could not resolve ENS name.");
    }

    return {
      input: trimmed,
      inputType: "ens" as const,
      resolvedAddress,
      ensName: trimmed.toLowerCase(),
    };
  }

  throw new Error("Enter a valid wallet address or ENS name.");
}
