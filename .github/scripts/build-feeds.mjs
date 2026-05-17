#!/usr/bin/env node
// Build machine-readable feeds from docs/news.json + docs/communities.json:
//   docs/feeds/news{,.ko,.en}.ics    — iCalendar (RFC 5545)
//   docs/feeds/feed{,.ko,.en}.xml    — RSS 2.0
//   docs/feeds/feed{,.ko,.en}.atom   — Atom 1.0
//   docs/feeds/feed{,.ko,.en}.json   — JSON Feed 1.1
//   docs/feeds/feeds{,.ko,.en}.opml  — OPML 2.0 bundle
//   docs/feeds/events.jsonld         — Schema.org Event collection (always bilingual)
//   docs/sitemap.xml                 — sitemap of public assets (root by convention)
// Run locally: `node .github/scripts/build-feeds.mjs`
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const SITE_ORIGIN = 'https://loopback.social';
const NEWS_PATH = resolve('docs/news.json');
const COMMUNITIES_PATH = resolve('docs/communities.json');
const SITEMAP_PATH = resolve('docs/sitemap.xml');

// All RSS/Atom/JSON Feed/OPML/ICS variants live under docs/feeds/ so PR diffs
// stay readable and "do not hand-edit" is visually obvious. The
// FEEDS_URL_PREFIX is the public URL prefix that mirrors this on-disk layout.
const FEEDS_DIR = resolve('docs/feeds');
const FEEDS_URL_PREFIX = `${SITE_ORIGIN}/feeds`;

const LANG_VARIANTS = [
  { mode: 'mul', suffix: '' },
  { mode: 'ko', suffix: '.ko' },
  { mode: 'en', suffix: '.en' }
];
const variantPath = (base, ext, suffix) => `${FEEDS_DIR}/${base}${suffix}.${ext}`;
const variantUrl = (base, ext, suffix) => `${FEEDS_URL_PREFIX}/${base}${suffix}.${ext}`;

// Items whose end is older than this many days ago are excluded from feeds.
const FEED_BACKDATE_DAYS = 30;

// Items whose effective event window exceeds this length are treated as
// "long-running" (campaign/recruitment/evergreen) and excluded from news.ics
// unless category === "event" or event_start is explicitly set. They still
// appear in feed.xml and events.jsonld.
const ICS_MAX_DURATION_DAYS = 7;

const includeInIcs = (item) => {
  if (item.category === 'event') return true;
  if (item.raw.event_start) return true;
  // Explicit non-event categories never go in the calendar.
  if (item.category && item.category !== 'event') return false;
  // No category set: use duration heuristic.
  const ms = item.eventEnd.getTime() - item.eventStart.getTime();
  return ms <= ICS_MAX_DURATION_DAYS * 24 * 60 * 60 * 1000;
};

// ---------- helpers ----------
const isTruthy = (v) =>
  v === true ||
  (typeof v === 'string' && ['true', 'yes', '1'].includes(v.trim().toLowerCase()));

const localized = (value, lang) => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') return value[lang] || value.ko || value.en || '';
  return '';
};

// Resolve "YYYY-MM-DD HH:MM:SS" + timezone (offset or IANA) into a UTC Date.
const parseLocal = (str, tz) => {
  if (!str) return null;
  const timezone = typeof tz === 'string' && tz.trim() ? tz.trim() : 'Z';
  const isOffset = /^[Zz]$|^[+-]\d{2}:\d{2}$/.test(timezone);
  if (isOffset) {
    return new Date(str.replace(' ', 'T') + (timezone.toUpperCase() === 'Z' ? 'Z' : timezone));
  }
  const [datePart, timePart = '00:00:00'] = str.trim().split(/[\sT]+/);
  const [y, mo, d] = datePart.split('-').map(Number);
  const [h, mi, s] = timePart.split(':').map(Number);
  // Build a probe Date in UTC, then ask Intl for the IANA offset at that instant.
  const probe = new Date(Date.UTC(y, mo - 1, d, h, mi, s || 0));
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour12: false,
    timeZoneName: 'shortOffset',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
  const match = fmt.format(probe).match(/GMT([+-]\d{1,2})(?::(\d{2}))?/i);
  if (!match) return probe;
  const sign = match[1].startsWith('-') ? -1 : 1;
  const oh = Math.abs(parseInt(match[1], 10));
  const om = parseInt(match[2] || '0', 10);
  const offsetMin = sign * (oh * 60 + om);
  return new Date(probe.getTime() - offsetMin * 60_000);
};

