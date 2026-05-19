#!/usr/bin/env node
// Aggregate per-community Loopback Social news sources into docs/news.network.json.
//
// Reads docs/communities.json, fetches each community's network_url(s), validates
// the response against docs/schemas/news.schema.json, and picks the top-N most
// recent active items per community:
//   - network_url as a single string → top-2 from that URL
//   - network_url as { ko, en } with both → top-1 from each URL (one per language)
//   - { ko } / { en } only → top-2 from that one URL
//
// Each picked item is stamped with a `_source` object so the banner and feed
// builder can attribute it to a community. Items older than 30 days (by `end`)
// are dropped on every run. Fetch and validation failures are logged but never
// fail the run — a broken community source must not block the rest.
//
// Run locally: `node .github/scripts/aggregate-network.mjs`
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import Ajv from 'ajv';

const COMMUNITIES_PATH = resolve('docs/communities.json');
const NEWS_SCHEMA_PATH = resolve('docs/schemas/news.schema.json');
const OUTPUT_PATH = resolve('docs/news.network.json');

const FETCH_TIMEOUT_MS = 10_000;
const MAX_RESPONSE_BYTES = 1_000_000; // 1 MB hard cap to bound damage from runaway sources
const TTL_DAYS = 30;

// ---------- helpers (mirrors build-feeds.mjs) ----------
const isTruthy = (v) =>
  v === true ||
  (typeof v === 'string' && ['true', 'yes', '1'].includes(v.trim().toLowerCase()));

const localized = (value, lang) => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') return value[lang] || value.ko || value.en || '';
  return '';
};

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

const slugify = (name) =>
  String(name).toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'community';

const hashItem = (item) =>
  createHash('sha1')
    .update(`${item.start || ''}|${localized(item.message, 'ko') || localized(item.message, 'en') || ''}`)
    .digest('hex')
    .slice(0, 16);

// ---------- fetch with timeout + size limit ----------
const fetchWithLimits = async (url) => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const resp = await fetch(url, { signal: ctrl.signal, redirect: 'follow' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const lenHeader = resp.headers.get('content-length');
    if (lenHeader && Number(lenHeader) > MAX_RESPONSE_BYTES) {
      throw new Error(`content-length ${lenHeader} exceeds ${MAX_RESPONSE_BYTES} bytes`);
    }
    const reader = resp.body.getReader();
    const chunks = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > MAX_RESPONSE_BYTES) throw new Error(`response exceeded ${MAX_RESPONSE_BYTES} bytes`);
      chunks.push(value);
    }
    const text = Buffer.concat(chunks.map((c) => Buffer.from(c))).toString('utf8');
    return JSON.parse(text);
  } finally {
    clearTimeout(timer);
  }
};

// ---------- picking ----------
const pickActive = (items, now) => {
  return items
    .filter((it) => isTruthy(it.display))
    .map((it) => {
      try {
        const start = parseLocal(it.start, it.timezone);
        const end = parseLocal(it.end, it.timezone);
        if (!start || !end) return null;
        return { item: it, start, end };
      } catch {
        return null;
      }
    })
    .filter((x) => x && x.start <= now && now <= x.end)
    .sort((a, b) => b.start.getTime() - a.start.getTime());
};

const stripInternal = (item) => {
  // Defensive: strip any pre-existing _source the community may have left in
  // the payload; we set our own.
  const { _source, ...rest } = item;
  return rest;
};

const resolveSources = (networkUrl) => {
  if (typeof networkUrl === 'string') {
    return [{ url: networkUrl, lang: null, perSourceLimit: 2 }];
  }
  if (networkUrl && typeof networkUrl === 'object') {
    const koUrl = networkUrl.ko;
    const enUrl = networkUrl.en;
    if (koUrl && enUrl && koUrl !== enUrl) {
      return [
        { url: koUrl, lang: 'ko', perSourceLimit: 1 },
        { url: enUrl, lang: 'en', perSourceLimit: 1 }
      ];
    }
    const url = koUrl || enUrl;
    if (!url) return [];
    return [{ url, lang: koUrl ? 'ko' : 'en', perSourceLimit: 2 }];
  }
  return [];
};

