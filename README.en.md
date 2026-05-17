# community-network-banner

> 🇰🇷 [한국어](README.md) | 🇺🇸 **English**

[Loopback Social](https://loopback.social) banner repository.

## Introduction

[Loopback Social](https://loopback.social) is a platform for solidarity and federation among communities.

Through this website, community administrators can obtain a black banner that can be attached to the top of each community. This banner displays the names of other communities participating in the campaign.

Though it's a loose connection, we started this project with the idea of appealing that communities are connected to each other, and sometimes incorporating various means such as event promotion banners or pop-ups.

Through this project, we aim to symbolize connections between communities and operate as a collaborative campaign.

## Step 1. Installation

To add a solidarity banner to your website, simply add the following line of code just before the `</body>` tag in your HTML file.

```html
<script src="https://loopback.social/banner.js" defer></script>
```

### Banner Options

Use the `data-color` attribute to set the banner background color, `data-textcolor` to set the text color, and `data-lang` to set the display language.

| Attribute | Description | Default | Example |
| --- | --- | --- | --- |
| `data-color` | Banner background color (hex) | `#000000` | `#005a9c` |
| `data-textcolor` | Banner text/link color (hex) | `#ffffff` | `#f0f0f0` |
| `data-lang` | Display language (`auto`, `ko`, `en`) | `auto` | `ko` |

```html
<script src="https://loopback.social/banner.js" data-color="#005a9c" data-textcolor="#ffffff" data-lang="en" defer></script>
```

When `data-lang` is set to `auto`, the language is automatically detected from the page's `lang` attribute or URL.

## Step 2. Participation

There are two main ways to participate in loopback.social:

- To add your community to be displayed on the banner together, [submit a community listing issue to the GitHub repository](https://github.com/loopback-social/community-network-banner/issues/new/choose) after installing the banner.
- To share news in the news ticker, [submit a news submission issue to the GitHub repository](https://github.com/loopback-social/community-network-banner/issues/new/choose) after installing the banner.

Once you submit the issue form, an automation bot validates the inputs and opens a pull request that appends the entry to `docs/communities.json` or `docs/news.json`. A maintainer reviews and merges the PR, and the change goes live immediately.

## News Registration Guide (`news.json`)

To add items to the news ticker at the bottom of the banner, add entries to the `docs/news.json` file in the following format.

### Item Format

```json
{
  "start": "YYYY-MM-DD HH:mm:ss",
  "end": "YYYY-MM-DD HH:mm:ss",
  "timezone": "+09:00",
  "message": {
    "ko": "Korean message",
    "en": "English message"
  },
  "link": "https://example.com",
  "display": true
}
```

### Field Reference

| Field | Required | Description |
| --- | --- | --- |
| `start` | ✅ | Banner display start (`YYYY-MM-DD HH:mm:ss`) |
| `end` | ✅ | Banner display end (`YYYY-MM-DD HH:mm:ss`) |
| `timezone` | ❌ | Timezone. Defaults to UTC if omitted. Accepts both UTC offsets (`"+09:00"`) and IANA names (`"Asia/Seoul"`, case-insensitive) |
| `event_start` | ❌ | Actual event start datetime, used by `news.ics` and the Schema.org Event payload. Falls back to `start` |
| `event_end` | ❌ | Actual event end datetime. Falls back to `end` |
| `category` | ❌ | One of `event` / `campaign` / `release` / `recruit` / `announcement`. Setting `event` (or providing `event_start`) ensures the item appears in the calendar feed |
| `location` | ❌ | Human-readable venue name. Used as the calendar `LOCATION` and Schema.org `Event.location.name` |
| `message` | ✅ | Message to display. Either a plain string or a localized object `{"ko": "...", "en": "..."}` |
| `link` | ❌ | URL to navigate on click. Either a plain string or a localized object `{"ko": "...", "en": "..."}` |
| `display` | ✅ | Whether to show the item. Accepts `true`, `"true"`, `"yes"`, or `"1"` as enabled |
| `id` | ❌ | Stable identifier used as the RSS GUID / iCalendar UID. Derived from message+start when omitted |

### Example 1 — Simple announcement (banner only)

```json
{
  "start": "2026-03-01 00:00:00",
  "end": "2026-03-31 23:59:59",
  "timezone": "Asia/Seoul",
  "message": {
    "ko": "3월 밋업에 참여하세요!",
    "en": "Join our March meetup!"
  },
  "link": {
    "ko": "https://example.com/ko",
    "en": "https://example.com/en"
  },
  "display": true
}
```

### Example 2 — Event (correctly surfaced in the calendar feed)

The entry below appears in the banner from March 1 through March 14, but the actual event runs on March 14, 14:00–17:00. Combining `category`, `event_start`, `event_end`, and `location` ensures `news.ics` and `events.jsonld` reflect the exact event time and venue.

```json
{
  "start": "2026-03-01 00:00:00",
  "end": "2026-03-14 17:00:00",
  "timezone": "Asia/Seoul",
  "event_start": "2026-03-14 14:00:00",
  "event_end": "2026-03-14 17:00:00",
  "category": "event",
  "location": "Seoul Gangnam",
  "message": {
    "ko": "3월 정기 밋업",
    "en": "March Regular Meetup"
  },
  "link": "https://example.com/march-meetup",
  "display": true
}
```

> **Note**: `link`, `message`, and `location` can also be set as a single string, in which case the same value is used for all languages.

## Feeds & AI-Friendly Endpoints

Every time `docs/news.json` or `docs/communities.json` changes, GitHub Actions rebuilds the following files. They are served as static assets under `https://loopback.social/`.

### Per-language variants

Every feed format is published in three variants:

- **Bilingual** (no language suffix, e.g. `feed.xml`, `news.ics`): item titles/descriptions include both Korean and English.
- **Korean only** (`.ko` suffix, e.g. `feed.ko.xml`): Korean text only; falls back to English when an item has no Korean message.
- **English only** (`.en` suffix, e.g. `feed.en.xml`): English text only; falls back to Korean when an item has no English message.

The banner's "Feed"/"Calendar" buttons automatically point at the variant matching the active `data-lang` (or auto-detected) language, so subscribers won't see content they can't read.

### Formats

All auto-generated feeds (including `events.jsonld`) live under `https://loopback.social/feeds/`. Only `sitemap.xml` stays at the site root, because search engines look for it at the default `/sitemap.xml` path.

| Path | Format | Purpose |
| --- | --- | --- |
| `/feeds/news.ics` · `/feeds/news.ko.ics` · `/feeds/news.en.ics` | iCalendar (RFC 5545) | Subscribe in Google/Apple/Outlook Calendar. Only items with `category: event`, an `event_start`, or a duration ≤ 7 days are included |
| `/feeds/feed.xml` · `/feeds/feed.ko.xml` · `/feeds/feed.en.xml` | RSS 2.0 | All active news items, for RSS readers |
| `/feeds/feed.atom` · `/feeds/feed.ko.atom` · `/feeds/feed.en.atom` | Atom 1.0 | Same content in Atom format. Non-bilingual variants carry `xml:lang` |
| `/feeds/feed.json` · `/feeds/feed.ko.json` · `/feeds/feed.en.json` | JSON Feed 1.1 | Every item — regardless of variant — carries `_loopback_social` with raw `message_ko`/`message_en`/`event_start`/`event_end`/`location_ko`/`location_en` |
| `/feeds/feeds.opml` · `/feeds/feeds.ko.opml` · `/feeds/feeds.en.opml` | OPML 2.0 | Bundle of our feeds + participating-community collection. Import in any RSS reader to subscribe to the whole network in one step |
| `/feeds/events.jsonld` | Schema.org JSON-LD | `Organization` + `Event` graph (always bilingual structured data) |
| `/llms.txt` | Markdown | Discovery file for AI agents — lists endpoints and explains how to interpret the data |
| `/sitemap.xml` | XML sitemap | Index of public assets |
| `/robots.txt` | robots.txt | Points at the sitemap and allows full crawling |

Build triggers:

- The issue-to-PR automation runs the feed builder when it opens a PR, so the PR already contains the regenerated feeds.
- Pushes to `main` that touch `news.json` or `communities.json` trigger `build-feeds.yml`, which auto-commits the result.
- A daily cron at 00:00 UTC (09:00 KST) rebuilds even without data changes, so expired items drop out and `lastBuildDate` stays fresh.
- To run locally: `node .github/scripts/build-feeds.mjs`

## How It Works

### File Structure

- `docs/banner.js`: Lightweight loader script (cacheable)
- `docs/banner.impl.js`: Actual banner implementation (cache-busted with timestamp)
- `docs/communities.json`: List of participating communities
- `docs/news.json`: News ticker content
- `docs/news.ics`, `docs/feed.xml`, `docs/events.jsonld`, `docs/sitemap.xml`: Auto-generated feeds (do not edit by hand)
- `docs/llms.txt`, `docs/robots.txt`: Search/AI discovery metadata
- `docs/schemas/`: JSON Schemas for `communities.json`/`news.json` (used by CI validation)
- `.github/ISSUE_TEMPLATE/`: Structured submission forms (parsed by automation)
- `.github/scripts/`: Form-to-JSON conversion and feed-build scripts
- `.github/workflows/issue-to-pr.yml`: Issue → PR automation workflow
- `.github/workflows/build-feeds.yml`: Feed rebuild workflow

### Operation

1. When `banner.js` loads, it dynamically loads `banner.impl.js` with a timestamped URL
2. `banner.impl.js` creates and inserts a black banner at the top of the page
3. The banner includes the `loopback.social` title and community dropdown menu
4. The news ticker displays `news.json` items in rotation that match the current time

### Cache Problem Resolution

To resolve GitHub Pages caching issues, we use a two-stage loading structure:

- `banner.js`: Always the same loader code (browser cacheable)
- `banner.impl.js`: Forced refresh with timestamp parameter (`?ts=`)

This enables immediate reflection when the banner is updated.

## License

This project follows the MIT License. Please refer to the `LICENSE` file for details.

## Attributions

[Site Icon (Loop)](https://icons8.com/icon/KhfdumHglzRO/synchronize) by [https://icons8.com](https://icons8.com)
