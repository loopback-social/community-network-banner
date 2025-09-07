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

## Step 2. Participation

There are two main ways to participate in loopback.social:

- To add your community to be displayed on the banner together, [submit a community listing issue to the GitHub repository](https://github.com/loopback-social/community-network-banner/issues/new/choose) after installing the banner.
- To share news in the news ticker, [submit a news submission issue to the GitHub repository](https://github.com/loopback-social/community-network-banner/issues/new/choose) after installing the banner.

## How It Works

### File Structure

- `docs/banner.js`: Lightweight loader script (cacheable)
- `docs/banner.impl.js`: Actual banner implementation (cache-busted with timestamp)
- `docs/communities.json`: List of participating communities
- `docs/news.json`: News ticker content

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