const fmtIcsUtc = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  );
};

// RFC 5545 folding — break long lines at 75 octets, continuation starts with a space.
const foldIcs = (line) => {
  const out = [];
  let buf = Buffer.from(line, 'utf8');
  let first = true;
  while (buf.length > 0) {
    const limit = first ? 75 : 74;
    let cut = Math.min(limit, buf.length);
    // Avoid splitting in the middle of a multi-byte UTF-8 sequence.
    while (cut > 0 && (buf[cut] & 0b1100_0000) === 0b1000_0000) cut--;
    out.push((first ? '' : ' ') + buf.slice(0, cut).toString('utf8'));
    buf = buf.slice(cut);
    first = false;
  }
  return out.join('\r\n');
};

const escIcs = (text) =>
  String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');

const escXml = (text) =>
  String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const hashId = (...parts) =>
  createHash('sha1').update(parts.join('|')).digest('hex').slice(0, 16);

const itemUid = (item, fallbackIndex) => {
  if (item.id) return item.id;
  const seed = `${item.start || ''}|${localized(item.message, 'ko') || localized(item.message, 'en') || ''}|${fallbackIndex}`;
  return `news-${hashId(seed)}`;
};

// ---------- per-language pickers ----------
// langMode: 'mul' (bilingual, KO/EN side-by-side), 'ko' (KO only, EN fallback), 'en' (EN only, KO fallback)
// When an item is missing the requested language we always fall back to the other
// rather than dropping it, so no feed variant ever silently loses items.
const pickTitle = (item, langMode) => {
  const ko = item.messageKo, en = item.messageEn;
  if (langMode === 'mul') {
    if (ko && en && ko !== en) return `${ko} / ${en}`;
    return ko || en || '(untitled)';
  }
  if (langMode === 'ko') return ko || en || '(untitled)';
  return en || ko || '(untitled)';
};
const pickLink = (item, langMode) =>
  langMode === 'en'
    ? (item.linkEn || item.linkKo)
    : (item.linkKo || item.linkEn);
const pickLocation = (item, langMode) =>
  langMode === 'en'
    ? (item.locationEn || item.locationKo)
    : (item.locationKo || item.locationEn);
// Multi-line body text (used in RSS description, Atom summary, ICS DESCRIPTION, JSON Feed content_text).
const pickBody = (item, langMode, opts = {}) => {
  const ko = item.messageKo, en = item.messageEn;
  const lines = [];
  if (langMode === 'mul') {
    if (ko) lines.push(`[KO] ${ko}`);
    if (en && en !== ko) lines.push(`[EN] ${en}`);
  } else if (langMode === 'ko') {
    if (ko) lines.push(ko);
    else if (en) lines.push(en);
  } else {
    if (en) lines.push(en);
    else if (ko) lines.push(ko);
  }
  if (opts.includeMeta) {
    lines.push(`Event: ${item.eventStart.toISOString()} — ${item.eventEnd.toISOString()}`);
    lines.push(`Category: ${item.categoryLabel}`);
    const loc = pickLocation(item, langMode);
    if (loc) lines.push(`Location: ${loc}`);
  }
  return lines.join('\n');
};
const langTag = (langMode) => langMode === 'mul' ? 'mul' : langMode;

