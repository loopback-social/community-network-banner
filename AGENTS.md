# AGENTS.md — Workspace Guide

## Project Overview

**Loopback Social** is a community banner system that fosters solidarity among developer groups by displaying a black banner strip at the top of participating websites.

### Core Features

- Website header banner insertion
- Rotating list of participating communities
- News ticker functionality
- Multi-language support (Korean/English)
- GitHub Pages–based deployment

---

## Architecture

### File Structure

```text
/
├── docs/                        # GitHub Pages deployment directory
│   ├── banner.js                # Lightweight cacheable loader
│   ├── banner.impl.js           # Banner implementation (cache-busted by timestamp)
│   ├── communities.json         # Participating communities data
│   ├── news.json                # News ticker content
│   ├── index.html               # Korean landing page
│   ├── index.en.html            # English landing page
│   └── images/                  # Icons and assets
├── README.md                    # Documentation (Korean)
├── README.en.md                 # Documentation (English)
└── LICENSE                      # License
```

### Loading Flow

1. **banner.js** – Cacheable lightweight loader
2. **banner.impl.js** – Cache invalidated via timestamp query parameter
3. **Dynamic data** – Communities and news loaded from JSON in real time

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

- **news.json**: News items with scheduling

  ```json
  {
    "start": "YYYY-MM-DD HH:mm:ss",
    "end": "YYYY-MM-DD HH:mm:ss",
    "timezone": "+09:00",
    "message": { "ko": "Korean", "en": "English" },
    "link": { "ko": "Link", "en": "Link" },
    "display": true
  }
  ```

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

1. Update `docs/news.json`
2. Configure dates, messages, and links
3. Item rotates automatically in ticker

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
