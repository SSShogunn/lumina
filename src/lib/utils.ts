import { type ClassValue, clsx } from "clsx";
import { Metadata } from "next";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  if (typeof window !== "undefined") return path;
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}${path}`;
  }
  return `http://localhost:${process.env.PORT ?? 3000}${path}`;
}

export function constructMetadata({
  title = "Lumina - The AI for PDFs",
  description = "Lumina is software that makes interacting with your PDF files seamless and efficient.",
  image = "/thumbnail.png",
  icons = "/favicon.ico",
  noIndex = false,
  urlPath = "/",
  keywords = ["AI", "PDF", "Open Source", "Chatbot"],
  ogType = "website",
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
  urlPath?: string;
  keywords?: string[];
  ogType?: "website";
} = {}): Metadata {
  const metadata: Metadata = {
    title,
    description,
    keywords: keywords.join(", "),
    authors: [{ name: "Aman Singh", url: "https://luminaa.vercel.app" }],
    openGraph: {
      type: ogType, 
      url: absoluteUrl(urlPath),
      title,
      description,
      images: [
        {
          url: absoluteUrl(image),
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(image)],
      creator: "@Amansin14027414",
    },
    icons,
    metadataBase: new URL("https://luminaa.vercel.app"),
  };

  if (noIndex) {
    metadata.robots = {
      index: false,
      follow: false,
    };
  }

  return metadata;
}
