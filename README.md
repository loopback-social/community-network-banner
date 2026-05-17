# community-network-banner

> 🇰🇷 **한국어** | 🇺🇸 [English](README.en.md)

[Loopback Social](https://loopback.social) 배너 리포지터리입니다.

## 소개

[Loopback Social](https://loopback.social)은 커뮤니티 간의 연대와 연합을 위한 플랫폼입니다.

이 웹사이트에서 커뮤니티 운영자는 각 커뮤니티 상단에 부착할 수 있는 검은색 띠 배너를 받을 수 있습니다. 이 배너에는 캠페인에 동참하는 다른 커뮤니티의 이름이 함께 표시됩니다.

느슨한 연결이지만, 서로 커뮤니티가 연결되어있다는 점을 어필하면서 때로는 행사 홍보 배너나 팝업을 띄우는 등 여러 수단을 접목해본다면 어떨까 하는 생각으로 이 프로젝트를 시작해보았습니다.

이 프로젝트를 통해 커뮤니티 간의 연결을 상징하고, 함께하는 캠페인으로서 운영하고자 합니다.

## Step 1. 설치하기

웹사이트에 연대 배너를 추가하려면 다음 한 줄의 코드를 HTML 파일의 `</body>` 태그 바로 앞에 추가하면 됩니다.

```html
<script src="https://loopback.social/banner.js" defer></script>
```

### 배너 옵션

`data-color` 속성으로 배너 배경색을, `data-textcolor` 속성으로 텍스트 색상을, `data-lang` 속성으로 표시 언어를 지정할 수 있습니다.

| 속성 | 설명 | 기본값 | 예시 |
| --- | --- | --- | --- |
| `data-color` | 배너 배경색 (16진수) | `#000000` | `#005a9c` |
| `data-textcolor` | 배너 텍스트/링크 색상 (16진수) | `#ffffff` | `#f0f0f0` |
| `data-lang` | 표시 언어 (`auto`, `ko`, `en`) | `auto` | `ko` |

```html
<script src="https://loopback.social/banner.js" data-color="#005a9c" data-textcolor="#ffffff" data-lang="en" defer></script>
```

`data-lang`이 `auto`이면 페이지의 `lang` 속성이나 URL을 기반으로 자동 감지합니다.

## Step 2. 참여하기

loopback.social에 참여하는 방법은 크게 두 가지입니다.

- 커뮤니티를 배너에 같이 표시되게 추가하려면, 배너 설치 후 [GitHub 저장소에 커뮤니티 등재 이슈를 제출](https://github.com/loopback-social/community-network-banner/issues/new/choose)해주세요.
- 뉴스 티커에 소식을 전하려면, 배너 설치 후 [GitHub 저장소에 뉴스 제보 등록 이슈를 제출](https://github.com/loopback-social/community-network-banner/issues/new/choose)해주세요.

이슈 양식을 제출하면 자동화 봇이 입력값을 검증하고 `docs/communities.json` 또는 `docs/news.json`에 항목을 추가하는 PR을 자동으로 생성합니다. 운영자가 PR을 검토하고 머지하면 즉시 반영됩니다.

## 뉴스 등록 가이드 (`news.json`)

배너 하단 뉴스 티커에 표시할 항목은 `docs/news.json` 파일에 아래 형식으로 추가합니다.

### 항목 형식

```json
{
  "start": "YYYY-MM-DD HH:mm:ss",
  "end": "YYYY-MM-DD HH:mm:ss",
  "timezone": "+09:00",
  "message": {
    "ko": "한국어 메시지",
    "en": "English message"
  },
  "link": "https://example.com",
  "display": true
}
```

### 필드 설명

| 필드 | 필수 | 설명 |
| --- | --- | --- |
| `start` | ✅ | 배너 표시 시작 일시 (`YYYY-MM-DD HH:mm:ss`) |
| `end` | ✅ | 배너 표시 종료 일시 (`YYYY-MM-DD HH:mm:ss`) |
| `timezone` | ❌ | 시간대. 생략 시 UTC. 오프셋(`"+09:00"`) 또는 IANA 이름(`"Asia/Seoul"`) 모두 사용 가능 (대소문자 무관) |
| `event_start` | ❌ | 실제 이벤트 시작 일시. 캘린더(`news.ics`)와 Schema.org Event 데이터에 사용. 생략 시 `start` 사용 |
| `event_end` | ❌ | 실제 이벤트 종료 일시. 생략 시 `end` 사용 |
| `category` | ❌ | `event` / `campaign` / `release` / `recruit` / `announcement` 중 하나. `event`로 지정하거나 `event_start`를 함께 넣으면 캘린더에 정확히 반영됩니다 |
| `location` | ❌ | 사람이 읽을 수 있는 장소 이름. 캘린더 `LOCATION`과 Schema.org `Event.location.name`에 사용 |
| `message` | ✅ | 표시할 메시지. 문자열 또는 `{"ko": "...", "en": "..."}` 형태의 다국어 객체 |
| `link` | ❌ | 클릭 시 이동할 URL. 문자열 또는 `{"ko": "...", "en": "..."}` 형태의 다국어 객체 |
| `display` | ✅ | 표시 여부. `true`, `"true"`, `"yes"`, `"1"` 모두 활성으로 인식 |
| `id` | ❌ | RSS GUID/iCalendar UID로 쓰일 고유 식별자. 생략 시 메시지+시작 시각으로 자동 생성 |

### 예시 1 — 단순 공지 (배너만)

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

### 예시 2 — 이벤트 (캘린더에 정확히 반영)

3월 1일부터 14일까지 배너에 노출되지만, 실제 행사는 3월 14일 14:00–17:00에 열리는 경우. `category`·`event_start`·`event_end`·`location`을 함께 지정하면 `news.ics`와 `events.jsonld`에 정확한 시각과 장소로 반영됩니다.

```json
{
  "start": "2026-03-01 00:00:00",
  "end": "2026-03-14 17:00:00",
  "timezone": "Asia/Seoul",
  "event_start": "2026-03-14 14:00:00",
  "event_end": "2026-03-14 17:00:00",
  "category": "event",
  "location": "서울 강남",
  "message": {
    "ko": "3월 정기 밋업",
    "en": "March Regular Meetup"
  },
  "link": "https://example.com/march-meetup",
  "display": true
}
```

> **참고**: `link`·`message`·`location`은 단일 문자열로도 설정할 수 있으며, 이 경우 모든 언어에 동일한 값이 사용됩니다.

## 피드 및 AI 친화적 엔드포인트

`docs/news.json`과 `docs/communities.json`이 바뀔 때마다 GitHub Actions가 다음 파일을 자동으로 다시 빌드합니다. 모두 `https://loopback.social/` 아래에 정적으로 서빙됩니다.

### 다국어 변형

피드 형식별로 세 가지 변형을 발행합니다:

- **이중 언어 (`feed.xml`, `news.ics`, …)**: 항목 제목·설명에 한국어와 영어를 모두 표기. 양쪽 언어를 다 보고 싶을 때.
- **한국어 전용 (`feed.ko.xml`, `news.ko.ics`, …)**: 한국어 텍스트만 표기 (해당 항목에 한국어가 없으면 영어로 자동 폴백).
- **영어 전용 (`feed.en.xml`, `news.en.ics`, …)**: 영어 텍스트만 표기 (해당 항목에 영어가 없으면 한국어로 자동 폴백).

배너의 "피드"/"캘린더" 버튼은 `data-lang`(또는 자동 감지)에 따라 사용자 언어에 맞는 변형 URL을 자동으로 보여줍니다.

### 형식

자동 생성되는 모든 피드(`events.jsonld` 포함)는 `https://loopback.social/feeds/` 아래에 보관됩니다. `sitemap.xml`만 검색엔진 컨벤션(`/sitemap.xml` 기본 경로)에 따라 사이트 루트에 유지됩니다.

| 경로 | 형식 | 용도 |
| --- | --- | --- |
| `/feeds/news.ics` · `/feeds/news.ko.ics` · `/feeds/news.en.ics` | iCalendar (RFC 5545) | Google/Apple/Outlook 캘린더 구독. `category: event`이거나 `event_start`가 있는 항목, 또는 7일 이내 기간의 항목만 포함 |
| `/feeds/feed.xml` · `/feeds/feed.ko.xml` · `/feeds/feed.en.xml` | RSS 2.0 | RSS 리더로 모든 활성 뉴스 항목을 수신 |
| `/feeds/feed.atom` · `/feeds/feed.ko.atom` · `/feeds/feed.en.atom` | Atom 1.0 | `feed.xml`과 동일 내용의 Atom 형식 |
| `/feeds/feed.json` · `/feeds/feed.ko.json` · `/feeds/feed.en.json` | JSON Feed 1.1 | JSON 형식. 항목마다 `_loopback_social` 확장 필드로 KO/EN 원문·이벤트 시각·장소를 함께 노출 |
| `/feeds/feeds.opml` · `/feeds/feeds.ko.opml` · `/feeds/feeds.en.opml` | OPML 2.0 | 피드 + 참여 커뮤니티 묶음. RSS 리더에서 OPML 가져오기(Import)로 네트워크 전체를 한 번에 구독 |
| `/feeds/events.jsonld` | Schema.org JSON-LD | 검색 엔진·AI 에이전트용 `Organization` + `Event` 그래프 (이중 언어 고정) |
| `/llms.txt` | Markdown | AI 에이전트용 사이트 안내. 엔드포인트 목록과 데이터 해석 방법 명시 |
| `/sitemap.xml` | XML 사이트맵 | 공개 자산 인덱스 |
| `/robots.txt` | robots.txt | 사이트맵 위치 명시, 전체 크롤링 허용 |

빌드 트리거:

- 이슈 → PR 자동화에서 `news.json`/`communities.json`을 수정한 PR을 만들 때 함께 빌드되어 PR에 포함됩니다.
- `main` 브랜치에 `news.json`/`communities.json`이 푸시되면 `build-feeds.yml`이 결과물을 자동 커밋합니다.
- 매일 00:00 UTC (09:00 KST)에도 한 번 실행되어, 만료된 항목이 자연스럽게 빠지고 `lastBuildDate`가 갱신됩니다.
- 수동으로 돌리려면: `node .github/scripts/build-feeds.mjs`

## 작동 방식

### 파일 구조

- `docs/banner.js`: 가벼운 로더 스크립트 (캐시되어도 무방)
- `docs/banner.impl.js`: 실제 배너 구현체 (타임스탬프로 캐시 무효화)
- `docs/communities.json`: 참여 커뮤니티 목록
- `docs/news.json`: 뉴스 티커 콘텐츠
- `docs/news.ics`, `docs/feed.xml`, `docs/events.jsonld`, `docs/sitemap.xml`: 자동 생성 피드 (직접 편집하지 말 것)
- `docs/llms.txt`, `docs/robots.txt`: 검색/AI 친화 메타데이터
- `docs/schemas/`: `communities.json`/`news.json` JSON Schema (CI에서 검증에 사용)
- `.github/ISSUE_TEMPLATE/`: 구조화된 제출 양식 (자동화 봇이 파싱)
- `.github/scripts/`: 양식 → JSON 변환, 피드 빌드 스크립트
- `.github/workflows/issue-to-pr.yml`: 이슈 → PR 자동화 워크플로
- `.github/workflows/build-feeds.yml`: 피드 재빌드 워크플로

### 동작 원리

1. `banner.js`가 로드되면 현재 타임스탬프를 포함한 URL로 `banner.impl.js`를 동적 로드
2. `banner.impl.js`는 페이지 상단에 검은색 띠 배너를 생성하고 삽입
3. 배너에는 `loopback.social` 제목과 커뮤니티 드롭다운 메뉴가 포함
4. 뉴스 티커는 현재 시각에 해당하는 `news.json` 항목들을 순환 표시

### 캐시 문제 해결

GitHub Pages의 캐시 문제를 해결하기 위해 2단계 로딩 구조를 사용합니다:

- `banner.js`: 항상 동일한 로더 코드 (브라우저 캐시 가능)
- `banner.impl.js`: 타임스탬프 파라미터(`?ts=`)로 강제 새로고침

이를 통해 배너 업데이트 시 즉시 반영이 가능합니다.

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 `LICENSE` 파일을 참고하세요.

## Attributions

[Site Icon (Loop)](https://icons8.com/icon/KhfdumHglzRO/synchronize) by [https://icons8.com](https://icons8.com)
