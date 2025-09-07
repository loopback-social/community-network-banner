(async function () {
  if (window.__GLOBAL_TOP_BANNER__) return;
  window.__GLOBAL_TOP_BANNER__ = true;

  const TITLE = "loopback.social";
  const TAGLINE = "뉴스나 커뮤니티 링크를 제보하세요";

  const scriptSrc = document.currentScript && document.currentScript.src;

  const parseNewsDate = (str, tz) => {
    if (!str) throw new Error("Missing date");
    const timezone = typeof tz === "string" && tz ? tz : "Z";
    return new Date(str.replace(" ", "T") + timezone);
  };

  let news = [];
  try {
    const urlNews = new URL("news.json", scriptSrc || location.href);
    urlNews.searchParams.set('t', Date.now()); // 캐시 무효화를 위한 타임스탬프
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
    url.searchParams.set('t', Date.now()); // 캐시 무효화를 위한 타임스탬프
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
    #global-top-banner .news-section {
      flex: 1;
      overflow: hidden;
      position: relative;
    }
    #global-top-banner .news-ticker {
      width: 100%;
      overflow: hidden;
      cursor: pointer;
      position: relative;
      transition: opacity 0.2s ease;
    }
    #global-top-banner .news-ticker:hover {
      opacity: 0.8;
    }
    #global-top-banner .news-ticker .news-content {
      display: inline-block;
      white-space: nowrap;
      animation: marquee 25s linear infinite;
      padding-left: 100%;
    }
    @keyframes marquee {
      0% {
        transform: translate3d(0, 0, 0);
      }
      100% {
        transform: translate3d(-100%, 0, 0);
      }
    }
    /* 모바일 대응 */
    @media (max-width: 768px) {
      #global-top-banner {
        padding: 0.4rem 0.8rem;
        font-size: 13px;
        gap: 0.8rem;
      }
      #global-top-banner .news-ticker .news-content {
        animation-duration: 30s;
      }
    }
    @media (max-width: 480px) {
      #global-top-banner {
        padding: 0.3rem 0.6rem;
        font-size: 12px;
        gap: 0.6rem;
      }
      #global-top-banner .news-ticker .news-content {
        animation-duration: 35s;
      }
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

    #global-news-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 2147483647;
    }
    #global-news-modal.open {
      display: flex;
    }
    #global-news-modal .modal-content {
      background: #fff;
      border-radius: 8px;
      padding: 1.5rem;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      margin: 1rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    #global-news-modal .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
    }
    #global-news-modal .modal-title {
      font-size: 1.2rem;
      font-weight: bold;
      margin: 0;
      color: #000;
    }
    #global-news-modal .close-modal {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #global-news-modal .close-modal:hover {
      color: #000;
    }
    #global-news-modal .news-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    #global-news-modal .news-list li {
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
    }
    #global-news-modal .news-list li:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    #global-news-modal .news-list a {
      color: #0066cc;
      text-decoration: none;
      font-weight: 500;
    }
    #global-news-modal .news-list a:hover {
      text-decoration: underline;
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

  let newsSection, newsTicker, newsContent, newsModal;
  
  if (news.length) {
    // Create news section with marquee ticker
    newsSection = document.createElement("div");
    newsSection.className = "news-section";

    // Create news ticker
    newsTicker = document.createElement("div");
    newsTicker.className = "news-ticker";
    
    newsContent = document.createElement("span");
    newsContent.className = "news-content";
    
    // Create marquee content with all news items
    const marqueeText = news.map(item => item.message).join(" • ");
    newsContent.textContent = marqueeText;
    
    newsTicker.appendChild(newsContent);
    newsSection.appendChild(newsTicker);

    // Create modal
    newsModal = document.createElement("div");
    newsModal.id = "global-news-modal";
    
    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";
    
    const modalHeader = document.createElement("div");
    modalHeader.className = "modal-header";
    
    const modalTitle = document.createElement("h3");
    modalTitle.className = "modal-title";
    modalTitle.textContent = "전체 뉴스";
    
    const closeButton = document.createElement("button");
    closeButton.className = "close-modal";
    closeButton.innerHTML = "&times;";
    closeButton.setAttribute("aria-label", "닫기");
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);
    
    const newsList = document.createElement("ul");
    newsList.className = "news-list";
    
    news.forEach(item => {
      const li = document.createElement("li");
      if (item.link) {
        const a = document.createElement("a");
        a.href = item.link;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = item.message;
        li.appendChild(a);
      } else {
        li.textContent = item.message;
      }
      newsList.appendChild(li);
    });
    
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(newsList);
    newsModal.appendChild(modalContent);

    banner.append(dropdown, newsSection);
  } else {
    const titleEl = document.createElement("a");
    titleEl.className = "title";
    titleEl.href = "https://loopback.social";
    titleEl.target = "_blank";
    titleEl.rel = "noopener noreferrer";
    titleEl.textContent = TAGLINE;
    titleEl.style.color = "#fff";
    titleEl.style.textDecoration = "none";
    banner.append(dropdown, titleEl);
  }
  document.body.insertBefore(banner, document.body.firstChild);
  document.body.appendChild(menu);
  if (newsModal) {
    document.body.appendChild(newsModal);
  }

  const closeMenu = () => {
    menu.classList.remove("open");
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.querySelector(".arrow").style.transform = "rotate(0deg)";
  };

  const closeModal = () => {
    if (newsModal) {
      newsModal.classList.remove("open");
    }
  };

  const openModal = () => {
    if (newsModal) {
      newsModal.classList.add("open");
    }
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

  // Modal event handlers
  if (newsTicker && newsModal) {
    // Add click event to news ticker
    newsTicker.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openModal();
    });
    
    const closeButton = newsModal.querySelector(".close-modal");
    if (closeButton) {
      closeButton.addEventListener("click", closeModal);
    }
    
    // Close modal when clicking outside
    newsModal.addEventListener("click", (e) => {
      if (e.target === newsModal) {
        closeModal();
      }
    });
    
    // Close modal with Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && newsModal.classList.contains("open")) {
        closeModal();
      }
    });
  }

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