// ---------- main ----------
const main = async () => {
  const ajv = new Ajv({ strict: false, allErrors: true });
  const schema = JSON.parse(await readFile(NEWS_SCHEMA_PATH, 'utf8'));
  const validate = ajv.compile(schema);

  const communities = JSON.parse(await readFile(COMMUNITIES_PATH, 'utf8'));
  if (!Array.isArray(communities)) throw new Error('communities.json must be a JSON array');

  const now = new Date();
  const failures = [];
  const collected = [];

  for (const community of communities) {
    const sources = resolveSources(community.network_url);
    if (sources.length === 0) continue;

    const nameKo = localized(community.name, 'ko');
    const nameEn = localized(community.name, 'en');
    const displayName = nameKo || nameEn || 'unnamed';
    const slug = slugify(nameKo || nameEn);
    const sourceMeta = {
      community: slug,
      community_name: typeof community.name === 'string'
        ? community.name
        : { ko: nameKo || null, en: nameEn || null },
      community_url: localized(community.url, 'ko') || localized(community.url, 'en') || null
    };

    // Per-community dedup so the same item appearing in both ko and en URLs
    // surfaces only once.
    const seen = new Set();

    for (const source of sources) {
      let data;
      try {
        data = await fetchWithLimits(source.url);
      } catch (err) {
        failures.push({ community: slug, url: source.url, reason: 'fetch', error: String(err) });
        continue;
      }
      if (!validate(data)) {
        failures.push({
          community: slug,
          url: source.url,
          reason: 'schema',
          errors: validate.errors?.slice(0, 5)
        });
        continue;
      }
      const active = pickActive(data, now);
      let added = 0;
      for (const { item } of active) {
        if (added >= source.perSourceLimit) break;
        const key = item.id || hashItem(item);
        if (seen.has(key)) continue;
        seen.add(key);
        collected.push({
          ...stripInternal(item),
          _source: {
            ...sourceMeta,
            source_url: source.url,
            lang: source.lang
          }
        });
        added++;
      }
      if (active.length === 0) {
        console.log(`  - ${displayName} <${source.url}>: no active items`);
      } else {
        console.log(`  - ${displayName} <${source.url}>: picked ${added}/${active.length} active item(s)`);
      }
    }
  }

  // TTL: drop items whose `end` is more than TTL_DAYS days in the past.
  const ttlCutoff = new Date(now.getTime() - TTL_DAYS * 24 * 60 * 60 * 1000);
  const filtered = collected.filter((it) => {
    try {
      const end = parseLocal(it.end, it.timezone);
      return end && end >= ttlCutoff;
    } catch {
      return false;
    }
  });

  await writeFile(OUTPUT_PATH, JSON.stringify(filtered, null, 2) + '\n', 'utf8');

  console.log('');
  console.log(`Aggregated ${filtered.length} item(s) into ${OUTPUT_PATH}`);
  if (failures.length > 0) {
    console.log('');
    console.log(`Failures (${failures.length}):`);
    for (const f of failures) {
      const tail = f.reason === 'schema'
        ? ` schema errors: ${JSON.stringify(f.errors)}`
        : f.error ? ` (${f.error})` : '';
      console.log(`  - ${f.community} <${f.url}>: ${f.reason}${tail}`);
    }
    // Surface failures in GitHub Actions UI without failing the whole step —
    // one bad source must not block aggregation of the rest.
    if (process.env.GITHUB_OUTPUT) {
      const summary = failures.map((f) => `${f.community}: ${f.reason}`).join('; ');
      console.log(`::warning::network aggregator failures: ${summary}`);
    }
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
