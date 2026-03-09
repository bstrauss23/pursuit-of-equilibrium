import { NextRequest, NextResponse } from "next/server";
import { getCollectionActiveListings, type OpenSeaCollectionKey } from "@/lib/opensea";

const MAX_TOKEN_IDS = 80;

function parseTokenIds(value: string | null) {
  if (!value) return [];

  const deduped = new Set<number>();
  for (const segment of value.split(",")) {
    const token = segment.trim();
    if (!token) continue;
    const parsed = Number(token);
    if (!Number.isInteger(parsed) || parsed <= 0) continue;
    deduped.add(parsed);
    if (deduped.size >= MAX_TOKEN_IDS) break;
  }

  return Array.from(deduped);
}

function parseCollection(value: string | null): OpenSeaCollectionKey {
  if (value === "seekers") return "seekers";
  return "pendulums";
}

export async function GET(request: NextRequest) {
  try {
    const tokenIds = parseTokenIds(request.nextUrl.searchParams.get("tokenIds"));
    const collection = parseCollection(request.nextUrl.searchParams.get("collection"));
    const { fetchedAt, listingsByTokenId } = await getCollectionActiveListings(collection);

    const selectedEntries =
      tokenIds.length > 0
        ? tokenIds
            .map((tokenId) => [String(tokenId), listingsByTokenId[tokenId]] as const)
            .filter((entry): entry is readonly [string, (typeof listingsByTokenId)[number]] => Boolean(entry[1]))
        : Object.entries(listingsByTokenId);

    return NextResponse.json({
      updatedAt: fetchedAt,
      collection,
      requested: tokenIds.length > 0 ? tokenIds.length : null,
      listedCount: Object.keys(listingsByTokenId).length,
      listings: Object.fromEntries(selectedEntries),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch listing status.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