// ---------- main ----------
const main = async () => {
  const news = JSON.parse(await readFile(NEWS_PATH, 'utf8'));
  const communities = JSON.parse(await readFile(COMMUNITIES_PATH, 'utf8'));
  if (!Array.isArray(news)) throw new Error('docs/news.json must be an array');
  if (!Array.isArray(communities)) throw new Error('docs/communities.json must be an array');

  const now = new Date();
  const cutoff = new Date(now.getTime() - FEED_BACKDATE_DAYS * 24 * 60 * 60 * 1000);

  const enriched = news
    .map((raw, idx) => {
      if (!isTruthy(raw.display)) return null;
      const displayStart = parseLocal(raw.start, raw.timezone);
      const displayEnd = parseLocal(raw.end, raw.timezone);
      if (!displayStart || !displayEnd) return null;
      const eventStart = raw.event_start ? parseLocal(raw.event_start, raw.timezone) : displayStart;
      const eventEnd = raw.event_end ? parseLocal(raw.event_end, raw.timezone) : displayEnd;
      const messageKo = localized(raw.message, 'ko');
      const messageEn = localized(raw.message, 'en') || messageKo;
      const linkKo = localized(raw.link, 'ko');
      const linkEn = localized(raw.link, 'en') || linkKo;
      const locationKo = localized(raw.location, 'ko');
      const locationEn = localized(raw.location, 'en') || locationKo;
      const category = raw.category || null;
      return {
        uid: itemUid(raw, idx),
        category,
        categoryLabel: category || 'announcement',
        displayStart, displayEnd, eventStart, eventEnd,
        timezone: raw.timezone || 'UTC',
        messageKo, messageEn,
        linkKo, linkEn,
        locationKo, locationEn,
        raw
      };
    })
    .filter((x) => x && x.displayEnd >= cutoff);

  enriched.sort((a, b) => a.eventStart.getTime() - b.eventStart.getTime());

  await mkdir(FEEDS_DIR, { recursive: true });

  const writtenPaths = [];
  const writeVariant = async (path, content) => {
    await writeFile(path, content, 'utf8');
    writtenPaths.push(path);
  };

  for (const { mode, suffix } of LANG_VARIANTS) {
    await writeVariant(variantPath('news', 'ics', suffix), buildIcs(enriched, now, mode));
    await writeVariant(variantPath('feed', 'xml', suffix), buildRss(enriched, now, mode));
    await writeVariant(variantPath('feed', 'atom', suffix), buildAtom(enriched, now, mode));
    await writeVariant(variantPath('feed', 'json', suffix), buildJsonFeed(enriched, now, mode) + '\n');
    await writeVariant(variantPath('feeds', 'opml', suffix), buildOpml(communities, now, mode));
  }

  // Schema.org JSON-LD stays bilingual (it's machine-readable structured data
  // with explicit ko/en strings, not consumed by language-specific readers) and
  // lives next to the other generated feeds for a single "do not hand-edit" boundary.
  await writeVariant(`${FEEDS_DIR}/events.jsonld`, buildJsonLd(enriched, communities) + '\n');
  await writeVariant(SITEMAP_PATH, buildSitemap(now));

  console.log(`Built feeds for ${enriched.length} item(s):`);
  for (const p of writtenPaths) console.log(`  - ${p}`);
};

// ---------- iCalendar ----------
const ICS_CAL_NAME = {
  mul: 'Loopback Social — Community Events',
  ko: 'Loopback Social — 커뮤니티 행사',
  en: 'Loopback Social — Community Events'
};
const ICS_CAL_DESC = {
  mul: 'Events and announcements shared across the Loopback Social community network.',
  ko: 'Loopback Social 커뮤니티 네트워크가 함께 공유하는 행사와 공지.',
  en: 'Events and announcements shared across the Loopback Social community network.'
};
const buildIcs = (items, now, langMode = 'mul') => {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//loopback.social//community-network-banner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${ICS_CAL_NAME[langMode]}`,
    `X-WR-CALDESC:${ICS_CAL_DESC[langMode]}`,
    'X-WR-TIMEZONE:Asia/Seoul'
  ];
  for (const item of items) {
    if (!includeInIcs(item)) continue;
    const title = pickTitle(item, langMode);
    const url = pickLink(item, langMode) || `${SITE_ORIGIN}/`;
    const body = pickBody(item, langMode);
    const descParts = [
      body,
      url ? `Link: ${url}` : '',
      `Category: ${item.categoryLabel}`,
      `Source: ${SITE_ORIGIN}/news.json`
    ].filter(Boolean).join('\n');
    const location = pickLocation(item, langMode);
    lines.push('BEGIN:VEVENT');
    lines.push(foldIcs(`UID:${item.uid}@loopback.social`));
    lines.push(`DTSTAMP:${fmtIcsUtc(now)}`);
    lines.push(`DTSTART:${fmtIcsUtc(item.eventStart)}`);
    lines.push(`DTEND:${fmtIcsUtc(item.eventEnd)}`);
    lines.push(foldIcs(`SUMMARY:${escIcs(title)}`));
    lines.push(foldIcs(`DESCRIPTION:${escIcs(descParts)}`));
    if (url) lines.push(foldIcs(`URL:${url}`));
    if (location) lines.push(foldIcs(`LOCATION:${escIcs(location)}`));
    lines.push(foldIcs(`CATEGORIES:${escIcs(item.categoryLabel)}`));
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
};

