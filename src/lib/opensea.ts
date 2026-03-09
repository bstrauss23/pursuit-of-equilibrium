const OPENSEA_BASE_URL = "https://api.opensea.io/api/v2";
const OPENSEA_CHAIN = "ethereum";
const OPENSEA_PENDULUMS_CONTRACT = "0x4af0370076a44c8ddc23db9ae5cecba669280372";
const OPENSEA_SEEKERS_CONTRACT = "0x44d504fb4b2aca2c17a9bc5e56dd002f6032333f";
const OPENSEA_SEEKERS_COLLECTION_SLUG = "pursuit-of-equilibrium-the-seeker-s-collection";

const TOKEN_CACHE_TTL_MS = 60_000;
const COLLECTION_LISTINGS_CACHE_TTL_MS = 60_000;
const SLUG_CACHE_TTL_MS = 10 * 60_000;

export type OpenSeaCollectionKey = "pendulums" | "seekers";

type TokenCacheValue = {
  data: ListingStatus;
  expiresAt: number;
};

type CollectionListingsCacheValue = {
  data: Record<number, ListingStatus>;
  fetchedAt: string;
  expiresAt: number;
};

export type ListingStatus = {
  isListed: boolean;
  rawPrice: string | null;
  displayPrice: string | null;
  currency: string | null;
  ownerAddress: string | null;
  fetchedAt: string;
};

const slugCache: Record<OpenSeaCollectionKey, { slug: string; expiresAt: number }> = {
  pendulums: { slug: "", expiresAt: 0 },
  seekers: { slug: "", expiresAt: 0 },
};

const tokenCache = new Map<string, TokenCacheValue>();
const collectionListingsCache: Record<OpenSeaCollectionKey, CollectionListingsCacheValue> = {
  pendulums: {
    data: {},
    fetchedAt: "",
    expiresAt: 0,
  },
  seekers: {
    data: {},
    fetchedAt: "",
    expiresAt: 0,
  },
};

const collectionConfig: Record<
  OpenSeaCollectionKey,
  { contractAddress: string; explicitSlug: string | null; fallbackSlug: string | null }
> = {
  pendulums: {
    contractAddress: OPENSEA_PENDULUMS_CONTRACT,
    explicitSlug: process.env.OPENSEA_COLLECTION_SLUG?.trim() ?? null,
    fallbackSlug: null,
  },
  seekers: {
    contractAddress: OPENSEA_SEEKERS_CONTRACT,
    explicitSlug: process.env.OPENSEA_SEEKERS_COLLECTION_SLUG?.trim() ?? null,
    fallbackSlug: OPENSEA_SEEKERS_COLLECTION_SLUG,
  },
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function readString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function readBigInt(value: string | null) {
  if (!value || !/^\d+$/.test(value)) return null;
  try {
    return BigInt(value);
  } catch {
    return null;
  }
}

function trimHexAddress(value: unknown) {
  const asString = readString(value)?.toLowerCase();
  return asString && asString.startsWith("0x") ? asString : null;
}

function formatBaseUnits(rawAmount: string, decimals: number) {
  if (!/^\d+$/.test(rawAmount)) return null;
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 36) return null;

  const amount = BigInt(rawAmount);
  const scale = BigInt(10) ** BigInt(decimals);
  const whole = amount / scale;
  const fraction = amount % scale;
  if (fraction === 0n) return whole.toString();

  const fractionText = fraction.toString().padStart(decimals, "0").slice(0, 4).replace(/0+$/, "");
  return fractionText ? `${whole.toString()}.${fractionText}` : whole.toString();
}

function withCurrency(value: string | null, currency: string | null) {
  if (!value) return null;
  return currency ? `${value} ${currency}` : value;
}

function defaultNotListed(): ListingStatus {
  return {
    isListed: false,
    rawPrice: null,
    displayPrice: null,
    currency: null,
    ownerAddress: null,
    fetchedAt: new Date().toISOString(),
  };
}

function getApiKey() {
  const key = process.env.OPENSEA_API_KEY?.trim();
  if (!key) {
    throw new Error("OpenSea API key missing. Set OPENSEA_API_KEY in .env.local.");
  }
  return key;
}

