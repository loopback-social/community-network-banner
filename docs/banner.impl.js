(async function () {
  if (window.__GLOBAL_TOP_BANNER__) return;
  window.__GLOBAL_TOP_BANNER__ = true;

  // Read configuration (set by banner.js before this script loads)
  const bannerConfig = window.__BANNER_CONFIG__ || {};
  const bannerBg = bannerConfig.color || '#000';
  const bannerText = bannerConfig.textColor || '#fff';

  // Language detection
  // bannerConfig.lang: 'auto' (default) = detect from page, or specific locale like 'ko', 'en'
  const configLang = (bannerConfig.lang || 'auto').trim().toLowerCase();
  const lang = configLang !== 'auto'
    ? configLang
    : (document.documentElement.lang === 'en' ||
       window.location.pathname.includes('.en.') ||
       window.location.search.includes('lang=en'))
      ? 'en'
      : 'ko';
  const isEnglish = lang === 'en';

  const TITLE = "loopback.social";
  const TAGLINE = {
    ko: "뉴스나 커뮤니티 링크를 제보하세요",
    en: "Submit news or community links"
  };

  const MODAL_TITLE = {
    ko: "전체 뉴스",
    en: "All News"
  };

  const CLOSE_LABEL = {
    ko: "닫기",
    en: "Close"
  };

  const VIEW_ALL_NEWS = {
    ko: "전체 뉴스",
    en: "All News"
  };

  const RSS_POPUP_TITLE = { ko: "피드 구독", en: "Feed subscriptions" };
  const RSS_POPUP_DESC = {
    ko: "RSS 리더에 아래 URL 중 하나를 추가하세요. 세 형식 모두 동일한 콘텐츠를 제공하며, 사용 중인 리더가 지원하는 형식을 선택하면 됩니다.",
    en: "Add any of the URLs below to your RSS reader. All three formats serve the same content — pick whichever your reader supports."
  };
  const RSS_LABEL = { ko: "RSS 2.0", en: "RSS 2.0" };
  const ATOM_LABEL = { ko: "Atom 1.0", en: "Atom 1.0" };
  const JSON_LABEL = { ko: "JSON Feed", en: "JSON Feed" };
  const OPML_HEADING = { ko: "여러 피드를 한 번에 (OPML)", en: "Subscribe to multiple feeds at once (OPML)" };
  const OPML_DESC = {
    ko: "RSS 리더에서 OPML 파일을 가져오기(Import)하면 위 피드와 (앞으로 추가될) 참여 커뮤니티 피드를 한 번에 구독할 수 있습니다.",
    en: "Import this OPML file into your RSS reader to subscribe to the feeds above and any participating community feeds added in the future."
  };
  const OPML_LABEL = { ko: "OPML 파일", en: "OPML file" };

  const CAL_POPUP_TITLE = { ko: "캘린더에 구독 추가", en: "Add to your calendar" };
  const CAL_POPUP_DESC = {
    ko: "사용 중인 캘린더를 선택하면 자동으로 구독 다이얼로그가 열립니다. 클라이언트가 아래에 없으면 맨 아래 URL을 직접 추가하세요.",
    en: "Pick the calendar you use; we'll open its subscription dialog. If yours isn't listed, add the URL at the bottom manually."
  };
  const CAL_PROVIDER_GOOGLE = { ko: "Google 캘린더", en: "Google Calendar" };
  const CAL_PROVIDER_OUTLOOK = { ko: "Outlook (Outlook.com)", en: "Outlook (Outlook.com)" };
  const CAL_PROVIDER_OUTLOOK365 = { ko: "Outlook (Microsoft 365)", en: "Outlook (Microsoft 365)" };
  const CAL_PROVIDER_APPLE = { ko: "Apple 캘린더 / 기타 (webcal)", en: "Apple Calendar / Other (webcal)" };
  const CAL_PROVIDER_DOWNLOAD = { ko: ".ics 파일 다운로드", en: "Download .ics file" };
  const CAL_MANUAL_HEADING = { ko: "수동 추가용 URL", en: "Manual subscription URL" };

  const FEED_LABEL_RSS = { ko: "RSS / Atom 피드", en: "RSS / Atom feeds" };
  const FEED_LABEL_ICS = { ko: "캘린더 구독", en: "Calendar subscription" };
  const COPY_URL = { ko: "URL 복사", en: "Copy URL" };
  const COPIED = { ko: "복사됨!", en: "Copied!" };

  const SVG_RSS = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true" focusable="false"><path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18A2.18 2.18 0 0 1 6.18 20 2.18 2.18 0 0 1 4 17.82a2.18 2.18 0 0 1 2.18-2.18ZM4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44Zm0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z"/></svg>';
  const SVG_ATOM = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="1.6" fill="currentColor"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)"/></svg>';
  const SVG_JSON = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8 4H6a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h2"/><path d="M16 4h2a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2"/></svg>';
  const SVG_OPML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>';
  const SVG_CAL = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="4" width="18" height="17" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  const SVG_DOWNLOAD = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';

  const scriptSrc = document.currentScript && document.currentScript.src;
  // Feed variants live under /feeds/ on the server; banner.js is served from the
  // root, so we resolve relative to its src.
  const feedUrl = (path) => new URL(`feeds/${path}`, scriptSrc || location.href).toString();
  // Each feed format is published in three variants: `feed.xml` (bilingual, backward-compat),
  // `feed.ko.xml`, `feed.en.xml`. Banner UI surfaces the variant matching the active language
  // so subscribers don't see the other language they can't read.
  const langSuffix = isEnglish ? '.en' : '.ko';
  const rssHref = feedUrl(`feed${langSuffix}.xml`);
  const atomHref = feedUrl(`feed${langSuffix}.atom`);
  const jsonHref = feedUrl(`feed${langSuffix}.json`);
  const opmlHref = feedUrl(`feeds${langSuffix}.opml`);
  const icsHref = feedUrl(`news${langSuffix}.ics`);
  // webcal:// triggers calendar subscription in most native apps; falls back gracefully because we also expose the https link.
  const icsWebcalHref = icsHref.replace(/^https?:/i, 'webcal:');
  const calLabel = isEnglish ? 'Loopback Social events' : 'Loopback Social 커뮤니티 행사';
  const googleCalHref = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(icsHref)}`;
  const outlookLiveHref = `https://outlook.live.com/calendar/0/addcalendar?url=${encodeURIComponent(icsHref)}&name=${encodeURIComponent(calLabel)}`;
  const outlook365Href = `https://outlook.office.com/calendar/0/addcalendar?url=${encodeURIComponent(icsHref)}&name=${encodeURIComponent(calLabel)}`;
  let hasLoadError = false;

  const parseNewsDate = (str, tz) => {
    if (!str) throw new Error("Missing date");
    const timezone = typeof tz === "string" && tz.trim() ? tz.trim() : "Z";
    // Check if timezone is an IANA name (e.g. "Asia/Seoul") vs offset (e.g. "+09:00", "Z")
    const isOffset = /^[Zz]$|^[+-]\d{2}:\d{2}$/.test(timezone);
    if (isOffset) {
      return new Date(str.replace(" ", "T") + timezone);
    }
    // IANA timezone name: parse local parts then resolve via Intl
    const parts = str.trim().split(/[\s T]+/);
    const [y, mo, d] = parts[0].split("-").map(Number);
    const [h, mi, s] = (parts[1] || "00:00:00").split(":").map(Number);
    // Build a formatter that resolves the IANA zone's offset for the given date
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
      timeZoneName: "shortOffset"
    });
    // Use a reference date in the target zone to extract offset
    const ref = new Date(Date.UTC(y, mo - 1, d, h, mi, s || 0));
    const formatted = fmt.format(ref);
    const match = formatted.match(/GMT([+-]\d{1,2}(?::\d{2})?)/i);
    let offsetMin = 0;
    if (match) {
      const [, oh, om] = match[1].match(/([+-]?\d{1,2})(?::(\d{2}))?/);
      offsetMin = parseInt(oh, 10) * 60 + (parseInt(om || "0", 10)) * (oh.startsWith("-") ? -1 : 1);
    }
    return new Date(Date.UTC(y, mo - 1, d, h - Math.trunc(offsetMin / 60), mi - (offsetMin % 60), s || 0));
  };

  // Helper function to get localized text
  const getLocalizedText = (text) => {
    if (typeof text === 'string') return text;
    if (typeof text === 'object' && text !== null) {
      return text[lang] || text.ko || text.en || '';
    }
    return '';
  };

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  let news = [];
  try {
    const urlNews = new URL("news.json", scriptSrc || location.href);
    urlNews.searchParams.set('t', Date.now()); // 캐시 무효화를 위한 타임스탬프
    const respNews = await fetch(urlNews);
    const rawNews = await respNews.json();
    const now = new Date();
    news = rawNews.filter((n) => {
      const d = n.display;
      if (!(d === true || (typeof d === "string" && ["true","yes","1"].includes(d.trim().toLowerCase())))) return false;
      try {
        const start = parseNewsDate(n.start, n.timezone);
        const end = parseNewsDate(n.end, n.timezone);
        return start <= now && now <= end;
      } catch {
        return false;
      }
    }).map(item => ({
      ...item,
      message: getLocalizedText(item.message),
      link: getLocalizedText(item.link)
    }));
  } catch (err) {
    console.error("Failed to load news.json", err);
    hasLoadError = true;
  }

  let communities = [];
  try {
    const url = new URL('communities.json', scriptSrc || location.href);
    url.searchParams.set('t', Date.now()); // 캐시 무효화를 위한 타임스탬프
    const response = await fetch(url);
    const rawCommunities = await response.json();
    communities = rawCommunities.map(item => ({
      name: getLocalizedText(item.name),
      url: getLocalizedText(item.url)
    }));
  } catch (err) {
    console.error('Failed to load communities.json', err);
    hasLoadError = true;
  }

  const fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.href = isEnglish ?
    "https://fonts.googleapis.com/css2?family=Inter:wght@300;400&display=swap" :
    "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400&display=swap";
  document.head.appendChild(fontLink);

  const style = document.createElement("style");
  style.textContent = `
    #global-top-banner {
      box-sizing: border-box; width: 100%;
      background: ${bannerBg}; color: ${bannerText}; padding: 0.5em 1rem;
      display: flex; align-items: center; gap: 1rem;
      font: 400 14px/1 ${isEnglish ? "'Inter'" : "'Noto Sans KR'"}, sans-serif;
      box-shadow: 0 2px 4px rgba(0, 0, 0, .2);
      position: relative; z-index: 999;
    }
    #global-top-banner.error {
      background: #9e1a1a;
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
      position: relative;
    }
    #global-top-banner .view-all-news {
      background: none; border: none; color: ${bannerText}; cursor: pointer;
      font: inherit; white-space: nowrap; opacity: 0.7;
      padding: 0; text-decoration: underline;
    }
    #global-top-banner .view-all-news:hover {
      opacity: 1;
    }
    #global-top-banner .feed-links {
      display: inline-flex; align-items: center; gap: 0.75rem;
      flex-shrink: 0;
    }
    #global-top-banner .feed-links button {
      background: none; border: none; color: ${bannerText}; cursor: pointer;
      font: inherit; white-space: nowrap; opacity: 0.7;
      padding: 0; text-decoration: underline;
    }
    #global-top-banner .feed-links button:hover {
      opacity: 1;
    }
    #global-top-banner .feed-links button:focus-visible {
      outline: 2px solid ${bannerText}; outline-offset: 2px;
    }
    @media (max-width: 480px) {
      #global-top-banner .feed-links { gap: 0.55rem; }
    }
    #global-top-banner .news-ticker .news-content {
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      opacity: 1;
      transition: opacity 0.5s ease-in-out;
    }
    #global-top-banner .news-ticker .news-content.fade-out {
      opacity: 0;
    }
    /* 모바일 대응 */
    @media (max-width: 768px) {
      #global-top-banner {
        padding: 0.4rem 0.8rem;
        font-size: 13px;
        gap: 0.8rem;
      }
    }
    @media (max-width: 480px) {
      #global-top-banner {
        padding: 0.3rem 0.6rem;
        font-size: 12px;
        gap: 0.6rem;
      }
    }
    #global-top-banner .news-ticker a,
    #global-top-banner .news-ticker a:link,
    #global-top-banner .news-ticker a:visited,
    #global-top-banner .news-ticker a:hover,
    #global-top-banner .news-ticker a:active {
      color: ${bannerText} !important;
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
    /* Header icon actions (RSS / Calendar) inside the news modal. */
    #global-news-modal .modal-actions {
      display: inline-flex; align-items: center; gap: 0.35rem;
    }
    #global-news-modal .modal-action-btn {
      background: none; border: 1px solid #ddd; border-radius: 4px;
      cursor: pointer; padding: 0.25rem 0.45rem;
      color: #555; display: inline-flex; align-items: center; justify-content: center;
    }
    #global-news-modal .modal-action-btn:hover {
      color: #000; background: #f4f4f4;
    }
    #global-news-modal .modal-action-btn:focus-visible {
      outline: 2px solid #0066cc; outline-offset: 2px;
    }

    /* Shared sub-popup primitive: a stacked overlay above the news modal. */
    .gtb-sub-popup {
      position: fixed; inset: 0;
      background: rgba(0, 0, 0, 0.55);
      display: none;
      align-items: center; justify-content: center;
      z-index: 2147483647;
    }
    .gtb-sub-popup.open { display: flex; }
    .gtb-sub-popup .popup-content {
      background: #fff; color: #222;
      border-radius: 8px;
      padding: 1.25rem 1.5rem 1.5rem;
      max-width: 520px; width: 100%;
      max-height: 85vh; overflow-y: auto;
      margin: 1rem;
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.32);
      font-family: inherit;
    }
    .gtb-sub-popup .popup-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 0.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #eee;
    }
    .gtb-sub-popup .popup-title {
      font-size: 1.05rem; font-weight: 700; color: #000; margin: 0;
    }
    .gtb-sub-popup .popup-close {
      background: none; border: none; cursor: pointer;
      font-size: 1.4rem; color: #666;
      padding: 0; width: 28px; height: 28px;
      display: flex; align-items: center; justify-content: center;
    }
    .gtb-sub-popup .popup-close:hover { color: #000; }
    .gtb-sub-popup .popup-desc {
      margin: 0.5rem 0 1rem;
      font-size: 0.88rem; color: #555; line-height: 1.5;
    }
    .gtb-sub-popup .provider-grid {
      display: grid; gap: 0.5rem;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      margin-bottom: 1rem;
    }
    @media (max-width: 480px) {
      .gtb-sub-popup .provider-grid { grid-template-columns: 1fr; }
    }
    .gtb-sub-popup .provider-card {
      display: flex; align-items: center; gap: 0.55rem;
      padding: 0.65rem 0.75rem;
      border: 1px solid #d8d8d8; border-radius: 6px;
      background: #fafafa; color: #000;
      text-decoration: none;
      font-size: 0.92rem; font-weight: 600;
    }
    .gtb-sub-popup .provider-card:hover,
    .gtb-sub-popup .provider-card:focus-visible {
      border-color: #0066cc; background: #eef5ff; outline: none;
    }
    .gtb-sub-popup .provider-card-icon {
      flex-shrink: 0;
      display: inline-flex; align-items: center; justify-content: center;
      width: 26px; height: 26px;
      background: #fff; border: 1px solid #ddd; border-radius: 4px;
      color: #444;
    }
    .gtb-sub-popup .provider-card-icon svg { width: 16px; height: 16px; }
    .gtb-sub-popup .provider-card-label { line-height: 1.2; }
    .gtb-sub-popup .url-list {
      list-style: none; margin: 0; padding: 0;
      display: grid; gap: 0.6rem;
    }
    .gtb-sub-popup .url-row {
      display: grid; gap: 0.3rem;
    }
    .gtb-sub-popup .url-row .url-label {
      display: inline-flex; align-items: center; gap: 0.35rem;
      font-size: 0.85rem; font-weight: 600; color: #333;
    }
    .gtb-sub-popup .url-row .url-label svg { width: 13px; height: 13px; }
    .gtb-sub-popup .url-row .url-controls {
      display: flex; gap: 0.4rem; align-items: center;
    }
    .gtb-sub-popup .url-box {
      flex: 1; min-width: 0;
      padding: 0.3rem 0.5rem;
      border: 1px solid #ddd; border-radius: 4px;
      background: #f8f8f8;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.8rem;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .gtb-sub-popup .url-copy {
      flex-shrink: 0;
      padding: 0.3rem 0.7rem;
      background: #fff; border: 1px solid #ccc; border-radius: 4px;
      cursor: pointer; color: #333; font: inherit; font-size: 0.8rem;
    }
    .gtb-sub-popup .url-copy:hover { background: #f0f0f0; }
    .gtb-sub-popup .url-copy.copied {
      color: #2a7a2a; border-color: #b6dab6; background: #eaf5ea;
    }
    .gtb-sub-popup .section-heading {
      font-size: 0.85rem; font-weight: 600; color: #333;
      margin: 1rem 0 0.5rem;
    }
    #global-top-banner .gtb-dropdown {
      position: relative; font-weight: bold;
    }
    #global-top-banner button.gtb-dropdown-toggle {
      background: none; border: none; color: inherit; cursor: pointer;
      display: flex; align-items: center; gap: .25rem; font: inherit;
    }
    #global-top-banner button.gtb-dropdown-toggle:focus {
      outline: 2px solid #555; outline-offset: 2px;
    }
    #global-top-banner button.gtb-dropdown-toggle::after {
      content: none !important;
      display: none !important;
    }
    #global-top-banner .gtb-arrow {
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
  dropdown.className = "gtb-dropdown";

  const toggleBtn = document.createElement("button");
  toggleBtn.className = "gtb-dropdown-toggle";
  toggleBtn.type = "button";
  toggleBtn.setAttribute("aria-haspopup", "true");
  toggleBtn.setAttribute("aria-expanded", "false");
  toggleBtn.innerHTML = `${TITLE} <span class="gtb-arrow">&#x25bc;</span>`;

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
    // Shuffle news array for random display order
    const shuffledNews = shuffleArray(news);
    let currentNewsIndex = 0;

    // Create news section with static ticker
    newsSection = document.createElement("div");
    newsSection.className = "news-section";

    // Create news ticker
    newsTicker = document.createElement("div");
    newsTicker.className = "news-ticker";
    
    newsContent = document.createElement("span");
    newsContent.className = "news-content";
    
    // Display first news item
    const displayCurrentNews = () => {
      const currentNews = shuffledNews[currentNewsIndex];
      newsContent.textContent = currentNews.message;
      
      // If news item has a link, make it clickable
      if (currentNews.link) {
        const linkElement = document.createElement("a");
        linkElement.href = currentNews.link;
        linkElement.target = "_blank";
        linkElement.rel = "noopener noreferrer";
        linkElement.textContent = currentNews.message;
        linkElement.style.color = bannerText;
        linkElement.style.textDecoration = "underline";
        newsContent.innerHTML = "";
        newsContent.appendChild(linkElement);
      }
    };

    // Function to switch to next news with fade effect
    const switchToNextNews = () => {
      newsContent.classList.add("fade-out");
      
      setTimeout(() => {
        currentNewsIndex = (currentNewsIndex + 1) % shuffledNews.length;
        
        // If we've gone through all items, shuffle again
        if (currentNewsIndex === 0) {
          shuffledNews.splice(0, shuffledNews.length, ...shuffleArray(news));
        }
        
        displayCurrentNews();
        newsContent.classList.remove("fade-out");
      }, 250); // Half of the transition duration
    };

    // Initialize with first news item
    displayCurrentNews();
    
    // Set up 10-second interval for news rotation
    setInterval(switchToNextNews, 10000);
    
    newsTicker.appendChild(newsContent);
    newsSection.appendChild(newsTicker);

    // Create "View All News" button
    const viewAllBtn = document.createElement("button");
    viewAllBtn.className = "view-all-news";
    viewAllBtn.textContent = VIEW_ALL_NEWS[lang] || VIEW_ALL_NEWS.en;

    // ---- Sub-popup primitive (used by the RSS popup and the Calendar popup) ----
    // openPopups acts as a stack so Escape closes only the topmost popup.
    const openPopups = [];
    const openPopup = (popup) => {
      if (!popup || popup.classList.contains("open")) return;
      popup.classList.add("open");
      openPopups.push(popup);
    };
    const closePopup = (popup) => {
      if (!popup || !popup.classList.contains("open")) return;
      popup.classList.remove("open");
      const idx = openPopups.indexOf(popup);
      if (idx >= 0) openPopups.splice(idx, 1);
    };
    const buildSubPopup = (id, titleLabel, buildBody) => {
      const popup = document.createElement("div");
      popup.id = id;
      popup.className = "gtb-sub-popup";
      popup.setAttribute("role", "dialog");
      popup.setAttribute("aria-modal", "true");
      popup.setAttribute("aria-label", titleLabel[lang] || titleLabel.en);
      const content = document.createElement("div");
      content.className = "popup-content";
      const header = document.createElement("div");
      header.className = "popup-header";
      const title = document.createElement("h3");
      title.className = "popup-title";
      title.textContent = titleLabel[lang] || titleLabel.en;
      const closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "popup-close";
      closeBtn.innerHTML = "&times;";
      closeBtn.setAttribute("aria-label", CLOSE_LABEL[lang]);
      closeBtn.addEventListener("click", () => closePopup(popup));
      header.append(title, closeBtn);
      content.appendChild(header);
      buildBody(content);
      popup.appendChild(content);
      popup.addEventListener("click", (e) => { if (e.target === popup) closePopup(popup); });
      return popup;
    };

    // Shared URL row with a copy-to-clipboard button.
    const makeUrlRow = (labelText, iconSvg, displayUrl, copyValue) => {
      const row = document.createElement("div");
      row.className = "url-row";
      const label = document.createElement("div");
      label.className = "url-label";
      if (iconSvg) {
        const iconSpan = document.createElement("span");
        iconSpan.innerHTML = iconSvg;
        label.appendChild(iconSpan);
      }
      const labelTxt = document.createElement("span");
      labelTxt.textContent = labelText;
      label.appendChild(labelTxt);
      const controls = document.createElement("div");
      controls.className = "url-controls";
      const box = document.createElement("code");
      box.className = "url-box";
      box.textContent = displayUrl;
      box.title = displayUrl;
      const copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.className = "url-copy";
      const originalCopyLabel = COPY_URL[lang] || COPY_URL.en;
      copyBtn.textContent = originalCopyLabel;
      copyBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(copyValue);
          copyBtn.textContent = COPIED[lang] || COPIED.en;
          copyBtn.classList.add("copied");
          setTimeout(() => {
            copyBtn.textContent = originalCopyLabel;
            copyBtn.classList.remove("copied");
          }, 1500);
        } catch {
          // Fallback when clipboard API is unavailable: select URL so user can copy manually.
          const range = document.createRange();
          range.selectNodeContents(box);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }
      });
      controls.append(box, copyBtn);
      row.append(label, controls);
      return row;
    };

    // ---- Feed sub-popup (RSS / Atom / JSON Feed / OPML) ----
    const rssPopup = buildSubPopup("global-rss-popup", RSS_POPUP_TITLE, (content) => {
      const desc = document.createElement("p");
      desc.className = "popup-desc";
      desc.textContent = RSS_POPUP_DESC[lang] || RSS_POPUP_DESC.en;
      const urlList = document.createElement("div");
      urlList.className = "url-list";
      urlList.append(
        makeUrlRow(RSS_LABEL[lang] || RSS_LABEL.en, SVG_RSS, rssHref, rssHref),
        makeUrlRow(ATOM_LABEL[lang] || ATOM_LABEL.en, SVG_ATOM, atomHref, atomHref),
        makeUrlRow(JSON_LABEL[lang] || JSON_LABEL.en, SVG_JSON, jsonHref, jsonHref)
      );

      const opmlHeading = document.createElement("p");
      opmlHeading.className = "section-heading";
      opmlHeading.textContent = OPML_HEADING[lang] || OPML_HEADING.en;
      const opmlDesc = document.createElement("p");
      opmlDesc.className = "popup-desc";
      opmlDesc.textContent = OPML_DESC[lang] || OPML_DESC.en;
      const opmlList = document.createElement("div");
      opmlList.className = "url-list";
      opmlList.append(makeUrlRow(OPML_LABEL[lang] || OPML_LABEL.en, SVG_OPML, opmlHref, opmlHref));

      content.append(desc, urlList, opmlHeading, opmlDesc, opmlList);
    });

    // ---- Calendar sub-popup (Google / Outlook / Apple / Download) ----
    const calPopup = buildSubPopup("global-cal-popup", CAL_POPUP_TITLE, (content) => {
      const desc = document.createElement("p");
      desc.className = "popup-desc";
      desc.textContent = CAL_POPUP_DESC[lang] || CAL_POPUP_DESC.en;
      const grid = document.createElement("div");
      grid.className = "provider-grid";
      const makeProviderCard = (svg, label, href, downloadName) => {
        const a = document.createElement("a");
        a.href = href;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.className = "provider-card";
        if (downloadName) a.download = downloadName;
        const iconSpan = document.createElement("span");
        iconSpan.className = "provider-card-icon";
        iconSpan.innerHTML = svg;
        const labelSpan = document.createElement("span");
        labelSpan.className = "provider-card-label";
        labelSpan.textContent = label[lang] || label.en;
        a.append(iconSpan, labelSpan);
        return a;
      };
      grid.append(
        makeProviderCard(SVG_CAL, CAL_PROVIDER_GOOGLE, googleCalHref),
        makeProviderCard(SVG_CAL, CAL_PROVIDER_OUTLOOK, outlookLiveHref),
        makeProviderCard(SVG_CAL, CAL_PROVIDER_OUTLOOK365, outlook365Href),
        makeProviderCard(SVG_CAL, CAL_PROVIDER_APPLE, icsWebcalHref),
        makeProviderCard(SVG_DOWNLOAD, CAL_PROVIDER_DOWNLOAD, icsHref, "loopback-social.ics")
      );
      const manualHeading = document.createElement("p");
      manualHeading.className = "section-heading";
      manualHeading.textContent = CAL_MANUAL_HEADING[lang] || CAL_MANUAL_HEADING.en;
      const urlList = document.createElement("div");
      urlList.className = "url-list";
      urlList.append(makeUrlRow("iCalendar (.ics)", SVG_CAL, icsHref, icsHref));
      content.append(desc, grid, manualHeading, urlList);
    });

    // Helper to build icon trigger buttons (modal header).
    const makeIconTriggerButton = (svg, labelObj, className, onClick) => {
      const btn = document.createElement("button");
      btn.type = "button";
      if (className) btn.className = className;
      btn.title = labelObj[lang] || labelObj.en;
      btn.setAttribute("aria-label", labelObj[lang] || labelObj.en);
      btn.setAttribute("aria-haspopup", "dialog");
      btn.innerHTML = svg;
      btn.addEventListener("click", (e) => { e.stopPropagation(); onClick(); });
      return btn;
    };

    // Helper to build text-link trigger buttons (banner row — matches "View All News").
    const makeTextTriggerButton = (visibleText, labelObj, onClick) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = visibleText;
      btn.title = labelObj[lang] || labelObj.en;
      btn.setAttribute("aria-label", labelObj[lang] || labelObj.en);
      btn.setAttribute("aria-haspopup", "dialog");
      btn.addEventListener("click", (e) => { e.stopPropagation(); onClick(); });
      return btn;
    };

    // ---- Banner-level text-link triggers (next to "View All News") ----
    const feedLinks = document.createElement("div");
    feedLinks.className = "feed-links";
    const calBannerLabel = isEnglish ? "Calendar" : "캘린더";
    // "Feed / 피드" generalises RSS + Atom; the sub-popup spells out both formats.
    const feedBannerLabel = isEnglish ? "Feed" : "피드";
    feedLinks.append(
      makeTextTriggerButton(calBannerLabel, FEED_LABEL_ICS, () => openPopup(calPopup)),
      makeTextTriggerButton(feedBannerLabel, FEED_LABEL_RSS, () => openPopup(rssPopup))
    );

    // ---- News modal ----
    newsModal = document.createElement("div");
    newsModal.id = "global-news-modal";

    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";

    const modalHeader = document.createElement("div");
    modalHeader.className = "modal-header";

    const modalTitle = document.createElement("h3");
    modalTitle.className = "modal-title";
    modalTitle.textContent = MODAL_TITLE[lang];

    const modalActions = document.createElement("div");
    modalActions.className = "modal-actions";

    const closeButton = document.createElement("button");
    closeButton.className = "close-modal";
    closeButton.innerHTML = "&times;";
    closeButton.setAttribute("aria-label", CLOSE_LABEL[lang]);

    modalActions.append(
      makeIconTriggerButton(SVG_RSS, FEED_LABEL_RSS, "modal-action-btn", () => openPopup(rssPopup)),
      makeIconTriggerButton(SVG_CAL, FEED_LABEL_ICS, "modal-action-btn", () => openPopup(calPopup)),
      closeButton
    );
    modalHeader.append(modalTitle, modalActions);

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

    modalContent.append(modalHeader, newsList);
    newsModal.appendChild(modalContent);

    // Stash the popups + stack on the newsModal node so the event-handler block
    // below (outside this scope) can wire Escape and append them to <body>.
    newsModal.__subPopups = [rssPopup, calPopup];
    newsModal.__popupStack = openPopups;
    newsModal.__closePopup = closePopup;

    banner.append(dropdown, newsSection, viewAllBtn, feedLinks);
  } else {
    const titleEl = document.createElement("a");
    titleEl.className = "title";
    titleEl.href = isEnglish ? "https://loopback.social/index.en.html" : "https://loopback.social";
    titleEl.target = "_blank";
    titleEl.rel = "noopener noreferrer";
    titleEl.textContent = TAGLINE[lang];
    titleEl.style.color = bannerText;
    titleEl.style.textDecoration = "none";
    banner.append(dropdown, titleEl);
  }
  // 오류 상태일 때 배경색 변경
  if (hasLoadError) {
    banner.classList.add("error");
  }
  
  document.body.insertBefore(banner, document.body.firstChild);
  document.body.appendChild(menu);
  if (newsModal) {
    document.body.appendChild(newsModal);
    if (newsModal.__subPopups) {
      // Sub-popups append AFTER the news modal so DOM order keeps them on top
      // (same z-index as the news modal).
      for (const popup of newsModal.__subPopups) {
        document.body.appendChild(popup);
      }
    }
  }

  const closeMenu = () => {
    menu.classList.remove("open");
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.querySelector(".gtb-arrow").style.transform = "rotate(0deg)";
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
    toggleBtn.querySelector(".gtb-arrow").style.transform =
      opened ? "rotate(-180deg)" : "rotate(0deg)";
    if (opened) {
      const rect = toggleBtn.getBoundingClientRect();
      menu.style.left = `${rect.left}px`;
      menu.style.top = `${rect.bottom}px`;
    }
  });

  // Modal event handlers
  if (newsModal) {
    // "View All News" button opens modal
    const viewAllBtn = banner.querySelector(".view-all-news");
    if (viewAllBtn) {
      viewAllBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openModal();
      });
    }

    const closeButton = newsModal.querySelector(".close-modal");
    if (closeButton) {
      closeButton.addEventListener("click", closeModal);
    }

    // Close news modal when clicking its backdrop (not when a sub-popup is on top).
    newsModal.addEventListener("click", (e) => {
      if (e.target === newsModal && (!newsModal.__popupStack || newsModal.__popupStack.length === 0)) {
        closeModal();
      }
    });

    // Escape closes the topmost sub-popup first, then the news modal.
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const stack = newsModal.__popupStack;
      if (stack && stack.length > 0) {
        newsModal.__closePopup(stack[stack.length - 1]);
        return;
      }
      if (newsModal.classList.contains("open")) closeModal();
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
