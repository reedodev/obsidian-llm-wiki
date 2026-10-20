#!/usr/bin/env node
/**
 * index.mjs - rebuild 20_위키/index.md from the wiki pages' front matter.
 *   node index.mjs <vaultDir> [--dry]
 * One line per page (max 120 chars): - [[file name]] · type · status · first sentence of the body.
 * Sections follow the 20_위키 sub-folders. Writes only index.md (use --dry to print instead).
 */
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const root = argv.find((a) => !a.startsWith('--'));
if (!root || !fs.existsSync(path.join(root, '20_위키'))) { console.error('usage: node index.mjs <vaultDir> [--dry]  (needs 20_위키/)'); process.exit(2); }
const wiki = path.join(root, '20_위키');
const ORDER = ['자료요약', '개념', '도구와플랫폼', '실전', '종합'];
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
  if (d.name.startsWith('.')) return [];
  const p = path.join(dir, d.name);
  return d.isDirectory() ? walk(p) : p.endsWith('.md') ? [p] : [];
});
const pages = walk(wiki).filter((p) => !['index.md', 'log.md'].includes(path.basename(p)));
const groups = new Map();
for (const p of pages) {
  const t = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
  const fm = (t.match(/^---\n([\s\S]*?)\n---/) || [])[1] || '';
  const get = (k) => ((fm.match(new RegExp('^' + k + ':\\s*(.*)$', 'm')) || [])[1] || '').trim();
  const body = t.replace(/^---\n[\s\S]*?\n---\n/, '').split('\n').filter((l) => l.trim() && !/^#|^>|^-\s*$|^\|/.test(l.trim()));
  const first = (body[0] || '').replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, '$1').replace(/[*_`]/g, '').trim();
  const name = path.basename(p, '.md');
  let line = `- [[${name}]] · ${get('type') || '?'} · ${get('status') || '?'}${first ? ' · ' + first : ''}`;
  if ([...line].length > 120) line = [...line].slice(0, 119).join('') + '…';
  const sec = path.relative(wiki, p).split(path.sep)[0];
  const key = ORDER.includes(sec) ? sec : '기타';
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(line);
}
const old = fs.existsSync(path.join(wiki, 'index.md')) ? fs.readFileSync(path.join(wiki, 'index.md'), 'utf8') : '';
const title = (old.match(/^# .*$/m) || ['# 위키 목록'])[0];
const today = new Date().toLocaleDateString('sv-SE');
let out = `${title}\n\n> 질문할 때 가장 먼저 읽는 목록입니다. 문서 ${pages.length}개 · 마지막 갱신 ${today}\n`;
for (const k of [...ORDER, '기타']) {
  if (k === '기타' && !groups.has(k)) continue;
  out += `\n## ${k}\n${(groups.get(k) || []).sort().join('\n')}${groups.get(k) ? '\n' : ''}`;
}
if (argv.includes('--dry')) console.log(out);
else { fs.writeFileSync(path.join(wiki, 'index.md'), out, 'utf8'); console.log(`index.md: ${pages.length}개 문서`); }
