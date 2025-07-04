/*  banner.js – 2025-07-04  */
(function () {
  /* 중복 삽입 방지 */
  if (window.__GLOBAL_TOP_BANNER__) return;
  window.__GLOBAL_TOP_BANNER__ = true;

  const HEIGHT = 50;                      /* px */
  const DEFAULT_TEXT =
    "🚀 We just shipped v3.0 – check the release notes";

  /* (1) 메시지 우선순위: data-msg ▶ ?msg= ▶ 기본값 */
  const sc = document.currentScript ||
             document.getElementsByTagName("script")[document.getElementsByTagName("script").length - 1];
  const msg = (sc && sc.getAttribute("data-msg")) ||
              new URLSearchParams(location.search).get("msg") ||
              DEFAULT_TEXT;

  /* (2) 배너 스타일 시트 삽입 */
  const style = document.createElement("style");
  style.textContent = `
    #global-top-banner{
      width:100%;height:${HEIGHT}px;
      display:flex;align-items:center;justify-content:center;
      background:#f44336;color:#fff;
      font-weight:600;font-size:16px;
      box-shadow:0 2px 4px rgba(0,0,0,.08);
    }`;
  document.head.appendChild(style);

  /* (3) 배너 DOM 생성 후 본문 맨 앞에 위치 */
  const banner = document.createElement("div");
  banner.id = "global-top-banner";
  banner.setAttribute("role", "banner");
  banner.textContent = msg;
  document.body.insertBefore(banner, document.body.firstChild);
})();
