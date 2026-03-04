import { NextRequest, NextResponse } from "next/server";
import { getCollectionActiveListings } from "@/lib/opensea";

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

export async function GET(request: NextRequest) {
  try {
    const tokenIds = parseTokenIds(request.nextUrl.searchParams.get("tokenIds"));
    const { fetchedAt, listingsByTokenId } = await getCollectionActiveListings();

    const selectedEntries =
      tokenIds.length > 0
        ? tokenIds
            .map((tokenId) => [String(tokenId), listingsByTokenId[tokenId]] as const)
            .filter((entry): entry is readonly [string, (typeof listingsByTokenId)[number]] => Boolean(entry[1]))
        : Object.entries(listingsByTokenId);

    return NextResponse.json({
      updatedAt: fetchedAt,
      requested: tokenIds.length > 0 ? tokenIds.length : null,
      listedCount: Object.keys(listingsByTokenId).length,
      listings: Object.fromEntries(selectedEntries),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch listing status.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
