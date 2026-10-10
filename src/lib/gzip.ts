/**
 * Fetches a gzip file and returns its decompressed bytes. Static hosts serve `.gz`
 * files as-is (no Content-Encoding), so the browser does not decompress them for us.
 * Files that are not gzip (magic bytes 1f 8b) are returned unchanged.
 */
export async function fetchGunzipped(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url} (${res.status})`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (bytes[0] !== 0x1f || bytes[1] !== 0x8b) return bytes.buffer;
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).arrayBuffer();
}

export async function fetchGzippedJson<T>(url: string): Promise<T> {
  return JSON.parse(new TextDecoder().decode(await fetchGunzipped(url))) as T;
}
