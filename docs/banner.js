/*  banner.js – 2025-07-04  */
(function () {
  /* 배너가 이미 있으면 중복 삽입 금지 */
  if (window.__GLOBAL_TOP_BANNER__) return;
  window.__GLOBAL_TOP_BANNER__ = true;

  /* --- 설정 ------------------------------- */
  const HEIGHT        = 50;            // px
  const DEFAULT_TITLE = "커뮤니티 네트워크";
  const DEFAULT_BTN   = "사이트 목록";

  /* 커뮤니티 목록(순서 무관) */
  const communities = [
    { name: "닷넷데브",  url: "https://forum.dotnetdev.kr/" },
    { name: "슬로그램",  url: "https://forum.slogs.dev/"   },
    { name: "CloudBro",  url: "https://www.cloudbro.ai/"    }
  ];
  /* 이름 오름차순 자동 정렬 (한글·영문 모두 자연스럽게) */
  communities.sort((a, b) =>
    a.name.localeCompare(b.name, "ko", { sensitivity: "base" })
  );

  /* --- 스타일 삽입 ------------------------ */
  const style = document.createElement("style");
  style.textContent = `
    #global-top-banner{
      width:100%;height:${HEIGHT}px;
      display:flex;align-items:center;justify-content:space-between;
      background:#000;color:#fff;padding:0 1rem;
      font-family:system-ui,sans-serif;font-size:16px;font-weight:600;
      box-shadow:0 2px 4px rgba(0,0,0,.2);position:relative;
    }
    #global-top-banner .title{letter-spacing:.02em;}
    #global-top-banner button.dropdown-toggle{
      background:none;border:none;color:inherit;cursor:pointer;
      display:flex;align-items:center;gap:.25rem;font:inherit;
    }
    #global-top-banner button.dropdown-toggle:focus{
      outline:2px solid #666;outline-offset:2px;
    }
    #global-top-banner .arrow{transition:transform .2s ease;}
    #global-top-banner .menu{
      position:absolute;top:100%;right:0;min-width:180px;
      background:#fff;color:#000;border-radius:4px;margin-top:4px;
      box-shadow:0 4px 12px rgba(0,0,0,.15);list-style:none;
      padding:.5rem 0;display:none;z-index:999;
    }
    #global-top-banner .menu.open{display:block;}
    #global-top-banner .menu a{
      display:block;padding:.5rem 1rem;color:#000;text-decoration:none;
      font-weight:500;
    }
    #global-top-banner .menu a:hover{background:#f2f2f2;}
  `;
  document.head.appendChild(style);

  /* --- 배너 DOM --------------------------- */
  const banner = document.createElement("div");
  banner.id = "global-top-banner";

  /* 왼쪽 : 제목 */
  const titleEl = document.createElement("span");
  titleEl.className = "title";
  titleEl.textContent = DEFAULT_TITLE;

  /* 오른쪽 : 토글 버튼 */
  const toggle = document.createElement("button");
  toggle.className = "dropdown-toggle";
  toggle.setAttribute("aria-haspopup", "true");
  toggle.setAttribute("aria-expanded", "false");
  toggle.innerHTML = `${DEFAULT_BTN} <span class="arrow">▼</span>`;

  /* 드롭다운 메뉴 */
  const menu = document.createElement("ul");
  menu.className = "menu";
  communities.forEach(c => {
    const li = document.createElement("li");
    const a  = document.createElement("a");
    a.href   = c.url;
    a.target = "_blank";
    a.rel    = "noopener noreferrer";
    a.textContent = c.name;
    li.appendChild(a);
    menu.appendChild(li);
  });

  /* --- 인터랙션 --------------------------- */
  toggle.addEventListener("click", () => {
    const opened = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", opened);
    toggle.querySelector(".arrow").style.transform =
      opened ? "rotate(180deg)" : "rotate(0deg)";
  });

  document.addEventListener("click", e => {
    if (!banner.contains(e.target)) {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.querySelector(".arrow").style.transform = "rotate(0deg)";
    }
  });

  /* --- 배치 ------------------------------- */
  banner.append(titleEl, toggle, menu);
  document.body.insertBefore(banner, document.body.firstChild);
})();
