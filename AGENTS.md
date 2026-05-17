# AGENTS.md — Workspace Guide

## Project Overview

**Loopback Social** is a community banner system that fosters solidarity among developer groups by displaying a black banner strip at the top of participating websites.

### Core Features

- Website header banner insertion
- Rotating list of participating communities
- News ticker functionality
- Multi-language support (Korean/English)
- GitHub Pages–based deployment
- Machine-readable feeds for external integrations and AI agents: iCalendar, RSS 2.0, Atom 1.0, JSON Feed 1.1, OPML 2.0, Schema.org JSON-LD, `llms.txt`

---

## Architecture

### File Structure

```text
/
├── docs/                        # GitHub Pages deployment directory (served at https://loopback.social/)
│   ├── banner.js                # Lightweight cacheable loader
│   ├── banner.impl.js           # Banner implementation (cache-busted by timestamp)
│   ├── communities.json         # Participating communities (source of truth)
│   ├── news.json                # News ticker content (source of truth)
│   ├── feeds/                   # GENERATED: do-not-edit; all RSS/Atom/JSON Feed/OPML/ICS variants
│   │   ├── news{,.ko,.en}.ics       # iCalendar variants (bilingual / Korean / English)
│   │   ├── feed{,.ko,.en}.xml       # RSS 2.0 variants
│   │   ├── feed{,.ko,.en}.atom      # Atom 1.0 variants
│   │   ├── feed{,.ko,.en}.json      # JSON Feed 1.1 variants
│   │   ├── feeds{,.ko,.en}.opml     # OPML 2.0 bundle variants
│   │   └── events.jsonld            # Schema.org Organization+Event graph, always bilingual
│   ├── sitemap.xml              # GENERATED: sitemap of public assets (do not edit)
│   ├── llms.txt                 # AI-agent discovery file (endpoint inventory + interpretation hints)
│   ├── robots.txt               # Crawl directives + sitemap pointer
│   ├── schemas/                 # JSON Schemas validated in CI
│   │   ├── news.schema.json
│   │   └── communities.schema.json
│   ├── index.html               # Korean landing page
│   ├── index.en.html            # English landing page
│   └── images/                  # Icons and assets
├── .github/
│   ├── ISSUE_TEMPLATE/          # Structured issue forms parsed by automation
│   │   ├── add_request.yml      # Community submission
│   │   └── news_submission.yml  # News submission (includes event_start/event_end/category/location)
│   ├── scripts/
│   │   ├── append-community.mjs # Issue form → docs/communities.json
│   │   ├── append-news.mjs      # Issue form → docs/news.json
│   │   └── build-feeds.mjs      # Builds news.ics, feed.xml, events.jsonld, sitemap.xml
│   └── workflows/
│       ├── issue-to-pr.yml      # Issue → auto-PR; also rebuilds feeds inside the PR
│       ├── build-feeds.yml      # Rebuilds feeds on push/cron/manual dispatch
│       └── json-lint.yml        # AJV schema validation
├── README.md                    # Documentation (Korean)
├── README.en.md                 # Documentation (English)
├── AGENTS.md                    # This file
└── LICENSE                      # License
```

### Loading Flow (banner)

1. **banner.js** – Cacheable lightweight loader
2. **banner.impl.js** – Cache invalidated via timestamp query parameter
3. **Dynamic data** – Communities and news loaded from JSON in real time

### Feed Pipeline (external consumers)

1. `news.json` and `communities.json` are the only sources of truth.
2. `.github/scripts/build-feeds.mjs` reads them and writes — per supported language mode (`mul`/`ko`/`en`) — `news{,.ko,.en}.ics`, `feed{,.ko,.en}.xml`, `feed{,.ko,.en}.atom`, `feed{,.ko,.en}.json`, `feeds{,.ko,.en}.opml`, plus the always-bilingual `events.jsonld`, into `docs/feeds/`. `docs/sitemap.xml` stays at the site root by search-engine convention.
3. `build-feeds.yml` runs the script when those JSON files change on `main`, daily at 00:00 UTC, and on manual dispatch — committing the regenerated outputs.
4. `issue-to-pr.yml` also runs the script after appending to either JSON file, so submission PRs include the updated feeds for reviewer visibility.
5. Calendar inclusion rule (`news.ics`): an item is exported as a `VEVENT` only when `category === "event"`, or `event_start` is set, or the event window is ≤ 7 days. Other categories (`announcement`, `campaign`, `recruit`, `release`) still appear in `feed.xml` and `events.jsonld`.
6. Language variant rule: the suffix-less filenames (`feed.xml`, `news.ics`, …) emit bilingual content (KO/EN side-by-side). `.ko` / `.en` filenames emit only that language, falling back to the other language **per item** when the requested language is missing — so no feed variant silently loses items. The banner UI surfaces the URL variant matching the active `data-lang`.

---

## AI Agent Work Guide

### Main Work Areas

#### 1. Banner Development (`docs/banner.impl.js`)

