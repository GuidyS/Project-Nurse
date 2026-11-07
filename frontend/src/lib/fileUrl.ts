export function resolveStoredFileUrl(value: unknown, apiBaseUrl?: string): string {
  const reference = typeof value === "string" ? value.trim() : "";
  if (!reference) return "";
  if (/^https:\/\//i.test(reference)) return reference;

  const base = (apiBaseUrl || import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");
  const storageMatch = reference.match(/^storage:\/\/([0-9a-f-]{36})$/i);
  if (storageMatch) {
    return `${base}/index.php?page=file-access&id=${encodeURIComponent(storageMatch[1])}&disposition=inline`;
  }
  if (/^index\.php\?/i.test(reference)) return `${base}/${reference}`;
  return `${base}/${reference.replace(/^\/+/, "")}`;
}
