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

The `docs/banner.js` script dynamically creates and inserts a black banner at the top of the page when included in a website. This banner includes the project title `loopback.social` and a dropdown menu containing a list of participating communities. The community list is managed in the `communities.json` file in the same folder. The news ticker content is loaded from `news.json` and only displays items whose display period corresponds to the current time in rotation. You can edit these JSON files to add new entries or modify existing information.

## License

This project follows the MIT License. Please refer to the `LICENSE` file for details.

## Attributions

[Site Icon (Loop)](https://icons8.com/icon/KhfdumHglzRO/synchronize) by [https://icons8.com](https://icons8.com)