// ---------- RSS 2.0 ----------
const RSS_TITLE = {
  mul: 'Loopback Social — Community News',
  ko: 'Loopback Social — 커뮤니티 뉴스',
  en: 'Loopback Social — Community News'
};
const RSS_DESC = {
  mul: 'Events and announcements shared across the Loopback Social community network.',
  ko: 'Loopback Social 커뮤니티 네트워크가 함께 공유하는 행사와 공지.',
  en: 'Events and announcements shared across the Loopback Social community network.'
};
const RSS_LANG = { mul: 'ko-en', ko: 'ko', en: 'en' };
const RSS_FILENAME = { mul: 'feed.xml', ko: 'feed.ko.xml', en: 'feed.en.xml' };
const buildRss = (items, now, langMode = 'mul') => {
  const rfc822 = (d) => d.toUTCString();
  const selfUrl = `${FEEDS_URL_PREFIX}/${RSS_FILENAME[langMode]}`;
  const channelItems = items
    .slice()
    .sort((a, b) => b.displayStart.getTime() - a.displayStart.getTime())
    .map((item) => {
      const title = pickTitle(item, langMode);
      const url = pickLink(item, langMode) || `${SITE_ORIGIN}/`;
      const desc = pickBody(item, langMode, { includeMeta: true });
      return [
        '    <item>',
        `      <title>${escXml(title)}</title>`,
        `      <link>${escXml(url)}</link>`,
        `      <guid isPermaLink="false">${escXml(item.uid)}</guid>`,
        `      <pubDate>${rfc822(item.displayStart)}</pubDate>`,
        `      <category>${escXml(item.categoryLabel)}</category>`,
        `      <description>${escXml(desc)}</description>`,
        '    </item>'
      ].join('\n');
    })
    .join('\n');
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escXml(RSS_TITLE[langMode])}</title>`,
    `    <link>${SITE_ORIGIN}/</link>`,
    `    <atom:link href="${selfUrl}" rel="self" type="application/rss+xml" />`,
    `    <description>${escXml(RSS_DESC[langMode])}</description>`,
    `    <language>${RSS_LANG[langMode]}</language>`,
    `    <lastBuildDate>${rfc822(now)}</lastBuildDate>`,
    `    <generator>community-network-banner build-feeds.mjs</generator>`,
    channelItems,
    '  </channel>',
    '</rss>',
    ''
  ].filter((s) => s !== '').join('\n');
};

// ---------- Atom 1.0 ----------
const ATOM_FILENAME = { mul: 'feed.atom', ko: 'feed.ko.atom', en: 'feed.en.atom' };
const ATOM_ID_SUFFIX = { mul: 'feed', ko: 'feed/ko', en: 'feed/en' };
const buildAtom = (items, now, langMode = 'mul') => {
  const iso = (d) => d.toISOString();
  const tagDate = '2026';
  const xmlLangAttr = langMode === 'mul' ? '' : ` xml:lang="${langMode}"`;
  const selfUrl = `${FEEDS_URL_PREFIX}/${ATOM_FILENAME[langMode]}`;
  const sorted = items.slice().sort((a, b) => b.displayStart.getTime() - a.displayStart.getTime());
  const entries = sorted.map((item) => {
    const title = pickTitle(item, langMode);
    const url = pickLink(item, langMode) || `${SITE_ORIGIN}/`;
    const summary = pickBody(item, langMode, { includeMeta: true });
    return [
      '  <entry>',
      `    <id>tag:loopback.social,${tagDate}:news/${escXml(item.uid)}</id>`,
      `    <title type="text">${escXml(title)}</title>`,
      `    <link rel="alternate" type="text/html" href="${escXml(url)}" />`,
      `    <published>${iso(item.displayStart)}</published>`,
      `    <updated>${iso(item.displayStart)}</updated>`,
      `    <category term="${escXml(item.categoryLabel)}" />`,
      `    <summary type="text">${escXml(summary)}</summary>`,
      '  </entry>'
    ].join('\n');
  }).join('\n');
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<feed xmlns="http://www.w3.org/2005/Atom"${xmlLangAttr}>`,
    `  <title>${escXml(RSS_TITLE[langMode])}</title>`,
    `  <subtitle>${escXml(RSS_DESC[langMode])}</subtitle>`,
    `  <link rel="alternate" type="text/html" href="${SITE_ORIGIN}/" />`,
    `  <link rel="self" type="application/atom+xml" href="${selfUrl}" />`,
    `  <id>tag:loopback.social,${tagDate}:${ATOM_ID_SUFFIX[langMode]}</id>`,
    `  <updated>${iso(now)}</updated>`,
    '  <generator uri="https://github.com/loopback-social/community-network-banner">community-network-banner build-feeds.mjs</generator>',
    entries,
    '</feed>',
    ''
  ].filter((s) => s !== '').join('\n');
};

