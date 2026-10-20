#!/usr/bin/env node
/**
 * init.mjs - create an LLM-wiki style Obsidian vault (Karpathy "LLM Wiki" pattern, Korean folder names).
 * Zero dependencies, Node 18+. Never overwrites an existing file.
 *
 *   node init.mjs <vaultDir> [--name "내 지식 저장고"] [--owner "나"] [--git]
 *
 * Creates
 *   00_받은자료/            inbox: links, ideas, notes from other AIs
 *   10_원본/<5 folders>/    sources, never edited after capture (except ingest_status)
 *   20_위키/<5 folders>/    the wiki the agent keeps rewriting + index.md + log.md
 *   30_결과물/              lectures, articles, books built from the wiki
 *   80_서식/                note templates (원본, 자료요약, 개념, 실전)
 *   90_첨부/                images, PDFs
 *   운영규칙.md             the rules every AI reads before touching the vault
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const vault = argv.find((a, i) => !a.startsWith('--') && !(i > 0 && ['--name', '--owner'].includes(argv[i - 1])));
if (!vault) { console.error('usage: node init.mjs <vaultDir> [--name "내 지식 저장고"] [--owner "나"] [--git]'); process.exit(2); }
const NAME = opt('name', '내 지식 저장고');
const OWNER = opt('owner', '나');
const today = new Date().toLocaleDateString('sv-SE');

const created = [], skipped = [];
const dir = (p) => fs.mkdirSync(path.join(vault, p), { recursive: true });
const file = (p, text) => {
  const f = path.join(vault, p);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  if (fs.existsSync(f)) { skipped.push(p); return; }
  fs.writeFileSync(f, text.replace(/^\n/, ''), 'utf8');
  created.push(p);
};

for (const d of ['00_받은자료', '10_원본/글과기사', '10_원본/영상자막', '10_원본/내메모', '10_원본/작업기록', '10_원본/문서',
  '20_위키/자료요약', '20_위키/개념', '20_위키/도구와플랫폼', '20_위키/실전', '20_위키/종합', '30_결과물', '80_서식', '90_첨부']) dir(d);

file('운영규칙.md', `
# ${NAME} 운영 규칙

> 이 저장고를 다루는 AI(Claude Code, Codex, Aside 등)는 작업 전에 이 문서를 끝까지 읽고 그대로 따릅니다.
> 만든 날: ${today} · 방식: Karpathy의 LLM Wiki 패턴
> ${OWNER}는 자료를 고르고 방향과 판단을 정합니다. AI는 요약, 연결, 목록 정리, 기록, 점검을 맡습니다.

## 1. 목적
흩어지는 배움을 붙잡아 **다음 작업에서 다시 꺼내 쓰는 것**이 목적입니다. 그래서 많이 모으기보다 아래 네 가지를 먼저 지킵니다.
1. 다시 쓸 수 있는 배움만 넣는다.
2. 모든 내용에 출처와 확인 상태를 붙인다.
3. 새 문서보다 기존 문서 고치기를 먼저 한다.
4. 틀린 내용은 지우지 않고, 무엇이 왜 바뀌었는지 남긴다.

## 2. 폴더
| 폴더 | 역할 | 누가 쓰나 |
|---|---|---|
| \`00_받은자료/\` | 아직 정리 안 한 링크, 생각, 다른 AI의 메모 | 사람·AI |
| \`10_원본/\` | 원본 자료. **넣은 뒤 내용 수정 금지** | 사람·AI(추가만) |
| \`20_위키/\` | AI가 정리하고 연결하며 계속 고치는 지식 | AI |
| \`30_결과물/\` | 위키로 만든 강의안, 글, 책 원고 | 사람·AI |
| \`80_서식/\` | 문서 서식 | AI |
| \`90_첨부/\` | 이미지, PDF | 자동 |

\`20_위키\` 안: \`자료요약/\`(원본 1개당 1개, 사실만) · \`개념/\` · \`도구와플랫폼/\` · \`실전/\`(직접 해 보고 얻은 것: 실전-방법, 실전-실험, 실전-교훈, 실전-판단) · \`종합/\`(질문에 답하며 묶은 분석) · \`index.md\`(전체 목록, 질문할 때 가장 먼저 읽음) · \`log.md\`(작업 기록, 추가만)

## 3. 머리 정보 (모든 위키 문서 필수)
\`\`\`yaml
---
title: 문서 제목
type: 자료요약 | 개념 | 도구 | 실전-방법 | 실전-실험 | 실전-교훈 | 실전-판단 | 종합
status: 직접확인 | 출처확인 | 작성자주장 | 미검증 | 폐기
sources: ["[[원본 문서명]]", "https://원문주소"]
checked: ${today}
recheck:
tags: [분야/예시]
created: ${today}
updated: ${today}
---
\`\`\`
- \`직접확인\` 실제로 해 보거나 화면·파일로 확인함 · \`출처확인\` 공식 문서나 원문으로 확인함 · \`작성자주장\` 글쓴이 주장만 있음 · \`미검증\` 아직 확인 못 함 · \`폐기\` 틀렸거나 더는 맞지 않음(지우지 않고 이유를 남김)
- \`recheck\`(다시 확인할 날): 요금·정책은 30일, 도구 기능·모델은 60일, 원리·판단은 비워도 됩니다.

## 4. 세 가지 작업
**자료 넣기**: 원본을 \`10_원본/<폴더>/YYYY-MM-DD_제목.md\`로 저장(\`ingest_status: 대기\`) → \`20_위키/자료요약/\`에 사실만 요약 → 관련 개념·도구·실전 문서를 **먼저 고치고** 없을 때만 새로 만듦 → \`index.md\`, \`log.md\` 갱신 → 원본의 \`ingest_status\`를 \`완료\`로. 한 번에 하나씩 끝내고 다음으로 갑니다.

**질문하기**: \`index.md\` → 관련 위키 문서 → 필요할 때만 원본. 답에는 근거를 \`[[문서명]]\`으로 붙이고 확인 상태가 낮으면 그렇다고 말합니다. 다시 쓸 답은 \`20_위키/종합/\`에 저장합니다.

**점검하기**(월 1회): 서로 어긋나는 내용, 다시 확인할 날이 지난 문서, 연결 없는 문서, 깨진 연결, 머리 정보 누락, 목록과 실제 파일 차이를 **보고서로 먼저** 만들고 ${OWNER}가 확인한 뒤 고칩니다.

## 5. 여러 AI가 함께 쓸 때
- 위키와 원본을 고치는 AI는 **하나로 정합니다.** 나머지 AI는 읽기만 하고, 새로 알게 된 것은 \`00_받은자료/YYYY-MM-DD_출처AI_제목.md\`로만 남깁니다.
- 두 컴퓨터에서 동시에 이 저장고를 고치지 않습니다.

## 6. 넣지 않는 것
비밀번호·인증 코드·API 키, 주민번호·계좌·주소·연락처 같은 개인정보, 다른 사람의 대화·메일 원문, 유료 글 전문(링크·짧은 인용·내 요약만).

## 7. 쓰기 규칙
- 쉽고 짧게 씁니다. 문서 안 연결은 \`[[문서명]]\`입니다.
- \`index.md\` 항목은 한 줄 120자 이내, \`log.md\` 항목은 \`## [YYYY-MM-DD] 작업종류 | 제목\`(수집, 조회, 점검, 정리, 설정)으로 시작합니다.
- 서로 다른 주장은 둘 다 출처와 함께 적고 어느 쪽이 더 믿을 만한지 이유를 씁니다.
- 지어낸 경험·수치·사례를 넣지 않습니다. 모르면 \`미검증\`으로 둡니다.
`);

file('20_위키/index.md', `
# ${NAME} 위키 목록

> 질문할 때 가장 먼저 읽는 목록입니다. 문서 0개 · 마지막 갱신 ${today}

## 자료요약

## 개념

## 도구와플랫폼

## 실전

## 종합
`);
file('20_위키/log.md', `
# 작업 기록

## [${today}] 설정 | 저장고 만들기
- init.mjs로 폴더, 운영규칙, 서식, 목록을 만들었습니다.
`);
file('00_받은자료/README.md', `
# 받은자료

정리하지 않은 링크, 떠오른 생각, 다른 AI가 남긴 메모를 여기에 둡니다. 파일 이름은 \`YYYY-MM-DD_제목.md\`를 권장합니다. 위키를 관리하는 AI가 정리할 때 읽어 갑니다.
`);
file('80_서식/원본.md', `
---
title:
source_url:
author:
captured:
ingest_status: 대기
---

# 제목

(원문 요약 또는 허용되는 범위의 발췌. 유료 글은 전문을 넣지 않습니다.)
`);
const fm = (type, status) => `---\ntitle:\ntype: ${type}\nstatus: ${status}\nsources: []\nchecked:\nrecheck:\ntags: []\ncreated:\nupdated:\n---\n`;
file('80_서식/자료요약.md', `${fm('자료요약', '출처확인')}
# 제목

## 한 줄 요약

## 핵심 내용 (사실만)
-

## 원문에서 확인한 근거
-

## 연결된 문서
-
`);
file('80_서식/개념.md', `${fm('개념', '미검증')}
# 제목

## 한 줄 정의

## 왜 중요한가

## 어떻게 쓰는가
-

## 서로 다른 주장
-

## 연결된 문서
-
`);
file('80_서식/실전.md', `${fm('실전-방법', '직접확인')}
# 제목

## 상황
무엇을 하려고 했는지

## 한 일 / 결과
-

## 왜 그렇게 됐는지

## 다음에 쓸 방법
-

## 근거
- 기록 파일, 날짜, 결과 주소

## 연결된 문서
-
`);

if (argv.includes('--git') && !fs.existsSync(path.join(vault, '.git'))) {
  const g = spawnSync('git', ['init', '-q', vault], { encoding: 'utf8' });
  if (g.status === 0) { fs.writeFileSync(path.join(vault, '.gitignore'), '.obsidian/workspace*\n.trash/\n.recall-cache.json\n'); created.push('.git (변경 기록)'); }
  else console.error('git init failed: ' + g.stderr);
}

console.log(JSON.stringify({ vault: path.resolve(vault), created: created.length, skipped, next: 'AI에게 운영규칙.md를 읽게 한 뒤 첫 자료를 넣어 보세요.' }, null, 1));
