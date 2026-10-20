#!/usr/bin/env node
/**
 * check.mjs - health check for an LLM-wiki vault made by init.mjs. Read-only.
 *   node check.mjs <vaultDir> [--json]
 *
 * Reports
 *   index-missing   wiki page not listed in 20_위키/index.md
 *   index-orphan    index.md links to a page that does not exist
 *   frontmatter     required field missing or type/status value not allowed
 *   broken-link     [[link]] to a note that does not exist anywhere in the vault
 *   recheck-due     recheck date has passed
 *   isolated        wiki page with no links in or out
 *   raw-pending     source in 10_원본 still has ingest_status: 대기
 * Exit 1 if anything except raw-pending/isolated is found (those are reminders).
 */
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const root = argv.find((a) => !a.startsWith('--'));
if (!root || !fs.existsSync(root)) { console.error('usage: node check.mjs <vaultDir> [--json]'); process.exit(2); }
const wikiDir = path.join(root, '20_위키');
const rawDir = path.join(root, '10_원본');
const REQUIRED = ['title', 'type', 'status', 'sources', 'checked', 'tags', 'created', 'updated'];
const TYPES = ['자료요약', '개념', '도구', '실전-방법', '실전-실험', '실전-교훈', '실전-판단', '종합'];
const STATUS = ['직접확인', '출처확인', '작성자주장', '미검증', '폐기'];

const walk = (dir) => (!fs.existsSync(dir) ? [] : fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
  if (d.name.startsWith('.')) return [];
  const p = path.join(dir, d.name);
  return d.isDirectory() ? walk(p) : p.endsWith('.md') ? [p] : [];
}));
const fmOf = (t) => {
  const m = t.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const o = {};
  for (const l of m[1].split(/\r?\n/)) { const k = l.match(/^([A-Za-z_]+):\s*(.*)$/); if (k) o[k[1]] = k[2].trim().replace(/^"|"$/g, ''); }
  return o;
};
const linksOf = (t) => [...t.replace(/```[\s\S]*?```/g, '').matchAll(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g)].map((m) => path.basename(m[1].trim()));

const all = walk(root);
const names = new Set(all.map((p) => path.basename(p, '.md')));
const pages = walk(wikiDir).filter((p) => !['index.md', 'log.md'].includes(path.basename(p)));
const indexText = fs.existsSync(path.join(wikiDir, 'index.md')) ? fs.readFileSync(path.join(wikiDir, 'index.md'), 'utf8') : '';
const indexLinks = new Set(linksOf(indexText));
const today = new Date().toLocaleDateString('sv-SE');
const P = { 'index-missing': [], 'index-orphan': [], frontmatter: [], 'broken-link': [], 'recheck-due': [], isolated: [], 'raw-pending': [] };

const inbound = new Map();
const outbound = new Map();
for (const p of all) {
  const name = path.basename(p, '.md');
  const ls = linksOf(fs.readFileSync(p, 'utf8'));
  outbound.set(name, ls.length);
  for (const l of ls) inbound.set(l, (inbound.get(l) || 0) + 1);
}
for (const p of pages) {
  const name = path.basename(p, '.md');
  const t = fs.readFileSync(p, 'utf8');
  const fm = fmOf(t);
  const rel = path.relative(root, p);
  if (!indexLinks.has(name)) P['index-missing'].push(rel);
  if (!fm) P.frontmatter.push(`${rel}: 머리 정보 없음`);
  else {
    const miss = REQUIRED.filter((k) => !(k in fm) || fm[k] === '');
    if (miss.length) P.frontmatter.push(`${rel}: 빠짐 ${miss.join(', ')}`);
    if (fm.type && !TYPES.includes(fm.type)) P.frontmatter.push(`${rel}: type "${fm.type}"는 허용 목록에 없음`);
    if (fm.status && !STATUS.includes(fm.status)) P.frontmatter.push(`${rel}: status "${fm.status}"는 허용 목록에 없음`);
    if (fm.recheck && /^\d{4}-\d{2}-\d{2}$/.test(fm.recheck) && fm.recheck < today) P['recheck-due'].push(`${rel}: ${fm.recheck}`);
  }
  for (const l of linksOf(t)) if (!names.has(l)) P['broken-link'].push(`${rel} -> [[${l}]]`);
  if (!(inbound.get(name) > (indexLinks.has(name) ? 1 : 0)) && !outbound.get(name)) P.isolated.push(rel);
}
for (const l of indexLinks) if (!pages.some((p) => path.basename(p, '.md') === l)) P['index-orphan'].push(`[[${l}]]`);
for (const p of walk(rawDir)) { const fm = fmOf(fs.readFileSync(p, 'utf8')); if (fm && fm.ingest_status === '대기') P['raw-pending'].push(path.relative(root, p)); }

const LABEL = { 'index-missing': '목록에 없는 위키 문서', 'index-orphan': '목록에만 있는 문서', frontmatter: '머리 정보 문제', 'broken-link': '깨진 연결', 'recheck-due': '다시 확인할 날 지남', isolated: '연결 없는 문서(참고)', 'raw-pending': '정리 대기 원본(참고)' };
const hard = Object.entries(P).filter(([k, v]) => v.length && !['isolated', 'raw-pending'].includes(k)).length;
if (argv.includes('--json')) console.log(JSON.stringify({ pages: pages.length, problems: P }, null, 1));
else {
  console.log(`위키 문서 ${pages.length}개 점검`);
  for (const [k, v] of Object.entries(P)) if (v.length) console.log(`\n[${LABEL[k]}] ${v.length}개\n` + v.slice(0, 30).map((x) => '  - ' + x).join('\n') + (v.length > 30 ? `\n  ... 외 ${v.length - 30}개` : ''));
  console.log(hard ? '\n고칠 것이 있습니다. 목록을 먼저 보여 주고 확인받은 뒤 고칩니다.' : '\n문제 없음.');
}
process.exit(hard ? 1 : 0);