// ---------- JSON Feed 1.1 ----------
const JSONFEED_FILENAME = { mul: 'feed.json', ko: 'feed.ko.json', en: 'feed.en.json' };
const buildJsonFeed = (items, now, langMode = 'mul') => {
  const iso = (d) => d.toISOString();
  const sorted = items.slice().sort((a, b) => b.displayStart.getTime() - a.displayStart.getTime());
  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: RSS_TITLE[langMode],
    description: RSS_DESC[langMode],
    home_page_url: `${SITE_ORIGIN}/`,
    feed_url: `${FEEDS_URL_PREFIX}/${JSONFEED_FILENAME[langMode]}`,
    icon: `${SITE_ORIGIN}/images/icons8-loop-windows-11-color-512.png`,
    favicon: `${SITE_ORIGIN}/images/icons8-loop-windows-11-color-32.png`,
    language: langTag(langMode),
    items: sorted.map((item) => {
      const out = {
        id: `${SITE_ORIGIN}/events#${item.uid}`,
        title: pickTitle(item, langMode),
        content_text: pickBody(item, langMode, { includeMeta: true }),
        date_published: iso(item.displayStart),
        date_modified: iso(item.displayStart),
        tags: [item.categoryLabel],
        // Always include raw bilingual fields so downstream tools can re-localize.
        _loopback_social: {
          message_ko: item.messageKo || null,
          message_en: item.messageEn || null,
          event_start: iso(item.eventStart),
          event_end: iso(item.eventEnd),
          location_ko: item.locationKo || null,
          location_en: item.locationEn || null
        }
      };
      const url = pickLink(item, langMode);
      if (url) out.url = url;
      return out;
    })
  };
  return JSON.stringify(feed, null, 2);
};

