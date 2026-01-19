/**
 * Autoon Web Compression Utilities
 * Uses Web Compression Streams API with base64url encoding for URL sharing
 */

/**
 * Compress a string and encode as base64url for URL fragment
 */
export async function compressToBase64url(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  
  // Create a compression stream
  const cs = new CompressionStream('gzip');
  const writer = cs.writable.getWriter();
  
  // Write data and close
  writer.write(data);
  await writer.close();
  
  // Read compressed data
  const reader = cs.readable.getReader();
  const chunks: Uint8Array[] = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  // Combine chunks
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const compressed = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    compressed.set(chunk, offset);
    offset += chunk.length;
  }
  
  // Convert to base64url
  const base64 = btoa(String.fromCharCode(...compressed));
  const base64url = base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  
  return base64url;
}

/**
 * Decompress a base64url string from URL fragment
 */
export async function decompressFromBase64url(base64url: string): Promise<string> {
  // Restore base64 padding
  const pad = (4 - (base64url.length % 4)) % 4;
  const base64 = base64url
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    + '='.repeat(pad);
  
  // Decode base64 to bytes
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  
  // Create a decompression stream
  const ds = new DecompressionStream('gzip');
  const writer = ds.writable.getWriter();
  
  // Write compressed data
  writer.write(bytes);
  await writer.close();
  
  // Read decompressed data
  const reader = ds.readable.getReader();
  const chunks: Uint8Array[] = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  // Combine and decode
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const decompressed = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    decompressed.set(chunk, offset);
    offset += chunk.length;
  }
  
  const decoder = new TextDecoder();
  return decoder.decode(decompressed);
}

/**
 * Update URL fragment with compressed data
 */
export async function updateUrlWithData(data: string): Promise<string> {
  const compressed = await compressToBase64url(data);
  const url = new URL(window.location.href);
  url.hash = `data=${compressed}`;
  window.history.replaceState(null, '', url.toString());
  return url.toString();
}

/**
 * Load data from URL fragment if present
 */
export async function loadDataFromUrl(): Promise<string | null> {
  const hash = window.location.hash;
  if (!hash || !hash.startsWith('#data=')) {
    return null;
  }
  
  const base64url = hash.slice(6); // Remove '#data='
  try {
    return await decompressFromBase64url(base64url);
  } catch (error) {
    console.error('Failed to decompress URL data:', error);
    return null;
  }
}