async function openSeaFetch(path: string) {
  const key = getApiKey();
  const response = await fetch(`${OPENSEA_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
      "X-API-KEY": key,
    },
    cache: "no-store",
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`OpenSea request failed: ${response.status}`);
  }

  return response.json();
}

async function resolveCollectionSlug(collection: OpenSeaCollectionKey = "pendulums") {
  const config = collectionConfig[collection];
  if (config.explicitSlug) return config.explicitSlug;
  if (config.fallbackSlug) return config.fallbackSlug;

  const cached = slugCache[collection];
  if (cached.slug && Date.now() < cached.expiresAt) {
    return cached.slug;
  }

  const payload = await openSeaFetch(`/chain/${OPENSEA_CHAIN}/contract/${config.contractAddress}`);
  const obj = asRecord(payload);
  const collectionObj = asRecord(obj?.collection);
  const slug =
    readString(collectionObj?.slug) ??
    readString(obj?.collection_slug) ??
    readString(obj?.slug) ??
    "";

  if (!slug) {
    throw new Error("Could not resolve collection slug. Set OPENSEA_COLLECTION_SLUG in .env.local.");
  }

  cached.slug = slug;
  cached.expiresAt = Date.now() + SLUG_CACHE_TTL_MS;
  return slug;
}

function extractListingObject(payload: unknown) {
  const obj = asRecord(payload);
  if (!obj) return null;

  const listings = Array.isArray(obj.listings) ? obj.listings : null;
  if (listings && listings.length > 0) {
    return asRecord(listings[0]);
  }

  const listing = asRecord(obj.listing);
  if (listing) return listing;

  if (readString(obj.order_hash) || obj.price || obj.protocol_data) {
    return obj;
  }

  return null;
}

function parseListingPrice(listing: Record<string, unknown>) {
  const legacyPrice = readString(listing.current_price);
  const paymentTokenContract = asRecord(listing.payment_token_contract);
  const legacyCurrency = readString(paymentTokenContract?.symbol);
  const legacyDecimals = readNumber(paymentTokenContract?.decimals);
  if (legacyPrice) {
    const decimals = Number.isInteger(legacyDecimals) ? Number(legacyDecimals) : 18;
    return {
      rawPrice: legacyPrice,
      currency: legacyCurrency ?? "ETH",
      displayPrice: withCurrency(formatBaseUnits(legacyPrice, decimals), legacyCurrency ?? "ETH"),
    };
  }

  const price = asRecord(listing.price);
  const current = asRecord(price?.current);
  const currentValue = readString(current?.value) ?? readString(price?.current_price);
  const currentCurrency = readString(current?.currency) ?? readString(price?.currency);
  const currentDecimals = readNumber(current?.decimals) ?? readNumber(price?.decimals);

  if (currentValue) {
    const decimals = Number.isInteger(currentDecimals) ? Number(currentDecimals) : 18;
    const currency = currentCurrency ?? "ETH";
    return {
      rawPrice: currentValue,
      currency,
      displayPrice: withCurrency(formatBaseUnits(currentValue, decimals), currency),
    };
  }

  const protocolData = asRecord(listing.protocol_data);
  const parameters = asRecord(protocolData?.parameters);
  const consideration = Array.isArray(parameters?.consideration) ? parameters.consideration : [];
  const firstConsideration = asRecord(consideration[0]);
  const startAmount = readString(firstConsideration?.startAmount);
  const tokenAddress = trimHexAddress(firstConsideration?.token);
  const currency =
    tokenAddress === "0x0000000000000000000000000000000000000000"
      ? "ETH"
      : tokenAddress === "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
        ? "WETH"
        : null;

  if (startAmount) {
    return {
      rawPrice: startAmount,
      currency,
      displayPrice: withCurrency(formatBaseUnits(startAmount, 18), currency),
    };
  }

  return {
    rawPrice: null,
    currency: null,
    displayPrice: null,
  };
}

function extractTokenIdFromListing(listing: Record<string, unknown>) {
  const nft = asRecord(listing.nft);
  const nftIdentifier = readString(nft?.identifier) ?? readString(nft?.token_id);
  if (nftIdentifier && /^\d+$/.test(nftIdentifier)) {
    return Number(nftIdentifier);
  }

  const protocolData = asRecord(listing.protocol_data);
  const parameters = asRecord(protocolData?.parameters);
  const offer = Array.isArray(parameters?.offer) ? parameters.offer : [];
  const firstOffer = asRecord(offer[0]);
  const identifier =
    readString(firstOffer?.identifierOrCriteria) ??
    readString(firstOffer?.identifier) ??
    readString(firstOffer?.token_id);
  if (identifier && /^\d+$/.test(identifier)) {
    return Number(identifier);
  }

  return null;
}

function extractOwnerAddressFromListing(listing: Record<string, unknown>) {
  const maker = asRecord(listing.maker);
  const fromAccount = asRecord(listing.from_account);
  const protocolData = asRecord(listing.protocol_data);
  const parameters = asRecord(protocolData?.parameters);

  return (
    trimHexAddress(maker?.address) ??
    trimHexAddress(listing.maker) ??
    trimHexAddress(fromAccount?.address) ??
    trimHexAddress(parameters?.offerer) ??
    null
  );
}

export function getContractAddress(collection: OpenSeaCollectionKey = "pendulums") {
  return collectionConfig[collection].contractAddress;
}

export async function getCollectionActiveListings(collection: OpenSeaCollectionKey = "pendulums"): Promise<{
  fetchedAt: string;
  listingsByTokenId: Record<number, ListingStatus>;
}> {
  const cache = collectionListingsCache[collection];
  const now = Date.now();
  if (cache.expiresAt > now) {
    return {
      fetchedAt: cache.fetchedAt,
      listingsByTokenId: cache.data,
    };
  }

  const slug = await resolveCollectionSlug(collection);
  const payload = await openSeaFetch(`/listings/collection/${slug}/all?limit=200`);
  const root = asRecord(payload) ?? {};
  const listingsRaw = Array.isArray(root.listings) ? root.listings : [];
  const fetchedAt = new Date().toISOString();
  const listingsByTokenId: Record<number, ListingStatus> = {};

  for (const rawListing of listingsRaw) {
    const listing = asRecord(rawListing);
    if (!listing) continue;

    const tokenId = extractTokenIdFromListing(listing);
    if (!tokenId || tokenId <= 0 || !Number.isInteger(tokenId)) continue;

    const parsedPrice = parseListingPrice(listing);
    if (!parsedPrice.rawPrice) continue;

    const candidate: ListingStatus = {
      isListed: true,
      rawPrice: parsedPrice.rawPrice,
      displayPrice: parsedPrice.displayPrice,
      currency: parsedPrice.currency,
      ownerAddress: extractOwnerAddressFromListing(listing),
      fetchedAt,
    };

    const existing = listingsByTokenId[tokenId];
    if (!existing) {
      listingsByTokenId[tokenId] = candidate;
      continue;
    }

    if (existing.currency !== candidate.currency) continue;
    const existingRaw = readBigInt(existing.rawPrice);
    const candidateRaw = readBigInt(candidate.rawPrice);
    if (existingRaw !== null && candidateRaw !== null && candidateRaw < existingRaw) {
      listingsByTokenId[tokenId] = candidate;
    }
  }

  cache.data = listingsByTokenId;
  cache.fetchedAt = fetchedAt;
  cache.expiresAt = now + COLLECTION_LISTINGS_CACHE_TTL_MS;

  return { fetchedAt, listingsByTokenId };
}

export async function getBestListingStatus(
  tokenId: number,
  collection: OpenSeaCollectionKey = "pendulums"
): Promise<ListingStatus> {
  const now = Date.now();
  const tokenCacheKey = `${collection}:${tokenId}`;
  const cached = tokenCache.get(tokenCacheKey);
  if (cached && now < cached.expiresAt) {
    return cached.data;
  }

  const fallback = defaultNotListed();
  const slug = await resolveCollectionSlug(collection);
  const payload = await openSeaFetch(`/listings/collection/${slug}/nfts/${tokenId}/best`);
  if (!payload) {
    tokenCache.set(tokenCacheKey, { data: fallback, expiresAt: now + TOKEN_CACHE_TTL_MS });
    return fallback;
  }

  const listing = extractListingObject(payload);
  if (!listing) {
    tokenCache.set(tokenCacheKey, { data: fallback, expiresAt: now + TOKEN_CACHE_TTL_MS });
    return fallback;
  }

  const parsedPrice = parseListingPrice(listing);
  const result: ListingStatus = {
    isListed: Boolean(parsedPrice.rawPrice),
    rawPrice: parsedPrice.rawPrice,
    displayPrice: parsedPrice.displayPrice,
    currency: parsedPrice.currency,
    ownerAddress: extractOwnerAddressFromListing(listing),
    fetchedAt: new Date().toISOString(),
  };

  tokenCache.set(tokenCacheKey, { data: result, expiresAt: now + TOKEN_CACHE_TTL_MS });
  return result;
}

export async function getOwnedPendulumTokenIds(walletAddress: string): Promise<{
  fetchedAt: string;
  tokenIds: number[];
}> {
  const normalizedWallet = trimHexAddress(walletAddress);
  if (!normalizedWallet || !/^0x[a-f0-9]{40}$/.test(normalizedWallet)) {
    throw new Error("Invalid wallet address.");
  }

  const slug = await resolveCollectionSlug("pendulums");
  const tokenIds = new Set<number>();
  let nextCursor: string | null = null;

  for (let page = 0; page < 20; page += 1) {
    const params = new URLSearchParams({
      limit: "200",
      collection: slug,
    });
    if (nextCursor) {
      params.set("next", nextCursor);
    }

    const payload = await openSeaFetch(`/chain/${OPENSEA_CHAIN}/account/${normalizedWallet}/nfts?${params.toString()}`);
    const root = asRecord(payload) ?? {};
    const nfts = Array.isArray(root.nfts) ? root.nfts : [];

    for (const rawNft of nfts) {
      const nft = asRecord(rawNft);
      if (!nft) continue;

      const identifier = readString(nft.identifier) ?? readString(nft.token_id);
      if (!identifier || !/^\d+$/.test(identifier)) continue;

      const tokenId = Number(identifier);
      if (Number.isInteger(tokenId) && tokenId > 0) {
        tokenIds.add(tokenId);
      }
    }

    const next = readString(root.next) ?? readString(root.next_cursor);
    if (!next || next === nextCursor) {
      break;
    }
    nextCursor = next;
  }

  return {
    fetchedAt: new Date().toISOString(),
    tokenIds: Array.from(tokenIds).sort((a, b) => a - b),
  };
}

export async function mapWithConcurrency<T, R>(
  items: T[],
  maxConcurrency: number,
  mapper: (item: T) => Promise<R>
) {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const current = nextIndex;
      nextIndex += 1;
      if (current >= items.length) return;
      results[current] = await mapper(items[current]);
    }
  }

  const workers = Array.from({ length: Math.max(1, Math.min(maxConcurrency, items.length)) }, () => worker());
  await Promise.all(workers);
  return results;
}