- **Scope**: Banner UI/UX and behavior
- **Key Components**:
  - Banner DOM creation & styling
  - Community dropdown
  - News ticker rotation
  - Responsive layout
- **Considerations**:
  - Avoid CSS conflicts with host websites
  - Optimize DOM operations for performance
  - Ensure accessibility (a11y) compliance

#### 2. Data Management

- **communities.json**: Community metadata

  ```json
  {
    "name": { "ko": "Korean Name", "en": "English Name" },
    "url": "https://example.com/"
  }
  ```

- **news.json**: News items with scheduling and optional event/category metadata. Schema: `docs/schemas/news.schema.json`.

  ```json
  {
    "start": "YYYY-MM-DD HH:mm:ss",
    "end": "YYYY-MM-DD HH:mm:ss",
    "timezone": "+09:00",
    "event_start": "YYYY-MM-DD HH:mm:ss",
    "event_end": "YYYY-MM-DD HH:mm:ss",
    "category": "event",
    "location": "Seoul Gangnam",
    "message": { "ko": "Korean", "en": "English" },
    "link": { "ko": "Link", "en": "Link" },
    "display": true,
    "id": "optional-stable-id"
  }
  ```

  - `start`/`end` = banner display window. `event_start`/`event_end` = real event time, used by `news.ics`/`events.jsonld` (falls back to `start`/`end`).
  - `category` is one of `event`, `campaign`, `release`, `recruit`, `announcement`. Use `event` (or set `event_start`) when you want the item exported to the calendar.
  - `location` is a free-form venue string. Used as the iCal `LOCATION` and Schema.org `Event.location.name`.
  - `id` becomes the RSS GUID and iCal UID; auto-derived from message+start when omitted.

#### 3. Website Pages (`docs/index.html`, `docs/index.en.html`)

- **Purpose**: Project introduction and participation guide
- **Content**:
  - Overview and purpose
  - Installation instructions
  - Contribution guidelines
  - Live demo

---

## Development Practices

### JavaScript

- Use namespaces to prevent global scope pollution
- Robust error handling (network failures, JSON parsing)
- Optimize for async loading and minimal reflows
- Support major browser environments

### CSS

- Isolate banner styles from host site CSS
- Design responsively for mobile
- Ensure accessibility: sufficient contrast, keyboard navigation

### Internationalization

- Detect language via HTML `lang` or URL
- Maintain translations in JSON files
- Provide English defaults as fallback

---

## Common Workflows

### Add a Community

1. Update `docs/communities.json`
2. Add Korean/English names and URL
3. Community appears automatically in banner

### Add a News Item

1. Update `docs/news.json` (or submit via the **News submission** issue template).
2. Required: `start`, `end`, `message`, `display`. Optional: `timezone`, `link`, `event_start`, `event_end`, `category`, `location`, `id`.
3. For real events, set `category: "event"` and `event_start`/`event_end` so the entry lands in `news.ics` with the correct time. `location` populates the calendar venue and Schema.org `Event.location.name`.
4. Item rotates automatically in the banner ticker; feeds are regenerated automatically (see "Regenerate Feeds" below).

### Regenerate Feeds

- Automated: pushing changes to `docs/news.json` or `docs/communities.json` on `main` triggers `.github/workflows/build-feeds.yml`, which runs the build script and commits the updated outputs.
- Daily: a cron at 00:00 UTC also rebuilds, so expired items drop out and `lastBuildDate` stays fresh.
- Manual: `node .github/scripts/build-feeds.mjs` runs locally and writes the generated files in `docs/`.
- Never edit anything under `docs/feeds/` or the generated `docs/sitemap.xml` by hand — `build-feeds.mjs` will overwrite them.

### Improve Banner UI

1. Update inline styles in `docs/banner.impl.js`
2. Apply CSS-in-JS to avoid conflicts
3. Validate responsiveness and accessibility

### Add Features

1. Implement logic in `docs/banner.impl.js`
2. Follow namespace and error-handling patterns
3. Profile for performance impact

---

## Testing

### Local

- Simulate GitHub Pages locally
- Cross-browser compatibility checks
- Responsive testing on mobile devices

### Deployment

- Verify GitHub Pages deployment
- Confirm cache invalidation (timestamps)
- Validate bilingual rendering

---

## Troubleshooting

### Cache Problems

- `banner.js`: Highly cacheable
- `banner.impl.js`: Bust with timestamps
- JSON: May require manual cache refresh

### CSS Conflicts

- Increase selector specificity
- Use `!important` sparingly
- Reset affected host styles as needed

### Performance

- Minimize DOM manipulations
- Manage event listeners efficiently
- Optimize network requests

---

## Key Requirements

1. **Compatibility**: Must run across diverse website setups
2. **Performance**: Minimal impact on host site speed
3. **Security**: Protect against XSS and related attacks
4. **Accessibility**: Usable by all users
5. **Internationalization**: Consistent Korean/English parity

---

## Contributing

- Request community/news additions via GitHub Issues
- Submit feature changes and fixes via Pull Requests
- Contribute documentation and translations
