# 블로그 방문자/조회수 카운터 (Cloudflare Workers + KV)

정적 사이트(GitHub Pages)에는 서버가 없어, 방문자·조회수는 **무료 Cloudflare Worker + KV**로 집계합니다.
이 폴더는 **Hugo 빌드와 무관**합니다(사이트로 배포되지 않음). 카운터 백엔드 소스일 뿐입니다.

집계 항목
- **오늘 방문자(고유)** — 방문자별로 하루 1회 (KST 자정 리셋)
- **전체 방문자(고유)** — 방문자별로 영구 1회
- **글별 조회수(PV)** — 글을 열 때마다 +1

---

## 한 번만 하면 되는 배포 (약 5분)

> 사전: Cloudflare 무료 계정. `node`/`npm` 설치돼 있으면 됩니다(별도 글로벌 설치 불필요 — `npx` 사용).

```bash
cd infra/counter

# 1) Cloudflare 로그인 (브라우저가 열립니다)
npx wrangler login

# 2) KV 네임스페이스 생성 → 출력된 id 복사
npx wrangler kv namespace create COUNTER
#   => 예: id = "abc123def456..."  형태로 출력됨

# 3) wrangler.toml 의 id = "<여기에_KV_NAMESPACE_ID>" 를 위 id 로 교체

# 4) 배포
npx wrangler deploy
#   => 배포 URL 출력: https://jkpark-blog-counter.<당신의서브도메인>.workers.dev
```

## 사이트에 연결

배포 URL을 **`hugo.toml` 의 `[params].counterAPI`** 값으로 넣고 푸시하면 끝입니다.

```toml
[params]
  counterAPI = "https://jkpark-blog-counter.<당신의서브도메인>.workers.dev"
```

`counterAPI` 가 비어 있으면 프런트 스크립트는 아무 동작도 하지 않습니다(안전). 값을 채우면 그때부터
홈 헤더에 "오늘 방문자 / 전체", 각 글 상단 메타에 "조회수"가 표시됩니다.

---

## 동작 방식 (요약)

- 방문자 ID(`blog_vid`)는 브라우저 `localStorage`에 저장되는 **무작위 1차 식별자**입니다.
  개인정보·쿠키·크로스사이트 추적이 없습니다. JS를 실행하지 않는 대부분의 봇은 집계되지 않습니다.
- 프런트는 페이지 로드 시 `GET /hit?path=<경로>&vid=<id>` 를 호출하고, 응답의
  `todayVisitors / totalVisitors / views` 를 화면에 채웁니다.
- CORS는 `worker.js` 의 `ALLOW_ORIGIN`(현재 `https://jkpark83.github.io`)만 허용합니다.
  도메인을 바꾸면 이 값도 함께 바꾸세요.

## 무료 한도 참고

Cloudflare KV 무료 티어: 읽기 10만/일, **쓰기 1,000/일**, 저장 1GB.
조회수는 페이지 열람마다 쓰기 1회를 사용합니다. 개인 블로그 규모에선 충분하지만,
하루 쓰기가 1,000을 넘길 만큼 트래픽이 커지면 Workers 유료($5/월)로 한도를 올리거나
원자적 집계가 필요하면 D1/Durable Objects로 이전하면 됩니다.

## 수치 직접 확인 / 초기화

```bash
# 특정 글 조회수, 오늘/전체 방문자 조회(집계 없이)
curl "https://<배포URL>/stats?path=/posts/내글경로/"

# 값 수동 확인·수정 (예: 오늘 방문자 키)
npx wrangler kv key get --binding COUNTER "today:2026-06-24"
npx wrangler kv key put --binding COUNTER "views:/posts/내글경로/" "0"
```
