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

## Step 2. 참여하기

loopback.social에 참여하는 방법은 크게 두 가지입니다.

- 커뮤니티를 배너에 같이 표시되게 추가하려면, 배너 설치 후 [GitHub 저장소에 커뮤니티 등재 이슈를 제출](https://github.com/loopback-social/community-network-banner/issues/new/choose)해주세요.
- 뉴스 티커에 소식을 전하려면, 배너 설치 후 [GitHub 저장소에 뉴스 제보 등록 이슈를 제출](https://github.com/loopback-social/community-network-banner/issues/new/choose)해주세요.

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
|------|------|------|
| `start` | ✅ | 표시 시작 일시 (`YYYY-MM-DD HH:mm:ss`) |
| `end` | ✅ | 표시 종료 일시 (`YYYY-MM-DD HH:mm:ss`) |
| `timezone` | ❌ | 시간대. 생략 시 UTC. 오프셋(`"+09:00"`) 또는 IANA 이름(`"Asia/Seoul"`) 모두 사용 가능 (대소문자 무관) |
| `message` | ✅ | 표시할 메시지. 문자열 또는 `{"ko": "...", "en": "..."}` 형태의 다국어 객체 |
| `link` | ❌ | 클릭 시 이동할 URL. 문자열 또는 `{"ko": "...", "en": "..."}` 형태의 다국어 객체 |
| `display` | ✅ | 표시 여부. `true`, `"true"`, `"yes"`, `"1"` 모두 활성으로 인식 |

### 예시

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

> **참고**: `link`와 `message`는 단일 문자열로도 설정할 수 있으며, 이 경우 모든 언어에 동일한 값이 사용됩니다.

## 작동 방식

### 파일 구조

- `docs/banner.js`: 가벼운 로더 스크립트 (캐시되어도 무방)
- `docs/banner.impl.js`: 실제 배너 구현체 (타임스탬프로 캐시 무효화)
- `docs/communities.json`: 참여 커뮤니티 목록
- `docs/news.json`: 뉴스 티커 콘텐츠

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
