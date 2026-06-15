---
title: "Loop 엔지니어링: 프롬프트를 넘어, 루프를 짜는 시대"
date: 2026-06-15T20:00:00+09:00
draft: false
tags: ["AI", "에이전트", "Loop Engineering", "Claude Code", "프롬프트 엔지니어링"]
categories: ["AI 엔지니어링"]
summary: "프롬프트 → 컨텍스트 → 하네스 → 루프. 2026년 AI 엔지니어링의 무게중심이 또 한 번 이동했습니다. Claude Code를 만든 Boris Cherny가 '나는 더 이상 프롬프트하지 않는다'고 말한 그 'Loop 엔지니어링'을 정리합니다."
---

> "나는 더 이상 Claude에게 프롬프트하지 않는다. 루프들이 돌아가면서 Claude에게 프롬프트를 넣고 무엇을 할지 판단한다. **내 일은 루프를 짜는 것이다.**"
>
> — Boris Cherny, Anthropic Claude Code 총괄

얼마 전 Claude Code를 만든 Boris Cherny가 팟캐스트에서 한 이 말이 화제가 됐습니다. 프롬프트 엔지니어링, 컨텍스트 엔지니어링, 하네스 엔지니어링까지는 익숙했는데 — 그 위에 **"Loop 엔지니어링(Loop Engineering)"** 이라는 새로운 층이 등장한 것입니다.

이 글에서는 다음 다섯 가지를 정리합니다.

1. Loop 엔지니어링이란 무엇인가
2. 기존의 프롬프트 / 컨텍스트 / 하네스 엔지니어링과 어떻게 다른가
3. 어떻게 배워야 하는가
4. 구체적인 예시
5. 기존 프로덕트에 어떻게 적용하는가

---

## 0. 먼저, 이 용어는 누가 만들었나

블로그로 정리하기 전에 계보부터 짚고 갑니다. 출처가 정확해야 신뢰가 가니까요.

