(async function () {
  if (window.__GLOBAL_TOP_BANNER__) return;
  window.__GLOBAL_TOP_BANNER__ = true;

  const TITLE = "loopback.social";
  const TAGLINE = "Every loop counts.";

  const scriptSrc = document.currentScript && document.currentScript.src;

  const parseNewsDate = (str, tz) => {
    if (!str) throw new Error("Missing date");
    const timezone = typeof tz === "string" && tz ? tz : "Z";
    return new Date(str.replace(" ", "T") + timezone);
  };

  let news = [];
  try {
    const urlNews = new URL("news.json", scriptSrc || location.href);
    const respNews = await fetch(urlNews);
    const rawNews = await respNews.json();
    const now = new Date();
    news = rawNews.filter((n) => {
      if (n.display !== true) return false;
      try {
        const start = parseNewsDate(n.start, n.timezone);
        const end = parseNewsDate(n.end, n.timezone);
        return start <= now && now <= end;
      } catch {
        return false;
      }
    });
  } catch (err) {
    console.error("Failed to load news.json", err);
  }

  let communities = [];
  try {
    const url = new URL('communities.json', scriptSrc || location.href);
    const response = await fetch(url);
    communities = await response.json();
  } catch (err) {
    console.error('Failed to load communities.json', err);
  }
  communities.sort((a, b) =>
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
      #global-top-banner .news-ticker {
        overflow: hidden;
        flex: 1;
        height: 1em;
        position: relative;
        margin: 0;
        padding: 0;
      }
      #global-top-banner .news-ticker span {
        position: absolute;
        left: 0;
        width: 100%;
        transition: transform .5s ease;
        display: block;
      }
      #global-top-banner .news-ticker a,
      #global-top-banner .news-ticker a:link,
      #global-top-banner .news-ticker a:visited,
      #global-top-banner .news-ticker a:hover,
      #global-top-banner .news-ticker a:active {
        color: #fff !important;
        text-decoration: underline;
        font-weight: inherit;
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

  const createNewsSpan = (item) => {
    const span = document.createElement("span");
    if (item.link) {
      const a = document.createElement("a");
      a.href = item.link;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = item.message;
      span.appendChild(a);
    } else {
      span.textContent = item.message;
    }
    return span;
  };

  if (news.length) {
    const ticker = document.createElement("div");
    ticker.className = "news-ticker";
    let current = createNewsSpan(news[0]);
    ticker.appendChild(current);
    let idx = 1;
    setInterval(() => {
      const next = createNewsSpan(news[idx % news.length]);
      next.style.transform = "translateY(100%)";
      ticker.appendChild(next);
      requestAnimationFrame(() => {
        next.style.transform = "translateY(0)";
        current.style.transform = "translateY(-100%)";
      });
      setTimeout(() => {
        ticker.removeChild(current);
        current = next;
      }, 500);
      idx++;
    }, 15000);
    banner.append(dropdown, ticker);
  } else {
    const titleEl = document.createElement("span");
    titleEl.className = "title";
    titleEl.textContent = TAGLINE;
    banner.append(dropdown, titleEl);
  }
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
