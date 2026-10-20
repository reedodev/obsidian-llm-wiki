<p align="center"><img src="docs/banner.png" alt="옵시디언 LLM 위키: AI가 정리하고 이어 주는 나만의 지식 저장고" width="100%"></p>

<p align="center">
<a href="https://github.com/reedodev/obsidian-llm-wiki/actions/workflows/test.yml"><img src="https://github.com/reedodev/obsidian-llm-wiki/actions/workflows/test.yml/badge.svg" alt="test"></a>
<img src="https://img.shields.io/badge/Claude_Code-skill-2547F4" alt="Claude Code skill">
<img src="https://img.shields.io/badge/license-MIT-black" alt="MIT">
</p>

# 옵시디언 LLM 위키 (obsidian-llm-wiki)

옵시디언 보관함을 Karpathy가 제안한 LLM 위키 방식으로 만듭니다. 받은자료·원본·위키·결과물 폴더와 운영규칙, 서식, 목록을 한 번에 만들고, AI가 자료를 넣고 질문에 답하고 점검하는 순서를 정해 둡니다. 3D 지식그래프와 노트 먼저 찾아보기 스킬이 읽는 바로 그 저장고입니다.

<!-- prereq-adapt -->
## 무엇이 필요한가요?

꼭 필요한 것은 Node 18 이상, 저장고로 쓸 폴더, 그리고 위키를 고칠 AI 하나(Claude Code, Codex 등)입니다. 옵시디언 앱과 git은 권장입니다. 전체 표는 [SKILL.md의 준비물](skills/obsidian-llm-wiki/SKILL.md#준비물-쓰기-전에-있어야-하는-것)에 있습니다.

## 바꿔 쓰기

에이전트에게 다음처럼 말하면 구조와 규칙을 바꿉니다.

- "저장고 이름을 '회사 업무 노트'로 해 줘" → `init.mjs <폴더> --name "회사 업무 노트"`
- "원본 폴더에 '회의록'도 만들어 줘" → `10_원본/회의록/` 추가와 운영규칙 표 한 줄
- "문서 종류에 '레시피'를 추가해 줘" → `운영규칙.md`와 `check.mjs`의 `TYPES`를 함께 수정

말과 바뀌는 곳의 대응표는 [SKILL.md의 바꿔 쓰기](skills/obsidian-llm-wiki/SKILL.md#바꿔-쓰기-이렇게-말하세요)에 있습니다.

## 같이 쓰면 좋은 스킬

- [obsidian-brain-3d](https://github.com/reedodev/obsidian-brain-3d): 이 저장고를 엑스레이 뇌와 세계수 3D로 봅니다.
- [vault-recall](https://github.com/reedodev/vault-recall): 작업 전에 이 저장고에서 관련 교훈을 먼저 찾습니다.
## 설치

**Claude Code 플러그인으로 설치**

```
/plugin marketplace add reedodev/obsidian-llm-wiki
/plugin install obsidian-llm-wiki@obsidian-llm-wiki
```

**폴더만 복사**

```bash
git clone https://github.com/reedodev/obsidian-llm-wiki.git
cp -r obsidian-llm-wiki/skills/obsidian-llm-wiki ~/.claude/skills/
```

필요한 것: Node 18+

## 바로 해 보기

```bash
node skills/obsidian-llm-wiki/scripts/init.mjs ~/MyVault --name "내 지식 저장고" --git
node skills/obsidian-llm-wiki/scripts/check.mjs ~/MyVault
```

자세한 절차, 옵션, 한계는 [SKILL.md](skills/obsidian-llm-wiki/SKILL.md)에 있습니다. 에이전트가 이 파일을 읽고 그대로 따릅니다.

## 시험

`node tests/run.mjs`가 SKILL.md 형식을 검사하고 예시 파일로 스크립트를 실제로 실행합니다. 푸시할 때마다 GitHub Actions가 같은 시험을 돌립니다(위 test 배지).

<!-- credits -->
## 출처와 영감

- **LLM Wiki 아이디어**: Andrej Karpathy가 공개한 [LLM Wiki 아이디어 파일(llm-wiki.md)](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)에서 왔습니다. 사람이 자료를 고르고 AI가 위키를 계속 고쳐 나가며, 옵시디언으로 결과를 본다는 핵심 방식은 이 글의 것입니다.
- 원문은 일부러 구체적인 구조를 정하지 않은 아이디어 문서입니다. 이 스킬의 한국어 폴더 이름(받은자료·원본·위키·결과물), 머리말 항목, 확인 상태 다섯 단계, 운영규칙 문서, 점검·목록 스크립트는 작성자가 실제로 저장고를 운영하며 정한 것이고, 원문의 글이나 코드를 옮기지 않았습니다.
- 더 알고 싶다면 원문을 직접 읽어 보는 것을 권합니다.

## 만든 사람

**리도**, AI 좌충우돌 실습 중인 20년차 엔지니어입니다. 매일 AI에게 일을 맡기다가 막힌 부분을 고쳐 가며 이 스킬을 만들었습니다.
[YouTube @Reedodev](https://www.youtube.com/@Reedodev) · [Threads @reedo.dev](https://www.threads.com/@reedo.dev) · [GitHub @reedodev](https://github.com/reedodev)

같이 만든 다른 스킬: [옵시디언 3D 지식그래프](https://github.com/reedodev/obsidian-brain-3d) · [노트 먼저 찾아보기](https://github.com/reedodev/vault-recall) · [작업 기록 강의자료](https://github.com/reedodev/work-to-lecture-deck) · [한국어 말투 점검](https://github.com/reedodev/korean-tone-check) · [네이버 황금키워드](https://github.com/reedodev/naver-golden-keywords) · [한글 양식 채우기](https://github.com/reedodev/hwpx-form-fill) · [TTS 끝소리 고치기](https://github.com/reedodev/tts-tail-fix) · [카드뉴스 렌더](https://github.com/reedodev/html-card-render) · [영상 비율 검사](https://github.com/reedodev/social-video-gate) · [유튜브 게시 점검](https://github.com/reedodev/youtube-publish-checklist)

---

## English

Set up an Obsidian vault as a Karpathy-style LLM Wiki: inbox, sources, wiki, outputs, a rules file every AI reads first, templates and an index, plus scripts to rebuild the index and health-check links, front matter and recheck dates.

**Credits.**
- The LLM Wiki pattern comes from Andrej Karpathy's [llm-wiki idea file](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f). The Korean folder layout, front-matter fields, status levels, rules file and scripts are this repository's own implementation; no text or code was copied from the gist.

Install: `/plugin marketplace add reedodev/obsidian-llm-wiki` then `/plugin install obsidian-llm-wiki@obsidian-llm-wiki`, or copy `skills/obsidian-llm-wiki` into `~/.claude/skills/`. See [SKILL.md](skills/obsidian-llm-wiki/SKILL.md) for the full procedure. MIT License; third-party models, fonts and libraries keep their own licenses.