- **Boris Cherny** (Anthropic Claude Code 총괄) — [Lenny's Podcast(2026년 2월)](https://www.lennysnewsletter.com/p/head-of-claude-code-what-happens)와 [Every 팟캐스트](https://www.theneuron.ai/explainer-articles/claude-code-creators-boris-cherny-and-cat-wu-explain-how-to-use-agent-loops/)에서 "나는 루프를 짠다"는 실천을 보여줬습니다.
- **Peter Steinberger** (OpenClaw 제작자) — [2026년 6월 8일 X 게시물](https://x.com/steipete/status/2063697162748260627)(650만 조회)에서 한 문장으로 정식화했습니다. *"You shouldn't be prompting coding agents anymore. You should be designing loops that prompt your agents."*
- **Addy Osmani** (Google Chrome 엔지니어링 리더) — [2026년 6월 "Loop Engineering"](https://addyosmani.com/blog/loop-engineering/) 글로 위 두 발언을 묶어 **하나의 분과(discipline)로 명명**했습니다.

정리하면 **Cherny가 실천을 보여줬고 → Steinberger가 슬로건으로 만들었고 → Osmani가 이름을 붙였습니다.** 용어 자체는 2026년 6월에 굳어졌지만, 기술적 뿌리는 훨씬 오래됐습니다(뒤에서 다룹니다).

---

## 1. Loop 엔지니어링이란 무엇인가

한 문장으로:

> **에이전트에게 매번 사람이 손으로 프롬프트를 치는 대신, "무엇을·언제 프롬프트할지, 그리고 그 결과가 합격인지"를 스스로 판단하는 자율 시스템을 설계하는 일.**

프롬프트 엔지니어링이 *손에 쥔 도구*로 에이전트를 다루는 거라면, 루프 엔지니어링은 에이전트를 **메모리·스케줄링·평가·오케스트레이션을 갖춘 장기 실행 프로세스**로 다룹니다. 당신은 더 이상 "프롬프트를 넣는 사람"이 아니라, **"프롬프트를 넣어주는 시스템을 설계하는 사람"**이 됩니다.

### 루프의 해부학

프로덕션에서 돌아가는 루프는 보통 이런 골격을 가집니다.

```
TRIGGER → SCOPE → ACTION → BUDGET → STOP → REPORT
```

| 단계 | 의미 | 예시 |
|------|------|------|
| **TRIGGER** | 언제 도나? | 15분마다 / PR 코멘트 시 / CI 실패 시 |
| **SCOPE** | 범위는? | 내 오픈 PR만, repo X만 |
| **ACTION** | 무엇을 하나? | 테스트 실행, 린트 수정, 리뷰 대응 |
| **BUDGET** | 자원 한도 | 서브에이전트 3개, 5만 토큰, $5 |
| **STOP** | 언제 멈추나? | 전부 green / 10회 반복 / 예산 초과 |
| **REPORT** | 피드백 어디로? | Slack 채널, 커밋 메시지, 로그 파일 |

### 핵심 작동 패턴: Discover → Act → Verify → Remember

좋은 루프는 다음 네 단계를 끝없이 돕니다.

1. **Discover (발견)** — 현재 상태를 읽는다 (실패한 테스트, 리뷰 코멘트, git 상태)
2. **Act (행동)** — 발견한 것에 근거해 변경한다
3. **Verify (검증)** — 테스트·린트·리뷰 게이트로 통과 여부를 확인한다
4. **Remember (기억)** — 진행 상태를 대화창이 아니라 **디스크/git에 영속화**한다 → 다음 실행이 이어받는다

여기서 가장 중요한 구분이 **닫힌 루프(closed loop)와 열린 루프(open loop)**입니다.

- **열린 루프**: 에이전트가 "다 됐어요"라고 말할 때까지 코드만 씁니다. 피드백이 없으니 믿을 수 없습니다.
- **닫힌 루프**: 쓰기 → 테스트 실행 → 결과 읽기 → 자기 교정 → 반복. 검증이 루프 안에 들어가 있습니다.

> Addy Osmani의 표현을 빌리면, **"밀어내 주는 게 없는 루프는 에이전트가 자기 자신과 합의를 반복하는 것일 뿐"**입니다. 검증 게이트가 없으면 루프는 그저 똑같은 착각을 반복합니다.

---

## 2. 프롬프트 / 컨텍스트 / 하네스 / 루프 — 4개 층의 차이

이 네 가지는 **서로 경쟁하는 게 아니라 중첩(nested)** 됩니다. 안쪽 층을 바깥 층이 감쌉니다.

```
┌──────────────────────────────────────────────────────┐
│  LOOP 엔지니어링  — 여러 에이전트/실행을 시간 위에서 오케스트레이션      │
│  ┌────────────────────────────────────────────────┐  │
│  │  HARNESS 엔지니어링 — 에이전트 1개의 환경(도구·메모리·권한)    │  │
│  │  ┌──────────────────────────────────────────┐  │  │
│  │  │  CONTEXT 엔지니어링 — 컨텍스트 창에 무엇을 넣나       │  │  │
│  │  │  ┌────────────────────────────────────┐  │  │  │
│  │  │  │  PROMPT 엔지니어링 — 문장 하나의 표현        │  │  │  │
│  │  │  └────────────────────────────────────┘  │  │  │
│  │  └──────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

| 분과 | 작동 계층 | 핵심 질문 | 등장 시기 |
|------|-----------|-----------|-----------|
| **Prompt** | 메시지 (한 턴) | "무엇을 물을까?" | 2022–24 |
| **Context** | 세션 | "모델에게 무엇을 보여줄까?" | 2025 |
| **Harness** | 시스템 (에이전트 1개) | "이 에이전트가 어떻게 작동하나?" | 2025–26 |
| **Loop** | 시간 / 오케스트레이션 | "누가·언제 프롬프트하고, 합격 판정은?" | 2026 |

각 층을 한 줄로 구분하면:

- **Prompt vs Context** — 프롬프트는 *문장 하나의 표현*, 컨텍스트는 *창 안에 들어갈 전체 정보의 구성*입니다. Andrej Karpathy의 정의가 유명합니다. *"다음 단계에 딱 맞는 정보로 컨텍스트 창을 채우는 섬세한 예술이자 과학."*
- **Context vs Harness** — 컨텍스트는 *모델이 보는 것*, 하네스는 *모델을 뺀 나머지 전부*입니다. Martin Fowler의 공식이 깔끔합니다. **`Agent = Model + Harness`** — 여기서 하네스는 도구, 메모리, 권한, 재시도, 샌드박스, 로깅, 평가 훅을 모두 포함합니다.
- **Harness vs Loop** — 하네스가 *에이전트 한 개가 도는 환경*이라면, 루프는 그 **한 단계 위**입니다. 여러 에이전트·여러 실행을 시간 축에서 발견하고 검증하고 재개하도록 오케스트레이션합니다.

각 층은 **실패하는 방식**도 다릅니다.

| 층 | 대표 실패 모드 |
|----|----------------|
| Prompt | 잘못 쓴 지시문 |
| Context | 틀렸거나 낡은 정보를 가져옴 |
| Harness | 도구·데이터 레이어 장애 (스키마 드리프트 등) |
| Loop | 무한 루프, 폭주 비용, 검증 부재로 인한 '자기 합의' |

> **알아두면 좋은 뉘앙스**: Anthropic은 이미 컨텍스트 엔지니어링이 "프롬프트 엔지니어링의 자연스러운 후계자"라고 [공식화](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)했습니다. *"루프 안에서 도는 에이전트는 다음 추론에 쓸 데이터를 점점 더 많이 생성하고, 이 정보는 주기적으로 정제돼야 한다."* 즉 **루프 엔지니어링은 컨텍스트 엔지니어링이 "루프가 길어지면서" 자연스럽게 도달하는 귀결**입니다. 새로운 마법이 아니라, 같은 흐름의 다음 장입니다.

---

## 3. 어떻게 배워야 하는가

루프 엔지니어링은 *이름*은 새롭지만 *기반 기술*은 탄탄한 계보가 있습니다. 아래 순서를 추천합니다.

### 1단계 — 에이전트 루프의 1차 원리 (필독)

- **Anthropic, [Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)**
  에이전트의 정의가 명쾌합니다. **"LLMs using tools in a loop"** (루프 안에서 도구를 쓰는 LLM). 정해진 코드 경로를 따르는 *workflow*와, 모델이 스스로 흐름을 지휘하는 *agent*의 구분을 꼭 이해하세요. 핵심 조언: *"가장 정교한 시스템이 아니라 **맞는** 시스템을 지어라."*
- **Anthropic, [Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)**
  compaction(압축), 외부 메모리(structured note-taking), just-in-time 검색, 서브에이전트 아키텍처 — 긴 루프를 견디게 하는 기법들이 정리돼 있습니다.

### 2단계 — 신뢰성의 교과서: 12-Factor Agents

**Dex Horthy(HumanLayer)**가 Heroku의 12-Factor App을 본떠 만든 [12개 원칙](https://github.com/humanlayer/12-factor-agents)입니다. 루프 엔지니어링과 직결되는 항목만 추리면:

- **Factor 3. Own your context window** — 컨텍스트 구성을 직접 통제하라
- **Factor 6. Launch/Pause/Resume with simple APIs** — 멈추고 이어받을 수 있게 하라 (루프의 재개성)
- **Factor 7. Contact humans with tool calls** — 사람을 부르는 것도 하나의 툴콜로
- **Factor 8. Own your control flow** — 프레임워크 오케스트레이션에 맡기지 말고 흐름을 직접 제어하라 *(루프 엔지니어링의 정수)*
- **Factor 9. Compact errors into context window** — 실패를 요약해 다음 단계로 넘겨라
- **Factor 10. Small, focused agents** — 범용 거대 에이전트보다 좁은 책임의 작은 에이전트

> 이 자료의 핵심 통찰: **"성공한 AI 프로덕트 대부분은 '프롬프트+도구' 에이전트가 아니라, 결정론적 코드에 LLM 단계를 딱 맞는 지점에만 뿌린 것"**입니다. 무작정 자율성을 높이는 게 정답이 아닙니다.

### 3단계 — 직접 만들어 보기

- **Geoffrey Huntley, [Ralph Wiggum as a software engineer](https://ghuntley.com/ralph/)** (2025년 7월)
  가장 단순한 루프의 원형입니다. 철학(매 반복마다 컨텍스트를 리셋하고, 진행은 디스크에 남긴다)이 핵심이니 꼭 읽어보세요.
- **Thorsten Ball, "How to build an agent"** — 코딩 에이전트를 수백 줄로 직접 구현하는 글.
- **DeepLearning.AI / Hugging Face Agents Course** — 체계적인 입문 강의.

### 4단계 — 따라갈 사람·매체

- **인물**: Boris Cherny, Cat Wu(Claude Code), Dex Horthy, Geoffrey Huntley, Peter Steinberger, Andrej Karpathy
- **매체**: Addy Osmani 블로그, Pragmatic Engineer, Lenny's Newsletter, Latent Space, Simon Willison

### 루프를 "연습"하는 법

프롬프트 엔지니어링은 문장을 고치며 연습하지만, 루프 엔지니어링은 **닫힌 루프를 하나 돌려보고 → STOP 조건과 검증 게이트를 손보면서** 연습합니다. 가장 빠른 시작(15분)은 PR 하나를 자동으로 돌보게 하는 것입니다. "행동하기 전에 상태를 먼저 읽는지"를 두 사이클만 지켜봐도 감이 옵니다.

---

## 4. 구체적인 예시

### (A) Ralph Loop — 가장 순수한 형태

루프의 원형은 충격적으로 단순합니다.

```bash
while :; do cat PROMPT.md | claude-code ; done
```

`PROMPT.md`에는 "할 일 목록에서 다음 미완 항목 **하나만** 구현 → 테스트 → 통과 시 커밋·완료 표시 → 한 항목 후 종료"처럼 *한 단위 작업*만 지시합니다. 매 반복마다 컨텍스트가 리셋되고 진행은 파일에 남기 때문에, **컨텍스트 폭증 없이 며칠씩** 돌 수 있습니다. Geoffrey Huntley는 이 루프로 프로그래밍 언어 하나를 통째로 만들었는데, $50,000짜리 작업을 **$297의 API 비용**으로 끝냈습니다.

(다만 Ralph는 가드레일이 약해서 "혁신적이지만 중요한 일엔 안 쓴다"는 반론도 있습니다. 아래 가드레일 버전이 더 실용적입니다.)

### (B) 가드레일이 있는 루프 (프로덕션 버전)

```bash
#!/bin/bash
MAX_ITERATIONS=10
ITER=0

while [ $ITER -lt $MAX_ITERATIONS ]; do
  cat PROMPT.md | claude -p --dangerously-skip-permissions

  grep -q "BLOCKED" specs/TODO.md && break    # 막히면 중단
  grep -q "\[ \]" specs/TODO.md || break        # 전부 완료면 중단

  sleep 10
  ITER=$((ITER + 1))
done
```

세 가지 가드레일이 들어갑니다 — **최대 반복 수 + 무진전 감지 + 종료 조건**.

### (C) 닫힌 루프 vs 열린 루프

검증이 들어가느냐 마느냐의 차이를 코드로 보면 분명합니다.

```bash
# ❌ 나쁨: 검증 없음 — 그냥 코드만 씀
while true; do
  claude < prompt.md > code.js
  sleep 300
done

# ✅ 좋음: 테스트 결과를 다음 프롬프트로 되먹임
while true; do
  claude < prompt.md > code.js
  if npm test; then
    git commit -am "auto: tests passing"
  else
    npm test 2>&1 >> prompt.md   # 실패 로그를 컨텍스트에 주입
  fi
  sleep 300
done
```

두 번째 루프는 테스트 결과를 읽고 다음 프롬프트에 실패 내용을 덧붙입니다. 이게 바로 **피드백이 있는 닫힌 루프**입니다.

### (D) Claude Code의 `/loop` — Boris Cherny가 공개한 실제 사용

| 명령 | 동작 |
|------|------|
| `/loop 5m /babysit` | 5분마다 코드리뷰 자동 대응·리베이스 |
| `/loop 30m /slack-feedback` | Slack 피드백을 30분 주기로 PR로 만듦 |
| `/loop check the deploy` | 인터벌 생략 → 배포 상태를 보고 Claude가 1분~1시간을 알아서 선택 |

### (E) Claude Code 자체가 루프 엔지니어링의 교과서

Cherny와 Cat Wu가 밝힌 내부 설계 원칙은 그 자체로 좋은 학습 자료입니다.

- **컨텍스트 미니멀리즘** — *"모델에 필요한 것만 주고, 경로는 스스로 고르게 하라."* 최소 시스템 프롬프트, 최소 도구.
- **반복 실수는 코드로 박제** — Claude가 같은 실수를 반복하면, 그 교훈을 `CLAUDE.md`나 skill에 적어 미래 실행을 개선합니다. (= 외부 메모리)
- **검증 = "에이전트가 그걸 진짜 실행할 수 있나?"** — 단위테스트·린트를 넘어, Bash·시뮬레이터·컴퓨터 조작으로 바뀐 소프트웨어를 *실제로* 써보고 증거를 제출해야 "완료"로 인정합니다.
- **The Bitter Lesson** — *"항상 범용 모델에 베팅하라. 작은 모델·파인튜닝은 쓰지 마라. 스캐폴딩은 잘해야 10~20% 개선인데, 다음 모델이 나오면 그 이득은 보통 사라진다."* → **루프는 가볍게, 모델은 자유롭게.**

---

## 5. 기존 프로덕트에 어떻게 적용하는가

### 점진적으로 자율성을 높이는 4단계

1. **Workflow부터** — 먼저 결정론적 코드 경로로 시작합니다. (12-Factor의 교훈: 좋은 "에이전트"는 사실 결정론적 코드 + 핵심 지점의 LLM 호출인 경우가 많습니다.)
2. **닫힌 루프로 승격** — 한 작업에 검증 게이트(테스트/타입체크/리뷰)를 붙여 자기 교정 루프로 만듭니다.
3. **격리·병렬화** — git worktree나 서브에이전트로 충돌 없이 여러 작업을 동시에 돌립니다.
4. **오케스트레이션** — 여러 루프를 발견·예산·보고로 묶고, 사람은 체크포인트만 담당합니다.

### 바로 쓸 수 있는 루프 패턴

- **PR 유지보수 루프** (10분 주기, $0.50, 최대 10회) — 오픈 PR의 CI 실패 자동 수정, 리뷰 코멘트 대응, green이면 머지, 3회 막히면 봇 채널에 보고 후 종료
- **의존성 업데이트 루프** (1시간, $2, 5회) — 낡은 패키지 스캔 → PR 생성 → 테스트 → 저위험은 자동 머지, 실패는 사람에게
- **이슈 triage 루프** (30분, $1) — 라벨 분류, 재현 단계 생성, 요약 코멘트 작성
- **빌드 워처** (5분, $0.25) — CI 폴링 → 실패 진단·수정 PR → green이면 "배포 준비" 알림

### Human-in-the-loop 체크포인트는 어디에?

- **메인 브랜치 머지 직전** — 최종 사람 눈. (Cherny: *"나는 사람 눈을 체크포인트로 두고 싶다."*)
- **막힘(BLOCKED) 시** — 같은 에러를 N회 반복하면 사람을 호출 (12-Factor #7)
- **예산 초과 시** — 중단하고 보고

### 프로덕션의 함정과 대응

| 함정 | 대응 |
|------|------|
| 무한 루프 / 폭주 비용 | 최대 반복 수 + 토큰·달러 상한 |
| 무진전 반복 | 같은 에러 3회·빈 diff 2회 → BLOCKED 후 종료 |
| 컨텍스트 폭증 | 대화 히스토리 대신 로그/디스크에 기록, compaction, 앵커 파일로 매 반복 리셋 |
| 자가 채점 | maker와 *다른 지시*를 받는 검증 서브에이전트를 분리 |
| 상태 손상 | 엄격한 타입(TS/Python), 매 반복 시작 시 입력 상태 검증 |

> **비용 관점의 재프레이밍** — Cherny는 AI 비용을 "예전 도구 비용"이 아니라 **"사람 엔지니어의 시간"**과 비교하라고 말합니다. 비용의 무게중심이 *코드 작성*(이제 거의 공짜)에서 **루프 운영·관리**로 옮겨갔기 때문입니다.

---

## 6. 마지막으로 — 도구는 있다, 빠진 건 시도뿐

루프 엔지니어링이 만능은 아닙니다. Addy Osmani 본인이 강조한 **세 가지 인간의 책임**을 잊지 말아야 합니다.

- **검증 부담은 여전히 당신 것** — 방치된 루프는 방치된 실수를 만듭니다.
- **이해 부채(comprehension debt)** — 빨리 출하할수록, 안 읽으면 지식 공백이 커집니다.
- **인지 항복(cognitive surrender)** — 편한 자동화가 판단을 *증강*이 아니라 *대체*해버릴 위험.

Osmani의 마무리 문장이 이 모든 걸 압축합니다.

> **"루프를 지어라. 단, '시작 버튼만 누르는 사람'이 아니라 '계속 엔지니어로 남을 사람'처럼 지어라."**

2026년, AI 엔지니어링의 무게중심은 프롬프트(문장)에서 컨텍스트(창)로, 다시 하네스(환경)를 지나 이제 **루프(시간 위의 오케스트레이션)**로 이동했습니다. 핵심은 모델을 더 똑똑하게 만드는 게 아니라, **모델을 신뢰 가능한 장기 실행 프로세스로 감싸는 시스템을 설계하는 것**입니다.

가장 짧은 시작은 이 한 줄입니다.

```
/loop 10m [당신의 목표]. 끝날 때까지 계속하되, 10회 시도 후엔 멈춰.
```

도구는 이미 있습니다. 이제 남은 장벽은, 한 번 돌려보는 것뿐입니다.

---

### 참고 자료

- [Addy Osmani — Loop Engineering](https://addyosmani.com/blog/loop-engineering/) (개념 명명)
- [Peter Steinberger — X 원문](https://x.com/steipete/status/2063697162748260627)
- [Lenny's Newsletter — Boris Cherny 인터뷰](https://www.lennysnewsletter.com/p/head-of-claude-code-what-happens)
- [The Neuron — Cherny & Wu on Agent Loops](https://www.theneuron.ai/explainer-articles/claude-code-creators-boris-cherny-and-cat-wu-explain-how-to-use-agent-loops/)
- [Anthropic — Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Anthropic — Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [12-Factor Agents (Dex Horthy / HumanLayer)](https://github.com/humanlayer/12-factor-agents)
- [Geoffrey Huntley — Ralph Wiggum as a software engineer](https://ghuntley.com/ralph/)
- [explainx — Loop Engineering 실무 가이드](https://explainx.ai/blog/loop-engineering-coding-agents-claude-code-guide-2026)
