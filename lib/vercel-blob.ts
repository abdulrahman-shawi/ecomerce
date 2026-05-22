import { head } from "@vercel/blob";

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

/**
 * Get a public URL for a blob file by its pathname.
 * Returns null if the file doesn't exist or on error.
 */
export async function getBlobUrl(pathname: string): Promise<string | null> {
  if (!BLOB_TOKEN) {
    console.warn("BLOB_READ_WRITE_TOKEN is not set");
    return null;
  }

  try {
    const blob = await head(pathname, { token: BLOB_TOKEN });
    return blob.url;
  } catch (error) {
    console.error(`Failed to get blob URL for "${pathname}":`, error);
    return null;
  }
}

/**
 * Map of productId → blob pathname (file name in Vercel Blob).
 * Add more entries here as you upload images.
 */
const PRODUCT_BLOB_MAP: Record<number, string> = {
  // Example: replace with your actual product id and blob filename
  // 1: "1779476602435-3c4bb9d6_1a20_41fb_a1a4_4c56a1fd4714.png",
};

/**
 * Get the Vercel Blob image URL for a specific product.
 */
export async function getProductImageUrl(productId: number): Promise<string | null> {
  const pathname = PRODUCT_BLOB_MAP[productId];
  if (!pathname) return null;
  return getBlobUrl(pathname);
}

/**
 * Set the blob pathname for a product.
 * Call this when you upload a new image.
 */
export function setProductBlobPath(productId: number, pathname: string): void {
  PRODUCT_BLOB_MAP[productId] = pathname;
}
