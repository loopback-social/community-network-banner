/* banner.js – 2025-07-04 */
(function () {
  /* 중복 삽입 방지 */
  if (window.__GLOBAL_TOP_BANNER__) return;
  window.__GLOBAL_TOP_BANNER__ = true;

  /* ───────────── 설정 ───────────── */
  const HEIGHT = 50;                    // px
  const TITLE  = "커뮤니티 네트워크";
  const BTN_TX = "사이트 목록";

  /* 커뮤니티 목록 (순서 무관) */
  const communities = [
    { name: "닷넷데브", url: "https://forum.dotnetdev.kr/" },
    { name: "슬로그램", url: "https://forum.slogs.dev/"   },
    { name: "CloudBro", url: "https://www.cloudbro.ai/"    }
  ];
  communities.sort((a, b) =>
    a.name.localeCompare(b.name, "ko", { sensitivity: "base" })
  );

  /* ───────────── 웹폰트 주입 ───────────── */
  const fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.href =
    "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap";
  document.head.appendChild(fontLink);

  /* ───────────── 스타일 시트 삽입 ───────────── */
  const style = document.createElement("style");
  style.textContent = `
    #global-top-banner{
      width:100%;height:${HEIGHT}px;
      background:#000;color:#fff;padding:0 1rem;
      display:flex;align-items:center;gap:1rem;
      font:500 16px/1 'Noto Sans KR', sans-serif;
      box-shadow:0 2px 4px rgba(0,0,0,.2);
      position:relative;z-index:999;
    }
    #global-top-banner .title{letter-spacing:.02em;}
    #global-top-banner .dropdown{position:relative;}
    #global-top-banner button.dropdown-toggle{
      background:none;border:none;color:inherit;cursor:pointer;
      display:flex;align-items:center;gap:.25rem;font:inherit;
    }
    #global-top-banner button.dropdown-toggle:focus{
      outline:2px solid #555;outline-offset:2px;
    }
    #global-top-banner .arrow{transition:transform .2s ease;}
    #global-top-banner .menu{
      position:absolute;top:100%;left:0;min-width:180px;
      background:#fff;color:#000;border-radius:4px;margin-top:4px;
      box-shadow:0 4px 12px rgba(0,0,0,.15);list-style:none;
      padding:.5rem 0;display:none;
    }
    #global-top-banner .menu.open{display:block;}
    #global-top-banner .menu a{
      display:block;padding:.5rem 1rem;color:#000;text-decoration:none;
      font-weight:500;
    }
    #global-top-banner .menu a:hover{background:#f2f2f2;}
  `;
  document.head.appendChild(style);

  /* ───────────── DOM 구성 ───────────── */
  const banner    = document.createElement("div");
  banner.id       = "global-top-banner";

  const dropdown  = document.createElement("div");
  dropdown.className = "dropdown";

  const toggleBtn = document.createElement("button");
  toggleBtn.className = "dropdown-toggle";
  toggleBtn.setAttribute("aria-haspopup", "true");
  toggleBtn.setAttribute("aria-expanded", "false");
  toggleBtn.innerHTML = `${BTN_TX} <span class="arrow">▼</span>`;

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

  dropdown.append(toggleBtn, menu);

  const titleEl = document.createElement("span");
  titleEl.className = "title";
  titleEl.textContent = TITLE;

  banner.append(dropdown, titleEl);
  document.body.insertBefore(banner, document.body.firstChild);

  /* ───────────── 인터랙션 ───────────── */
  toggleBtn.addEventListener("click", () => {
    const opened = menu.classList.toggle("open");
    toggleBtn.setAttribute("aria-expanded", opened);
    toggleBtn.querySelector(".arrow").style.transform =
      opened ? "rotate(180deg)" : "rotate(0deg)";
  });

  document.addEventListener("click", e => {
    if (!dropdown.contains(e.target)) {
      menu.classList.remove("open");
      toggleBtn.setAttribute("aria-expanded", "false");
      toggleBtn.querySelector(".arrow").style.transform = "rotate(0deg)";
    }
  });
})();
