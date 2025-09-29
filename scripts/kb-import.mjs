#!/usr/bin/env node
/**
 * ZANTARA KB Importer
 * Usage:
 *   node scripts/kb-import.mjs --user zero@balizero.com <path1> <path2> ...
 * Env:
 *   PROXY_BASE=https://zantara-web-proxy-himaadsxua-ew.a.run.app/api/zantara
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const userIdx = args.indexOf('--user');
const userId = userIdx >= 0 ? args[userIdx + 1] : process.env.Z_USER_ID || '';
const roots = args.filter((a, i) => i !== userIdx && i !== userIdx + 1);
if (!roots.length) {
  console.error('Provide one or more directories or files to import.');
  process.exit(1);
}
const PROXY_BASE = process.env.PROXY_BASE || 'https://zantara-web-proxy-himaadsxua-ew.a.run.app/api/zantara';

// Lazy loaders
let pdfParse = null, mammoth = null;
async function readFileSmart(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === '.txt' || ext === '.md') return String(await fs.readFile(file));
  if (ext === '.pdf') {
    if (!pdfParse) pdfParse = (await import('pdf-parse')).default;
    const data = await fs.readFile(file);
    const res = await pdfParse(data);
    return String(res.text || '').trim();
  }
  if (ext === '.docx') {
    if (!mammoth) mammoth = await import('mammoth');
    const data = await fs.readFile(file);
    const res = await mammoth.convertToHtml({ buffer: data });
    return res.value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  return '';
}

async function walk(p) {
  const out = [];
  const stat = await fs.stat(p);
  if (stat.isDirectory()) {
    const list = await fs.readdir(p);
    for (const f of list) out.push(...(await walk(path.join(p, f))));
  } else {
    const ext = path.extname(p).toLowerCase();
    if (['.pdf', '.docx', '.txt', '.md'].includes(ext)) out.push(p);
  }
  return out;
}

function detectCategory(fp) {
  const s = fp.toLowerCase();
  if (s.includes('immigrazione')) return 'immigration';
  if (s.includes('company') || s.includes('license')) return 'company_license';
  if (s.includes('tax')) return 'tax';
  if (s.includes('core') || s.includes('identity')) return 'core_identity';
  return 'general';
}

const packId = `KB-${new Date().toISOString().slice(0,10).replace(/-/g,'')}`;
let total=0, ok=0, err=0;
for (const root of roots) {
  const files = await walk(root);
  for (const f of files) {
    try {
      const text = await readFileSmart(f);
      if (!text || text.length < 20) continue;
      const title = path.basename(f).replace(/\s+/g,' ').trim();
      const category = detectCategory(f);
      const payload = { key: 'kb.upsert', params: { packId, title, category, language: 'auto', text, source: f, tags: [category] } };
      const resp = await fetch(`${PROXY_BASE}/call`, { method: 'POST', headers: { 'Content-Type':'application/json', ...(userId ? { 'x-user-id': userId } : {}) }, body: JSON.stringify(payload) });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      ok++; total++;
      process.stdout.write(`+ ${title} (${category})\n`);
    } catch (e) {
      err++; total++;
      process.stderr.write(`! ${f} -> ${e.message}\n`);
    }
  }
}
console.log(`\nPack ${packId} completed: OK=${ok} ERR=${err} TOTAL=${total}`);

