import type { Metadata } from "next";

const DEFAULT_SITE_NAME = "Pursuit of Equilibrium";
const DEFAULT_IMAGE = "/poe-logo-1024.jpg";

export function getSiteUrl(): URL {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;
  if (configuredUrl) {
    if (configuredUrl.startsWith("http://") || configuredUrl.startsWith("https://")) {
      return new URL(configuredUrl);
    }

    return new URL(`https://${configuredUrl}`);
  }

  return new URL("http://localhost:3000");
}

type BuildPageMetadataArgs = {
  title: string;
  description: string;
  path: string;
  image?: string;
};

export function buildPageMetadata({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
}: BuildPageMetadataArgs): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      siteName: DEFAULT_SITE_NAME,
      title,
      description,
      url: path,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