// ---------- OPML 2.0 ----------
// OPML acts as a "subscribe to the whole Loopback Social network" bundle.
// Per-language variants list feed URLs matching that language; the bilingual
// variant lists all three (mul/ko/en) so the importer can pick.
const OPML_LABELS = {
  mul: {
    title: 'Loopback Social — Community Network',
    own: 'Loopback Social — News',
    communities: 'Participating communities',
    rss: 'Loopback Social — News (RSS 2.0, bilingual)',
    atom: 'Loopback Social — News (Atom 1.0, bilingual)',
    json: 'Loopback Social — News (JSON Feed, bilingual)',
    rssKo: 'Loopback Social — News (RSS 2.0, 한국어)',
    atomKo: 'Loopback Social — News (Atom 1.0, 한국어)',
    jsonKo: 'Loopback Social — News (JSON Feed, 한국어)',
    rssEn: 'Loopback Social — News (RSS 2.0, English)',
    atomEn: 'Loopback Social — News (Atom 1.0, English)',
    jsonEn: 'Loopback Social — News (JSON Feed, English)'
  },
  ko: {
    title: 'Loopback Social — 커뮤니티 네트워크',
    own: 'Loopback Social 뉴스',
    communities: '참여 커뮤니티',
    rss: 'Loopback Social — 뉴스 (RSS 2.0)',
    atom: 'Loopback Social — 뉴스 (Atom 1.0)',
    json: 'Loopback Social — 뉴스 (JSON Feed)'
  },
  en: {
    title: 'Loopback Social — Community Network',
    own: 'Loopback Social — News',
    communities: 'Participating communities',
    rss: 'Loopback Social — News (RSS 2.0)',
    atom: 'Loopback Social — News (Atom 1.0)',
    json: 'Loopback Social — News (JSON Feed)'
  }
};
const opmlFeedRow = (type, title, xmlUrl) =>
  `    <outline type="${type}" text="${escXml(title)}" title="${escXml(title)}" xmlUrl="${escXml(xmlUrl)}" htmlUrl="${SITE_ORIGIN}/" />`;
const buildOpml = (communities, now, langMode = 'mul') => {
  const L = OPML_LABELS[langMode];
  // Decide which feed rows go into "Loopback Social — News".
  let ownRows;
  if (langMode === 'mul') {
    ownRows = [
      opmlFeedRow('rss', L.rss, `${FEEDS_URL_PREFIX}/feed.xml`),
      opmlFeedRow('atom', L.atom, `${FEEDS_URL_PREFIX}/feed.atom`),
      opmlFeedRow('json', L.json, `${FEEDS_URL_PREFIX}/feed.json`),
      opmlFeedRow('rss', L.rssKo, `${FEEDS_URL_PREFIX}/feed.ko.xml`),
      opmlFeedRow('atom', L.atomKo, `${FEEDS_URL_PREFIX}/feed.ko.atom`),
      opmlFeedRow('json', L.jsonKo, `${FEEDS_URL_PREFIX}/feed.ko.json`),
      opmlFeedRow('rss', L.rssEn, `${FEEDS_URL_PREFIX}/feed.en.xml`),
      opmlFeedRow('atom', L.atomEn, `${FEEDS_URL_PREFIX}/feed.en.atom`),
      opmlFeedRow('json', L.jsonEn, `${FEEDS_URL_PREFIX}/feed.en.json`)
    ].join('\n');
  } else {
    const dot = langMode === 'ko' ? '.ko' : '.en';
    ownRows = [
      opmlFeedRow('rss', L.rss, `${FEEDS_URL_PREFIX}/feed${dot}.xml`),
      opmlFeedRow('atom', L.atom, `${FEEDS_URL_PREFIX}/feed${dot}.atom`),
      opmlFeedRow('json', L.json, `${FEEDS_URL_PREFIX}/feed${dot}.json`)
    ].join('\n');
  }
  const namePref = langMode === 'en' ? 'en' : 'ko';
  const communityOutlines = communities.map((c) => {
    const name = localized(c.name, namePref) || localized(c.name, namePref === 'en' ? 'ko' : 'en') || '(unnamed)';
    const url = localized(c.url, namePref) || localized(c.url, namePref === 'en' ? 'ko' : 'en') || `${SITE_ORIGIN}/`;
    const feedUrl = c.feed ? (localized(c.feed, namePref) || localized(c.feed, namePref === 'en' ? 'ko' : 'en')) : null;
    if (feedUrl) {
      return `    <outline type="rss" text="${escXml(name)}" title="${escXml(name)}" xmlUrl="${escXml(feedUrl)}" htmlUrl="${escXml(url)}" />`;
    }
    return `    <outline text="${escXml(name)}" title="${escXml(name)}" htmlUrl="${escXml(url)}" />`;
  }).join('\n');
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<opml version="2.0">',
    '  <head>',
    `    <title>${escXml(L.title)}</title>`,
    `    <dateCreated>${now.toUTCString()}</dateCreated>`,
    `    <dateModified>${now.toUTCString()}</dateModified>`,
    '    <ownerName>Loopback Social</ownerName>',
    `    <ownerId>${SITE_ORIGIN}/</ownerId>`,
    '  </head>',
    '  <body>',
    `    <outline text="${escXml(L.own)}" title="${escXml(L.own)}">`,
    ownRows.split('\n').map((l) => '  ' + l).join('\n'),
    '    </outline>',
    `    <outline text="${escXml(L.communities)}" title="${escXml(L.communities)}">`,
    communityOutlines.split('\n').map((l) => '  ' + l).join('\n'),
    '    </outline>',
    '  </body>',
    '</opml>',
    ''
  ].join('\n');
};

