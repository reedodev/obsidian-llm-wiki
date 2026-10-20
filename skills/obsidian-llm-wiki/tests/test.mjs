// Builds a vault in a temp folder, adds notes, and checks init / index / check behaviour.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const S = (f) => path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'scripts', f);
const v = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'llmwiki-')), 'vault');
const run = (f, ...a) => spawnSync('node', [S(f), ...a], { encoding: 'utf8' });
const fail = (m) => { console.log('FAIL ' + m); process.exit(1); };

let r = run('init.mjs', v, '--name', '시험 저장고');
if (r.status !== 0) fail('init: ' + r.stderr);
for (const f of ['운영규칙.md', '20_위키/index.md', '20_위키/log.md', '80_서식/실전.md', '10_원본/내메모']) if (!fs.existsSync(path.join(v, f))) fail('missing ' + f);
fs.appendFileSync(path.join(v, '운영규칙.md'), '\n내가 고친 줄\n');
r = run('init.mjs', v);
if (JSON.parse(r.stdout).skipped.length < 5 || !fs.readFileSync(path.join(v, '운영규칙.md'), 'utf8').includes('내가 고친 줄')) fail('init overwrote existing files');

const fm = (t, type, extra = '') => `---\ntitle: ${t}\ntype: ${type}\nstatus: 직접확인\nsources: []\nchecked: 2026-10-20\ntags: [분야/시험]\ncreated: 2026-10-20\nupdated: 2026-10-20\n${extra}---\n`;
fs.writeFileSync(path.join(v, '20_위키/실전/고정 댓글은 공개 뒤에.md'), fm('고정 댓글은 공개 뒤에', '실전-교훈') + '예약 공개 영상은 공개 뒤에 댓글을 단다. 관련: [[유튜브 업로드]]\n');
fs.writeFileSync(path.join(v, '20_위키/도구와플랫폼/유튜브 업로드.md'), fm('유튜브 업로드', '도구') + '업로드 순서를 정리한다. [[없는 문서]]\n');
fs.writeFileSync(path.join(v, '20_위키/개념/머리말 없는 문서.md'), '그냥 메모\n');

r = run('check.mjs', v, '--json');
const j = JSON.parse(r.stdout);
if (r.status !== 1) fail('check should fail on problems');
if (j.problems['index-missing'].length !== 3) fail('expected 3 pages missing from index, got ' + j.problems['index-missing'].length);
if (!j.problems['broken-link'].some((x) => x.includes('없는 문서'))) fail('broken link not found');
if (!j.problems.frontmatter.some((x) => x.includes('머리말 없는 문서'))) fail('missing front matter not found');

r = run('index.mjs', v);
if (r.status !== 0) fail('index: ' + r.stderr);
const idx = fs.readFileSync(path.join(v, '20_위키/index.md'), 'utf8');
if (!idx.startsWith('# 시험 저장고') || !idx.includes('[[고정 댓글은 공개 뒤에]] · 실전-교훈 · 직접확인') || !idx.includes('문서 3개')) fail('index not rebuilt correctly:\n' + idx);
r = run('check.mjs', v, '--json');
if (JSON.parse(r.stdout).problems['index-missing'].length !== 0) fail('index still missing pages after rebuild');
fs.rmSync(path.dirname(v), { recursive: true, force: true });
console.log('obsidian-llm-wiki ok: init (no overwrite), check (index/frontmatter/broken links), index rebuild');
