# Dev Notes

매일 오전 8시(한국 시간) AI가 자료를 검색해 한국어 개발 글 초안을 PR로 만듭니다. 사람이 검토하고 병합한 글을 오전 9시에 GitHub Pages로 배포합니다. GitHub 예약 실행과 빌드에는 지연이 있어 정각 공개를 보장하지 않습니다.

저장소: https://github.com/kanghyuklee/tech

주제: QA engineering, AI tech, 프롬프트 활용, Database, Network resource, 신기술.

## 최초 설정

1. 파일을 GitHub 저장소의 `main` 브랜치에 올립니다.
2. Settings → Pages → Source를 **GitHub Actions**로 설정합니다.
3. Settings → Secrets and variables → Actions에 `OPENAI_API_KEY` 비밀값을 등록합니다. 키를 코드나 채팅에 넣지 마세요. API 호출에는 해당 계정의 사용 요금이 발생합니다.
4. Settings → Actions → General → Workflow permissions에서 **Allow GitHub Actions to create and approve pull requests**를 켭니다. 실제 워크플로는 PR 생성만 하며 승인·병합하지 않습니다.
5. Actions → **Publish blog**를 수동 실행해 첫 화면을 배포합니다.
6. Actions → **Daily AI draft** → Run workflow로 첫 초안을 생성합니다.

## 검토와 게시

PR의 Files changed에서 Markdown을 읽고 수정한 다음 **Merge pull request**를 누르면 다음 오전 9시 배포 대상이 됩니다. GitHub의 Approve 버튼만 눌러서는 게시되지 않습니다. 9시 배포 시점까지 병합하지 않은 글은 다음 날 배포됩니다. 혼자 운영하는 저장소에서도 본인이 병합할 수 있습니다. 게시하지 않을 글은 PR을 닫으세요. 같은 날짜의 정기 PR이 있으면 재실행 시 추가 초안을 만들지 않습니다.

승인되지 않은 글은 별도 브랜치에 있으므로 블로그에 게시되지 않습니다. 다만 공개 저장소에서는 PR 초안도 공개됩니다. 초안까지 비공개여야 하면 저장소 공개 범위와 Pages 요금제 지원을 별도로 정하세요.

배포는 매일 9시 예약 또는 Publish blog 수동 실행으로만 수행합니다. 병합 자체는 즉시 배포하지 않습니다. 팀으로 운영한다면 저장소 Rulesets에서 main에 PR을 필수로 설정하세요. 리뷰 체크박스 자체는 기술적 병합 잠금이 아닙니다. GITHUB_TOKEN으로 생성한 PR의 후속 워크플로 실행에는 GitHub의 제한이 있어 생성 작업에서 테스트하고, 배포할 때 main을 빌드합니다.

## 원하는 주제로 바로 초안 만들기

Actions → **Daily AI draft** → Run workflow → `topic`에 원하는 주제를 입력하세요. 예: `Playwright에서 flaky test를 줄이는 실무 방법`. 정기 초안과 별개의 PR이 만들어집니다. 대화에서 원하는 주제를 말해 자료 조사와 초안 작성을 요청해도 됩니다. 별도 주제 글도 검토·병합 후 다음 오전 9시에 게시됩니다. 즉시 배포하려면 글의 `date`를 현재 이하로 수정하고 병합한 뒤 **Publish blog**를 수동 실행하세요.

## 설정 변경

- 블로그 이름·소개: `_config.yml`
- 글 주제·독자·언어·모델: `blog.config.json`
- 모델만 덮어쓰기: Actions 변수 `OPENAI_MODEL` (계정에서 사용 가능한 Responses API 모델 ID)
- 생성 시각: `.github/workflows/daily-draft.yml`의 UTC cron (23:00 UTC = 다음 날 08:00 KST)
- 게시 시각: `.github/workflows/pages.yml`의 UTC cron (00:00 UTC = 09:00 KST)

AI는 Responses API의 웹 검색을 사용하고 공식 문서·원문 논문·공식 발표를 우선 참고합니다. 검색을 수행하지 못하거나 응답이 잘리면 PR을 만들지 않습니다. 검색 및 모델 사용료가 발생합니다. 참고 링크와 코드 정확성은 게시 전에 검토해야 합니다. 최근 게시글 40개의 제목을 중복 회피 참고로 제공하지만 의미상 중복을 완전히 보장하지는 않습니다.

## 로컬 확인

Node.js 22 이상에서 `npm test`로 생성 응답 검증과 한국 날짜 경계 테스트를 실행합니다. 초안 생성은 환경변수 `OPENAI_API_KEY`를 설정한 뒤 `npm run draft`로 실행합니다. 사이트 렌더링은 GitHub Actions의 Jekyll 빌드가 담당합니다.

공식 문서: [GitHub Pages 배포](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [OpenAI 텍스트 생성](https://developers.openai.com/api/docs/guides/text).
