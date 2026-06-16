# .briefing — AI 데일리 브리핑 자동 게시

매일 아침 7시(KST), Claude 클라우드 루틴이 이 저장소에 AI 뉴스 글을 자동 게시한다.

## 동작 흐름
1. 클라우드 루틴이 이 repo를 체크아웃한 상태로 기동
2. `.briefing/PROMPT.md` 지시에 따라 웹 리서치(논문 + Claude Code/Codex 팁)
3. `content/posts/ai-news-YYYY-MM-DD.md` 글 생성 (`categories: ["AI 뉴스"]`)
4. `.briefing/history.jsonl`에 다룬 항목 append (중복 방지)
5. `hugo` 빌드 검증 후 `main`에 commit & push
6. `.github/workflows/hugo.yml`가 사이트를 빌드·배포

## 파일
- `PROMPT.md` — 생성/형식/게시 스펙 (내용·형식을 바꾸려면 이 파일만 수정)
- `history.jsonl` — 이미 다룬 논문 arXiv ID / 팁 URL·토픽 (append-only)
- `README.md` — 이 문서

## 결과 위치
- 글: https://jkpark83.github.io/posts/ai-news-YYYY-MM-DD/
- 카테고리: https://jkpark83.github.io/categories/ai-뉴스/

## 이력
2026-06-16: 기존 로컬 launchd cron(평일 10시, Gmail 발송) → 클라우드 루틴(매일 7시,
블로그 게시)으로 전환. 컴퓨터 전원 상태와 무관하게 동작하도록 클라우드로 이동.
기존 `~/ai-briefing/history.jsonl`(165줄)을 여기로 이전.
