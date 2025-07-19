# community-network-banner

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

커뮤니티를 배너에 같이 표시되게 추가하려면, 배너 설치 후 [GitHub 저장소에 이슈를 제출](https://github.com/dotnetdev-kr/community-network-banner/issues/new/choose)를해주세요.

## Step 3. 뉴스 제보하기

배너 하단 뉴스 티커에 표시할 새 소식을 추가하려면 `docs/news.json` 파일을 수정하거나 GitHub 이슈 템플릿 중 **뉴스 제보 등록**을 사용해 제보할 수 있습니다.

## 작동 방식

`docs/banner.js` 스크립트는 웹사이트에 포함될 때 페이지 상단에 검은색 띠 배너를 동적으로 생성하고 삽입합니다. 이 배너에는 `loopback.social`이라는 프로젝트 제목과 참여 커뮤니티 목록이 포함된 드롭다운 메뉴가 표시됩니다. 커뮤니티 목록은 같은 폴더의 `communities.json` 파일에서 관리됩니다. 뉴스 티커의 내용은 `news.json`에서 불러오며, 표시 기간이 현재 시각에 해당하는 항목만 순환해 보여줍니다. 이 JSON 파일들을 편집해 새로운 항목을 추가하거나 기존 정보를 수정할 수 있습니다.

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 `LICENSE` 파일을 참고하세요.

## Attributions

[Site Icon (Loop)](https://icons8.com/icon/KhfdumHglzRO/synchronize) by [https://icons8.com](https://icons8.com)