// ---------- Schema.org JSON-LD ----------
const buildJsonLd = (items, communities) => {
  const events = items.map((item) => {
    const name =
      (item.messageKo && item.messageEn && item.messageKo !== item.messageEn
        ? `${item.messageKo} / ${item.messageEn}`
        : (item.messageKo || item.messageEn)) || '(untitled)';
    const url = item.linkKo || item.linkEn || undefined;
    const event = {
      '@type': 'Event',
      '@id': `${SITE_ORIGIN}/events#${item.uid}`,
      name,
      startDate: item.eventStart.toISOString(),
      endDate: item.eventEnd.toISOString(),
      eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      isAccessibleForFree: true,
      inLanguage: ['ko', 'en'],
      additionalType: item.categoryLabel
    };
    if (url) event.url = url;
    if (item.messageEn && item.messageEn !== item.messageKo) event.alternateName = item.messageEn;
    if (item.messageKo || item.messageEn) {
      event.description = [item.messageKo, item.messageEn].filter(Boolean).join(' / ');
    }
    if (item.locationKo || item.locationEn) {
      event.location = { '@type': 'Place', name: item.locationKo || item.locationEn };
    } else {
      event.location = { '@type': 'VirtualLocation', url: url || `${SITE_ORIGIN}/` };
    }
    return event;
  });
  const organizers = communities.map((c) => ({
    '@type': 'Organization',
    name: localized(c.name, 'ko') || localized(c.name, 'en'),
    alternateName: localized(c.name, 'en') || undefined,
    url: localized(c.url, 'ko') || localized(c.url, 'en')
  }));
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_ORIGIN}/#org`,
        name: 'Loopback Social',
        url: `${SITE_ORIGIN}/`,
        description: 'A loose federation of communities sharing a single banner and a shared news feed.',
        member: organizers
      },
      {
        '@type': 'ItemList',
        '@id': `${SITE_ORIGIN}/events#list`,
        name: 'Loopback Social — Community Events',
        numberOfItems: events.length,
        itemListElement: events.map((ev, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: ev
        }))
      }
    ]
  };
  return JSON.stringify(graph, null, 2);
};

// ---------- sitemap ----------
const buildSitemap = (now) => {
  const today = now.toISOString().slice(0, 10);
  const urls = [
    `${SITE_ORIGIN}/`,
    `${SITE_ORIGIN}/index.en.html`,
    `${SITE_ORIGIN}/news.json`,
    `${SITE_ORIGIN}/communities.json`,
    // Feed variants live under /feeds/. Bilingual filenames keep their original
    // (no-suffix) names within that directory.
    variantUrl('news', 'ics', ''), variantUrl('news', 'ics', '.ko'), variantUrl('news', 'ics', '.en'),
    variantUrl('feed', 'xml', ''), variantUrl('feed', 'xml', '.ko'), variantUrl('feed', 'xml', '.en'),
    variantUrl('feed', 'atom', ''), variantUrl('feed', 'atom', '.ko'), variantUrl('feed', 'atom', '.en'),
    variantUrl('feed', 'json', ''), variantUrl('feed', 'json', '.ko'), variantUrl('feed', 'json', '.en'),
    variantUrl('feeds', 'opml', ''), variantUrl('feeds', 'opml', '.ko'), variantUrl('feeds', 'opml', '.en'),
    `${FEEDS_URL_PREFIX}/events.jsonld`,
    `${SITE_ORIGIN}/llms.txt`
  ];
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((u) => `  <url><loc>${escXml(u)}</loc><lastmod>${today}</lastmod></url>`),
    '</urlset>',
    ''
  ].join('\n');
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
