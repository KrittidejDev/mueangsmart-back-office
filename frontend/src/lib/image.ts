const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 * Utility to resolve full image URLs from database paths (e.g. Asset UUIDs, /uploads/..., blob:, http, /images/...)
 */
export function resolveImageUrl(url?: string | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }
  if (trimmed.startsWith("/images/")) {
    return trimmed;
  }
  const apiBase = process.env.NEXT_PUBLIC_BASE_API || "https://api.mueangsmart.com";
  if (UUID_REGEX.test(trimmed)) {
    return `${apiBase}/assets/${trimmed}`;
  }
  return `${apiBase}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}
