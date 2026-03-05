// Try to fix strings that look like UTF-8 interpreted as Latin-1 (e.g., "RepresentaciÃ³n" -> "Representación")
// TODO This is a dark magic, I dont like it
export function fixMojibake(input: string): string {
  // Quick check to avoid touching already-correct ASCII/Unicode strings
  if (!/[ÃÂ]/.test(input)) return input;

  try {
    // Treat current string as a sequence of bytes (Latin-1) and decode as UTF-8
    const bytes = new Uint8Array(Array.from(input, ch => ch.charCodeAt(0)));
    return new TextDecoder('utf-8', {fatal: false}).decode(bytes);
  } catch {
    // Fallback: return original if decoding fails
    return input;
  }
}

export function hexToBase64Url(hex: string) {
  if (hex.length % 2) hex = '0' + hex;
  const byteArray = new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  const base64 = btoa(byteToBin(byteArray));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function byteToBin(arr: Uint8Array<ArrayBuffer>) {
  let binary = '';
  for (let i = 0; i < arr.length; i++) {
    binary += String.fromCharCode(arr[i]);
  }
  return binary;
}

// To avoid double slash in path
export function joinPath(base: string, ...paths: string[]) {
  /*  const url = new URL(base);
    paths.forEach(p => {
      url.pathname = [url.pathname.replace(/\/$/, ''), p.replace(/^\//, '')].join('/');
    });
    return url.toString();*/
  const path = `${base}/${paths
    .map((s:string)=> s.replace("/^\/+|\/+$/g", ''))
    .join('/')}`;
  console.log("Path builded: ", path)
  return path;
}
