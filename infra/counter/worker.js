/**
 * JKPark 블로그 — 방문자/조회수 카운터 (Cloudflare Worker + KV)
 *
 *  · 오늘 방문자(고유)  : 방문자 ID(vid)를 날짜별로 1회만 집계 (KST 기준, 자정 리셋)
 *  · 전체 방문자(고유)  : vid를 영구히 1회만 집계
 *  · 글별 조회수(PV)    : 페이지를 열 때마다 +1 (path 단위)
 *
 *  엔드포인트
 *   GET /hit?path=<경로>&vid=<방문자ID>   → 집계 후 최신 수치 반환(프런트가 호출)
 *   GET /stats?path=<경로>                → 집계 없이 수치만 조회(디버그/임베드용)
 *
 *  KV 키 구조
 *   views:<path>            글별 누적 조회수
 *   today:<YYYY-MM-DD>      그 날의 고유 방문자 수
 *   total:uv               전체 누적 고유 방문자 수
 *   seen:<date>:<vid>      그 날 이미 집계한 방문자(36h TTL) — 오늘 중복 방지
 *   ever:<vid>             전체에서 이미 집계한 방문자(영구) — 전체 중복 방지
 */

// 집계를 허용할 출처(블로그 도메인). 다른 사이트에서의 호출은 CORS로 차단됨.
const ALLOW_ORIGIN = "https://jkpark83.github.io";

// KST(UTC+9) 기준 오늘 날짜 문자열(YYYY-MM-DD). 자정 리셋 기준을 한국 시간으로 맞춤.
function kstDate(nowMs) {
  const d = new Date(nowMs + 9 * 3600 * 1000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function getNum(kv, key) {
  const v = await kv.get(key);
  const n = v ? parseInt(v, 10) : 0;
  return Number.isFinite(n) ? n : 0;
}

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": ALLOW_ORIGIN,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store",
    };

    // 프리플라이트
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const kv = env.COUNTER; // wrangler.toml 의 KV 바인딩 이름
    if (!kv) {
      return Response.json({ error: "KV not bound" }, { status: 500, headers: cors });
    }

    const url = new URL(request.url);
    const today = kstDate(Date.now());

    // 입력 정규화 — path/vid 길이를 제한해 KV 키 오남용 방지
    let path = (url.searchParams.get("path") || "/").split("#")[0].split("?")[0];
    if (!path.startsWith("/")) path = "/" + path;
    if (path.length > 300) path = path.slice(0, 300);
    const vid = (url.searchParams.get("vid") || "").slice(0, 64) || "anon";

    // ── 집계 없이 조회만 ──
    if (url.pathname === "/stats") {
      const [views, todayVisitors, totalVisitors] = await Promise.all([
        getNum(kv, `views:${path}`),
        getNum(kv, `today:${today}`),
        getNum(kv, "total:uv"),
      ]);
      return Response.json({ path, views, todayVisitors, totalVisitors, date: today }, { headers: cors });
    }

    // ── 집계 + 반환 ──
    if (url.pathname === "/hit") {
      // 1) 글별 조회수: 열 때마다 +1 (PV)
      const viewsKey = `views:${path}`;
      const views = (await getNum(kv, viewsKey)) + 1;
      await kv.put(viewsKey, String(views));

      // 2) 오늘 고유 방문자: vid가 오늘 처음일 때만 +1
      let todayVisitors = await getNum(kv, `today:${today}`);
      const seenKey = `seen:${today}:${vid}`;
      if (vid !== "anon" && !(await kv.get(seenKey))) {
        todayVisitors += 1;
        await kv.put(`today:${today}`, String(todayVisitors));
        // 36시간 후 만료 — 날짜가 바뀌면 다시 신규로 집계됨
        await kv.put(seenKey, "1", { expirationTtl: 60 * 60 * 36 });
      }

      // 3) 전체 고유 방문자: vid가 사상 처음일 때만 +1
      let totalVisitors = await getNum(kv, "total:uv");
      const everKey = `ever:${vid}`;
      if (vid !== "anon" && !(await kv.get(everKey))) {
        totalVisitors += 1;
        await kv.put("total:uv", String(totalVisitors));
        await kv.put(everKey, "1");
      }

      return Response.json({ path, views, todayVisitors, totalVisitors, date: today }, { headers: cors });
    }

    // 그 외 경로
    return Response.json({ ok: true, service: "blog-counter" }, { headers: cors });
  },
};
