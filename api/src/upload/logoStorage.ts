import { open, readFile } from 'node:fs/promises';

/** PNG signature: 89 50 4E 47 0D 0A 1A 0A. */
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

async function isPng(filePath: string): Promise<boolean> {
  const handle = await open(filePath, 'r');
  try {
    const header = Buffer.alloc(PNG_MAGIC.length);
    const { bytesRead } = await handle.read(header, 0, PNG_MAGIC.length, 0);
    return bytesRead === PNG_MAGIC.length && header.equals(PNG_MAGIC);
  } finally {
    await handle.close();
  }
}

/**
 * Minimal SVG content sniff (R4.1: "validated by content sniffing, not
 * extension alone"): after stripping BOM, XML declaration, comments and
 * DOCTYPE, the document's root element must literally be `<svg`. An HTML
 * file smuggled in as `image/svg+xml` fails this (root `<html`).
 */
async function isSvg(filePath: string): Promise<boolean> {
  // Files are capped at 200KB by multer, so reading fully is fine.
  let text = await readFile(filePath, 'utf8');
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // BOM

  let rest = text.trimStart();
  // Skip any prolog: <?xml ...?>, <!-- comments -->, <!DOCTYPE ...>
  for (;;) {
    if (rest.startsWith('<?')) {
      const end = rest.indexOf('?>');
      if (end === -1) return false;
      rest = rest.slice(end + 2).trimStart();
    } else if (rest.startsWith('<!--')) {
      const end = rest.indexOf('-->');
      if (end === -1) return false;
      rest = rest.slice(end + 3).trimStart();
    } else if (rest.startsWith('<!')) {
      // DOCTYPE — legit for SVG only when it declares svg.
      const end = rest.indexOf('>');
      if (end === -1) return false;
      if (!/^<!doctype\s+svg/i.test(rest.slice(0, end + 1))) return false;
      rest = rest.slice(end + 1).trimStart();
    } else {
      break;
    }
  }
  return /^<svg[\s>/]/.test(rest);
}

/**
 * Post-write content validation (design §4). Returns true when the file's
 * bytes match its declared mimetype; the caller unlinks + 415s otherwise.
 */
export async function validateLogoContent(filePath: string, mimetype: string): Promise<boolean> {
  try {
    if (mimetype === 'image/png') return await isPng(filePath);
    if (mimetype === 'image/svg+xml') return await isSvg(filePath);
    return false;
  } catch {
    return false;
  }
}
