import * as fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Problem, imagePath } from './model.mjs';

const LIMIT = 8 * 1024 * 1024;
export async function decodeImage(buffer) {
  let type;
  if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) type = 'jpg';
  else if (buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) type = 'png';
  else if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') type = 'webp';
  if (!type || !buffer.length || buffer.length > LIMIT) throw new Problem('海报必须是可解码的 JPG、PNG 或 WebP，最大 8 MB');
  const { default: puppeteer } = await import('puppeteer');
  const candidates = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'];
  let executablePath; for (const p of candidates) { if (await fs.access(p).then(() => true, () => false)) { executablePath = p; break; } }
  let browser;
  try {
    browser = await puppeteer.launch({ executablePath, headless: true }); const page = await browser.newPage();
    const ok = await page.evaluate(async (data) => {
      const binary = Uint8Array.from(atob(data), c => c.charCodeAt(0));
      try { const bitmap = await createImageBitmap(new Blob([binary])); const valid = bitmap.width > 0 && bitmap.height > 0 && bitmap.width * bitmap.height <= 40000000; bitmap.close(); return valid; } catch { return false; }
    }, buffer.toString('base64'));
    if (!ok) throw new Problem('图片无法解码或像素过大，请换一张海报');
  } finally { await browser?.close(); }
  return type;
}
export async function saveImage(root, buffer, decoder = decodeImage) {
  const type = await decoder(buffer); const name = randomUUID() + '.' + type, folder = path.join(root, 'assets/img/movies');
  await fs.mkdir(folder, { recursive: true }); const temp = path.join(folder, '.poster-' + randomUUID() + '.tmp');
  try { await fs.writeFile(temp, buffer, { flag: 'wx' }); await fs.rename(temp, path.join(folder, name)); } finally { await fs.rm(temp, { force: true }).catch(() => {}); }
  return '/assets/img/movies/' + name;
}
export async function cacheImage(root, sourcePath) {
  imagePath(sourcePath); if (!sourcePath) return null;
  let response;
  try { response = await fetch('https://image.tmdb.org/t/p/w500' + sourcePath, { signal: AbortSignal.timeout(15000), redirect: 'error' }); } catch { throw new Problem('海报下载失败，表单仍保留；可关闭缓存后重试', 502); }
  if (!response.ok || !/^image\/(jpeg|png|webp)(;|$)/.test(response.headers.get('content-type') || '') || Number(response.headers.get('content-length')) > LIMIT) throw new Problem('海报响应无效，未保存记录', 502);
  const chunks = []; let size = 0; for await (const chunk of response.body) { size += chunk.length; if (size > LIMIT) { await response.body.cancel().catch(() => {}); throw new Problem('海报超过 8 MB'); } chunks.push(chunk); }
  return saveImage(root, Buffer.concat(chunks));
}
