export async function compressToBase64url(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const cs = new CompressionStream('gzip');
  const writer = cs.writable.getWriter();
  writer.write(data);
  await writer.close();

  const reader = cs.readable.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  let totalLength = 0;
  chunks.forEach((c) => (totalLength += c.length));
  const compressed = new Uint8Array(totalLength);
  let offset = 0;
  chunks.forEach((c) => {
    compressed.set(c, offset);
    offset += c.length;
  });

  return btoa(String.fromCharCode(...compressed))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function decompressFromBase64url(base64url: string): Promise<string> {
  const pad = (4 - (base64url.length % 4)) % 4;
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(pad);
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  const ds = new DecompressionStream('gzip');
  const writer = ds.writable.getWriter();
  writer.write(bytes);
  await writer.close();

  const reader = ds.readable.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  let totalLength = 0;
  chunks.forEach((c) => (totalLength += c.length));
  const decompressed = new Uint8Array(totalLength);
  let offset = 0;
  chunks.forEach((c) => {
    decompressed.set(c, offset);
    offset += c.length;
  });

  return new TextDecoder().decode(decompressed);
}
