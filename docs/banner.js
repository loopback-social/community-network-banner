(function () {
  if (window.__GLOBAL_TOP_BANNER__) return;
  window.__GLOBAL_TOP_BANNER__ = true;

  const TITLE = "loopback.social";
  const TAGLINE = "Every loop counts.";

  const communities = [
    { name: "닷넷데브", url: "https://forum.dotnetdev.kr/" },
    { name: "슬로그램", url: "https://forum.slogs.dev/" }
  ].sort((a, b) =>
    a.name.localeCompare(b.name, "ko", { sensitivity: "base" })
  );

  const fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.href =
    "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400&display=swap";
  document.head.appendChild(fontLink);

  const style = document.createElement("style");
  style.textContent = `
    #global-top-banner {
      box-sizing: border-box; width: 100%;
      background: #000; color: #fff; padding: 0.5em 1rem;
      display: flex; align-items: center; gap: 1rem;
      font: 400 14px/1 'Noto Sans KR', sans-serif;
      box-shadow: 0 2px 4px rgba(0, 0, 0, .2);
      position: relative; z-index: 999;
    }
    #global-top-banner .title {
      letter-spacing: .02em;
    }
    #global-top-banner .dropdown {
      position: relative; font-weight: bold;
    }
    #global-top-banner button.dropdown-toggle {
      background: none; border: none; color: inherit; cursor: pointer;
      display: flex; align-items: center; gap: .25rem; font: inherit;
    }
    #global-top-banner button.dropdown-toggle:focus {
      outline: 2px solid #555; outline-offset: 2px;
    }
    #global-top-banner .arrow {
      transition: transform .2s ease;
      font-size: 0.5rem;
    }
    #global-top-menu {
      position: fixed; min-width: 180px;
      background: #fff; color: #000; border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,.15);
      padding: .5rem 0; list-style: none; margin: 0;
      display: none;
      z-index: 2147483647;
    }
    #global-top-menu.open {
      display: block;
    }
    #global-top-menu a {
      display: block; padding: .5rem 1rem;
      color: #000; text-decoration: none;
      font-weight: 400;
    }
    #global-top-menu a:hover {
      background: #f2f2f2;
    }
  `;
  document.head.appendChild(style);

  const banner = document.createElement("div");
  banner.id = "global-top-banner";

  const dropdown = document.createElement("div");
  dropdown.className = "dropdown";

  const toggleBtn = document.createElement("button");
  toggleBtn.className = "dropdown-toggle";
  toggleBtn.setAttribute("aria-haspopup", "true");
  toggleBtn.setAttribute("aria-expanded", "false");
  toggleBtn.innerHTML = `${TITLE} <span class="arrow">&#x25bc;</span>`;

  const menu = document.createElement("ul");
  menu.id = "global-top-menu";
  communities.forEach(c => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = c.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = c.name;
    li.appendChild(a);
    menu.appendChild(li);
  });

  dropdown.appendChild(toggleBtn);
  const titleEl = document.createElement("span");
  titleEl.className = "title";
  titleEl.textContent = TAGLINE;

  banner.append(dropdown, titleEl);
  document.body.insertBefore(banner, document.body.firstChild);
  document.body.appendChild(menu);

  const closeMenu = () => {
    menu.classList.remove("open");
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.querySelector(".arrow").style.transform = "rotate(0deg)";
  };

  toggleBtn.addEventListener("click", () => {
    const opened = menu.classList.toggle("open");
    toggleBtn.setAttribute("aria-expanded", opened);
    toggleBtn.querySelector(".arrow").style.transform =
      opened ? "rotate(-180deg)" : "rotate(0deg)";
    if (opened) {
      const rect = toggleBtn.getBoundingClientRect();
      menu.style.left = `${rect.left}px`;
      menu.style.top = `${rect.bottom}px`;
    }
  });

  const handleOutside = (e) => {
    if (!toggleBtn.contains(e.target) && !menu.contains(e.target)) {
      closeMenu();
    }
  };
  document.addEventListener("click", handleOutside);
  document.addEventListener("touchstart", handleOutside, { passive: true });

  const handleScrollClose = () => {
    if (menu.classList.contains("open")) closeMenu();
  };
  document.addEventListener("scroll", handleScrollClose, { passive: true });
  document.addEventListener("wheel", handleScrollClose, { passive: true });
  document.addEventListener("touchmove", handleScrollClose, { passive: true });
})();
