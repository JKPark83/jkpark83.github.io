<!-- spec-version: 4 -->
# AI 데일리 브리핑 개발자용 자동 게시 스펙

Publish ONE Korean-language markdown post to `content/posts/`. The reader is a developer building AI agents. Write with high signal, low text density, and useful visuals.

## STEP 0 — Dedupe First

Read `.briefing/history.jsonl` and skim the last 1–2 `content/posts/ai-news-*.md` posts.

Avoid:
- same arXiv ID
- same repo URL
- same tip URL
- identical topic within 7 days, unless there is a real version/release delta
- repeated “ongoing trend” text without a concrete change

If candidates are scarce, say so and publish fewer items.

## Source Ladder

Prefer primary or high-signal sources:
- Models: official blogs/release notes from Anthropic, OpenAI, Google DeepMind, Meta, Mistral, DeepSeek, Qwen, xAI, notable open-weight labs.
- Papers: arXiv, Hugging Face Daily Papers, Papers With Code.
- Open source: GitHub Trending, GitHub search, Hugging Face, Papers With Code.
- Agent/vibe coding: official docs/changelogs, GitHub, Hacker News, Reddit, YouTube, product release notes.

## Visual Rules — Required

Each post MUST include at least 2 useful visuals. Aim for 3 if time allows.

Allowed visual types:
1. Original SVG chart generated from verified data.
2. Original SVG workflow diagram or architecture diagram.
3. Screenshot or image from an official source only when reuse is clearly allowed.
4. Generated explanatory image, if it helps understanding and does not imply fake product UI or fake benchmark data.

Store assets under:

`static/images/ai-news-{YYYY-MM-DD}/`

Reference them in markdown as:

`![Korean alt text](/images/ai-news-{YYYY-MM-DD}/filename.svg)`

Rules:
- Do NOT hotlink remote images.
- Do NOT use generic stock images or decorative hero images.
- Do NOT put raw SVG or raw HTML inside the markdown body.
- Every visual must explain something: timeline, model comparison, benchmark delta, repo map, agent workflow, or Codex/Claude Code workflow.
- Add a short Korean caption below each image in italic.
- For external images, include source and license/usage note in the caption.
- If no safe external image exists, create original SVG diagrams/charts yourself.
- Any chart value must come from a verified source.
- Keep images lightweight and readable on mobile.

Preferred daily visuals:
- “오늘의 AI 변화 지도”: a compact map connecting model/repo/paper/tooling items.
- “Agent Builder 시사점”: workflow diagram for one actionable pattern.
- “Codex vs Claude Code 실전 팁”: small side-by-side workflow card.

## Post Length & Style

Target 900–1,400 Korean words total. Shorter is better if the signal is high.

Rules:
- No long paragraphs. Prefer 2–4 short sentences per item.
- Each item must answer: “그래서 오늘 개발자가 뭘 해볼 수 있나?”
- Avoid filler history/background.
- Use bullets, mini checklists, and compact tables.
- No markdown tables wider than mobile can handle.
- Keep each section skimmable.

## Required Post Structure

Front matter first:

---
title: "AI 데일리 브리핑 — {YYYY-MM-DD}"
date: {YYYY-MM-DD}T07:00:00+09:00
draft: false
categories: ["AI 뉴스"]
tags: ["AI", "모델", "에이전트", "오픈소스", "바이브코딩", "Claude Code", "Codex"]
summary: "오늘의 핵심 1~2문장. 개발자 관점으로 작성."
ShowToc: true
TocOpen: false
---

Body order:

# 🔥 오늘의 핵심
2–3 sentences only. Mention the strongest actionable takeaway.

Include the first visual immediately after this section.

# 🤖 모델 & 릴리즈 레이더
2–3 bullets. Each bullet:
- what changed
- why agent builders should care
- source link

If there is no material model news, write: “오늘은 큰 모델 소식 없음.”

# 📚 주목 논문
Max 2 papers by default, 3 only if truly strong.

For each:
- authors + affiliation
- arXiv ID and category
- core contribution
- method in 2–3 lines
- key result if verified
- 🛠 agent-builder implication
- limitation
- link

Prefer one compact method diagram if the paper is important.

# 🛠 오픈소스 스포트라이트
Top 2–3 repos.

For each:
- repo name + GitHub URL
- language
- approximate star count from GitHub API
- what it does in plain Korean
- concrete use case for agent developers

Include a small comparison chart if covering 2+ repos.

# 🧑‍💻 Codex & Claude Code 실전 팁
This section is REQUIRED every day.

Include:
1. One Codex tip.
2. One Claude Code tip.
3. One tool-agnostic agent-engineering tip if there is enough signal.

Each tip:
- tool tag: 🟩 Codex / 🟦 Claude Code / 🟪 공통
- category: MCP, Hook, Slash Command, Subagent, Context, Eval, Workflow, Debugging, Review
- source link
- 💡 core idea
- 📝 concrete how-to, with fenced code block when useful
- 🎯 when to use it
- ⚠️ caveat
- ⭐ recommendation

If there is no new tip today, use a verified evergreen workflow from official docs or a previously unused source. Do not repeat the same tip URL within 7 days.

# 📌 지속 이슈 / 📅 내일 주목 / 🔗 보너스 링크
One short line each.
Mark Korean-language resources separately.

## Markdown / Hugo Rules

- PaperMod renders pure markdown.
- No inline CSS.
- No raw HTML unless unavoidable.
- Always wrap commands/config/code in fenced code blocks.
- Curly braces `{{ }}` outside code blocks can break Hugo. Avoid them.
- Wrap angle brackets in prose with backticks.
- Use normal markdown links.
- Do not overuse tables.

## History Save

Append every covered item to `.briefing/history.jsonl`.

Formats:

{"date":"YYYY-MM-DD","type":"paper","id":"{arXiv ID}","title":"...","topic":"..."}
{"date":"YYYY-MM-DD","type":"repo","url":"https://github.com/{owner}/{repo}","topic":"...","lang":"..."}
{"date":"YYYY-MM-DD","type":"model","source":"{URL}","topic":"...","vendor":"..."}
{"date":"YYYY-MM-DD","type":"tip","source":"{URL}","topic":"...","tool":"claude-code|codex|agnostic"}
{"date":"YYYY-MM-DD","type":"visual","path":"/images/ai-news-YYYY-MM-DD/file.svg","topic":"...","source":"generated|external URL"}

## Build Verify Then Publish

If Hugo exists, run:

`hugo --gc --minify`

Fix the post until it passes.

If Hugo is absent, try to install it. If install fails, manually check:
- front matter is valid
- markdown images point to existing files
- no stray `{{` outside code blocks
- no raw HTML/SVG in markdown
- all local assets exist under `static/images/ai-news-{YYYY-MM-DD}/`

Then commit and push according to PUSH RULES.

Post URL:
`https://jkpark83.github.io/posts/ai-news-{YYYY-MM-DD}/`

Category URL:
`https://jkpark83.github.io/categories/ai-뉴스/`
