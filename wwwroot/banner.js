/*  banner.js – 2025-07-04  */
(function () {
  /* 중복 삽입 방지 */
  if (window.__GLOBAL_TOP_BANNER__) return;
  window.__GLOBAL_TOP_BANNER__ = true;

  const HEIGHT = 50;            /* px ― 고정 높이 50 */
  const DEFAULT_TEXT =
    "🚀 We just shipped v3.0 – check the release notes";

  /* 메시지 우선순위: ① <script data-msg> ② ?msg= 파라미터 ③ 기본값 */
  const sc = document.currentScript ||
             document.getElementsByTagName("script")[document.getElementsByTagName("script").length - 1];
  const msg = (sc && sc.getAttribute("data-msg")) ||
              new URLSearchParams(location.search).get("msg") ||
              DEFAULT_TEXT;

  /* ① 레이아웃을 밀어낼 spacer 삽입 */
  const spacer = document.createElement("div");
  spacer.style.height = HEIGHT + "px";
  document.documentElement.insertBefore(spacer, document.body);

  /* ② 스타일 인라인 삽입 → 외부 CSS 불필요 */
  const css = `
    #global-top-banner{
      position:fixed;top:0;left:0;right:0;
      height:${HEIGHT}px;z-index:1000;
      display:flex;align-items:center;justify-content:center;
      background:#f44336;color:#fff;
      font-weight:600;font-size:16px;
      box-shadow:0 2px 4px rgba(0,0,0,.08);
    }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  /* ③ 배너 DOM 생성 */
  const banner = document.createElement("div");
  banner.id = "global-top-banner";
  banner.setAttribute("role", "banner");
  banner.textContent = msg;
  document.body.appendChild(banner);
})();
