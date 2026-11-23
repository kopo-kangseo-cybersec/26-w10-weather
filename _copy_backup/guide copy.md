# guide.md — 실시간 날씨·미세먼지 대시보드 (`26-w10-weather`)

> 이 문서는 실습 중 계속 펴놓고 따라가는 매뉴얼입니다.
> 수업 시간(총 130분) 내에 배포와 제출까지 깔끔하게 완료할 수 있도록 단계별로 구성되어 있습니다.

---

## 🌟 오늘 우리는 무엇을 경험하나요

8~9주차에는 GitHub Codespaces 환경에서 Copilot을 활용해 클라우드 데이터베이스 연동 일기장을 만들었습니다.
오늘은 내 컴퓨터(로컬)에서 **구글의 차세대 AI 코딩 IDE인 Antigravity**를 처음으로 사용하고, **전 세계 기상 데이터를 실시간 제공하는 외부 공개 API(Open-Meteo)**를 React와 연동합니다.

- **차세대 AI IDE (Antigravity)**: 코드를 무작정 짜지 않고, 먼저 완벽한 **구현 계획(Implementation Plan)**을 세우고 코드를 작성한 뒤 스스로 검증하는 **Walkthrough(검증 리포트)**까지 보여주는 에이전트의 자율성을 체감합니다.
- **점진적 2단계 빌드업**: 친숙한 Vite 기본 화면에서 시작하여, **[프롬프트 1: 기본 화면] → [프롬프트 2: 대시보드 고도화]**로 차근차근 확장되는 계획 수립 과정을 경험합니다.
- **나만의 개성 더하기**: 기본 완성 후 준비된 **예비 옵션 목록 중 1~2개를 자유롭게 선택**하여 나만의 스마트 기상 대시보드를 완성합니다.
- **실무 개발자의 Git 커밋 위임**: 한 줄짜리 빈약한 커밋 대신, **프로젝트 규칙(Rules)**을 기반으로 Antigravity 에이전트에게 고품질 커밋 작성을 위임하는 법을 배웁니다.
- **사이버보안과의 눈**: 완전 공개된 API와 비밀 키가 필요한 보안 API의 아키텍처 차이, CORS, HTTPS 혼합 콘텐츠(Mixed Content) 방어, API 호출 남용을 막는 디바운싱(Debounce) 원리를 배웁니다.

---

## ⏱️ 오늘의 수업 타임라인 (총 130분)

시간 지연 없이 모두가 성공적으로 완성할 수 있도록 아래 타임라인을 엄수해 주세요.

- **[준비 10분]** Fork, Node.js 확인/설치, Antigravity IDE 실행 및 작업 폴더 열기
- **[1교시 45분]** Vite 기본 화면 실행 확인 → 외부 API 통신 모듈(`src/api/weather.js`) 탐색 → **[프롬프트 1: 기본 날씨 화면 구축]** → 1차 커밋
- *(휴식 15분)*
- **[2교시 45분]** **[프롬프트 2: 대시보드 고도화]** → 2차 커밋 → **[예비 옵션 1~2개 선택 적용]** → 3차 커밋
- *(휴식 15분)*
- **[3교시 30분]** 브랜치 병합(`dev`) → `README.md` 작성 → 듀얼 배포 (Netlify & Pages) → PR 제출

---

## 오늘의 브랜치 구조

```
main              (원본 보관 — 절대 merge하지 않습니다)
 └─ dev           (작업 통합 브랜치, PR 제출 기준)
     ├─ weather   (대시보드 기능 구현 브랜치 — 완성 후 dev로 merge)
     └─ gh-pages  (GitHub Pages 배포 시 빌드 결과물 자동 푸시)
```

- `main`은 처음 Fork했을 때 상태 그대로 보관하는 원본 베이스라인입니다.
- 모든 작업과 PR(Pull Request) 제출은 `dev` 브랜치를 기준으로 진행합니다.

---

## 0단계 — 로컬 개발 환경 준비 (Node.js & Antigravity)

> 💡 Codespaces와 달리 내 컴퓨터에 Node.js가 깔려 있지 않을 수 있습니다. 1분 만에 설치하고 확인합니다!

### 1. Node.js 설치 확인
터미널(또는 명령 프롬프트 / PowerShell)을 열고 아래 명령어를 입력합니다:
```bash
node -v
npm -v
```
- `v20.x.x` 또는 `v22.x.x` 같은 버전 번호가 나오면 이미 설치된 것입니다. 바로 다음으로 넘어가세요.
- **명령어를 찾을 수 없다고 나온다면 즉시 설치합니다:**
  - **공식 사이트**: [nodejs.org](https://nodejs.org)에 접속하여 **LTS (안정화 버전)** 인스톨러를 다운로드받아 기본 설정으로 설치합니다.
  - 설치 후 터미널 창을 완전히 닫았다가 다시 열어 `node -v`를 확인합니다.

### 2. Antigravity IDE 실행
- 내 컴퓨터에 설치된 **Antigravity IDE**를 실행하고, 본인의 Google 계정으로 로그인되어 있는지 확인합니다.

---

## 1단계 — Fork & 로컬 Clone

1. GitHub에서 [`26-w10-weather`](https://github.com/kopo-kangseo-cybersec/26-w10-weather) 저장소를 본인 계정으로 **Fork**합니다.
   - *Copy the `main` branch only* 체크는 그대로 둡니다.
2. 내 컴퓨터의 작업 폴더(예: `C:\Users\내계정\repos` 또는 `~/repos`)에서 내 Fork 저장소를 Clone합니다:
   ```bash
   git clone https://github.com/<내-GitHub-아이디>/26-w10-weather.git
   cd 26-w10-weather
   ```
3. **Antigravity IDE**에서 이 `26-w10-weather` 폴더를 엽니다. (File → Open Folder)

---

## 2단계 — `dev` 브랜치 생성 및 Vite 초기 화면 구동 확인

1. Antigravity IDE 하단 터미널에서 `dev` 브랜치를 생성하고 원격에 푸시합니다:
   ```bash
   git checkout -b dev
   git push -u origin dev
   ```
2. 프로젝트 패키지 설치:
   ```bash
   npm install
   ```
   > 💡 `package.json`에 React 19, Vite, 그리고 날씨 아이콘 라이브러리인 `lucide-react`가 이미 사전 등록되어 있습니다.
3. 로컬 개발 서버 구동:
   ```bash
   npm run dev
   ```
4. 브라우저에서 `http://localhost:5173`을 열어 익숙한 **"Vite + React (Get started / Count 버튼)"** 초기 화면이 정상 동작하는지 확인합니다!
5. 확인 후 터미널에서 `Ctrl + C`를 눌러 서버를 잠시 멈추거나 그대로 켜둡니다.

---

## 3단계 — 외부 API 구조 및 보안 아키텍처 이해

코드 작성을 시작하기 전에, 우리가 사용할 Open-Meteo API의 특징과 보안 규칙을 살펴봅니다.

```
[클라이언트: React 앱]
        │
        ├── 1. 날씨 조회 요청 (HTTPS) ──────> https://api.open-meteo.com/v1/forecast
        ├── 2. 미세먼지 요청 (HTTPS) ─────> https://air-quality-api.open-meteo.com/v1/air-quality
        └── 3. 도시 검색 요청 (HTTPS) ──────> https://geocoding-api.open-meteo.com/v1/search
```

### 🛡️ 사이버보안과 핵심 체크포인트
1. **Public API vs Private/Secret API (키 분리와 백엔드의 필요성)**:
   - 9주차 Supabase에서는 `publishable key`를 프론트엔드에 넣었습니다.
   - 10주차 Open-Meteo는 키가 아예 필요 없는 완전 공개 API입니다.
   - **생각해 볼 점**: 만약 결제 모듈이나 사내 회원정보처럼 비밀 키(`secret key`)가 필요한 유료 API라면, React 프론트엔드 코드에서 직접 호출해도 될까요? **절대 안 됩니다!** 브라우저 Network 탭이나 배포된 자바스크립트 파일에서 키가 100% 노출되어 거액의 과금이나 데이터 유출 사고가 발생합니다. 이런 경우 반드시 **백엔드 프록시 서버(BFF, Backend For Frontend)**를 두어 서버에서 비밀 키를 숨겨 호출해야 합니다.
2. **CORS와 Mixed Content (HTTPS 암호화)**:
   - 배포 사이트가 `https://` 보안 프로토콜을 쓸 때, API 호출을 `http://`로 하면 브라우저 보안 정책에 의해 통신이 강제 차단됩니다(Mixed Content). Open-Meteo의 모든 엔드포인트는 안전한 HTTPS를 사용합니다.
3. **디바운스(Debounce)와 DoS/429 차단 방지**:
   - 도시 검색창에 "Seoul"을 입력할 때 `S`, `e`, `o`, `u`, `l` 한 글자 칠 때마다 즉시 API를 호출하면 순식간에 수십 번의 요청이 발생합니다. 이는 서버에 불필요한 DoS 공격 형태의 부하를 주며, API 서버로부터 `429 Too Many Requests`로 IP가 차단될 수 있습니다. 사용자의 타이핑이 멈춘 뒤 300~500ms 이후에 한 번만 호출되도록 **디바운스** 처리가 필요합니다.

---

## 4단계 — 기능 브랜치(`weather`) 생성 및 [프롬프트 1: 기본 화면 만들기]

본격적인 작업을 위해 `weather` 브랜치를 생성합니다:
```bash
git checkout -b weather
```

### 💡 실무 개발자처럼 Antigravity에게 Git 커밋 위임하기
커밋할 때마다 터미널에 한 줄짜리 빈약한 커밋 메시지를 직접 타이핑할 필요가 없습니다!
우리는 Antigravity에게 커밋 생성을 직접 위임할 수 있습니다.

**[어떻게 가능할까요? (Rules 시스템의 원리)]**
- 이 프로젝트 루트에는 `GEMINI.md`와 `AGENTS.md`라는 **프로젝트 규칙(Rules) 파일**이 사전 탑재되어 있습니다.
- 이 파일에는 다음 규칙이 엄격히 정의되어 있습니다:
  1. 한국어로 작성하되 기술 용어는 영어 원어 사용
  2. 제목은 50자 내외 요약
  3. 본문은 변경 사항을 `-` 불릿 포인트로 상세히 목록화
  4. 하단에 `Co-authored-by: <모델명> <noreply@google.com>` 필수 기록
- 따라서 여러분이 Antigravity Chat에 `"커밋 규칙에 맞춰서 지금까지 작업 커밋해줘"`라고만 말해도, 에이전트가 알아서 변경점을 분석해 고품질 커밋을 자동으로 만들어줍니다!

> 💡 **[내 컴퓨터 전체에 적용하는 꿀팁 (전역 설정)]**:
> 이 커밋 규칙을 모든 프로젝트에서 항상 쓰고 싶다면, `~/.gemini/config/` (또는 Antigravity 설정)에 전역 규칙(Global Rule)으로 등록해 두면 내 컴퓨터의 어떤 저장소에서든 똑같이 동작합니다!

---

### [복사할 프롬프트 1: 기본 날씨·미세먼지 화면 구축]

Antigravity IDE 우측 Chat 패널에 아래 프롬프트를 복사하여 전달하세요:

```text
현재 Vite 기본 화면(src/App.jsx)을 개편하여, 
제공된 src/api/weather.js의 API 함수들을 연결한 실시간 날씨·미세먼지 기본 화면을 만들어줘.

[요구사항]
1. 상단에 서울(강서), 서울(시청), 인천, 부산, 대구, 대전, 광주, 제주 등 주요 도시 빠른 선택 버튼 배치
2. 선택된 도시의 현재 날씨 카드 (기온, 체감온도, 습도, 풍속, lucide-react 날씨 아이콘 및 한국어 상태 표시)
3. 선택된 도시의 미세먼지 카드 (PM10, PM2.5 수치 및 환경부 기준 '좋음/보통/나쁨/매우나쁨' 컬러 뱃지)
4. 데이터 로딩 시 로딩 표시 및 오류 발생 시 친절한 에러 안내
5. 외부 API 통신 로직은 src/api/weather.js 모듈을 그대로 활용할 것

먼저 구현 계획(Implementation Plan)을 제시해주고 승인을 받아 진행해줘.
```

> **[확인]** Antigravity가 계획을 세우면 **"Proceed"**를 누르고, 코드가 반영된 후 브라우저(`http://localhost:5173`)에서 도시 버튼을 누를 때마다 날씨와 미세먼지가 바뀌는지 확인합니다!

> ⚠️ **[중요!] 다음 단계로 넘어가기 전에 반드시 커밋하세요!**  
> 다음 고도화 단계에서 코드가 꼬이더라도 언제든 이 상태로 되돌아올 수 있도록, 지금 Antigravity Chat에 커밋을 요청합니다:
> ```text
> 1단계 날씨 및 미세먼지 기본 화면 구축이 완료되었어. 
> 프로젝트 커밋 규칙에 맞춰서 커밋해줘.
> ```
> *(직접 터미널로 하려면: `git add . && git commit -m "feat: 1단계 - 날씨 및 미세먼지 기본 화면 구축 완료"`)*

---

## 5단계 — [프롬프트 2: 대시보드 완성형으로 고도화]

기본 화면이 정상 동작하면, 이제 풍성한 기상 대시보드로 확장합니다.

---

### [복사할 프롬프트 2: 대시보드 고도화]

Antigravity IDE 우측 Chat 패널에 이어서 전달하세요:

```text
1단계에서 만든 기본 화면을 바탕으로, 완성형 기상 대시보드로 고도화해줘.

[추가 요구사항]
1. 컴포넌트 구조 분리: CurrentWeather.jsx, AirQualityCard.jsx 등 컴포넌트 단위로 깔끔하게 모듈화
2. 24시간 기온 차트: weather.hourly 데이터를 활용해 오늘 하루 시간대별 기온 변화를 보여주는 깔끔한 미니 SVG 꺾은선 차트 컴포넌트(HourlyChart.jsx) 추가
3. 7일간 주간 예보: weather.daily 데이터를 활용해 향후 7일간의 최고/최저 기온과 날씨 아이콘을 보여주는 카드(WeeklyForecast.jsx) 추가
4. 도시 검색 기능: searchCities API를 연동한 검색 입력창(CitySearch.jsx) 추가
   - API 남용 및 429 차단을 방지하기 위해 400ms 디바운스(Debounce) 적용
   - 검색 결과 드롭다운 선택 기능
5. 모바일 화면에서도 깨지지 않는 모던 카드형 반응형 디자인 (CSS)

먼저 구현 계획(Implementation Plan)을 제시해주고 승인을 받아 진행해줘.
```

> **[확인]** Antigravity의 구현이 끝나면 로컬 브라우저에서 24시간 차트와 주간 예보, 도시 검색 기능이 매끄럽게 동작하는지 테스트합니다!

> ⚠️ **[중요!] 커스터마이징을 시도하기 전에 반드시 커밋하세요!**  
> 대시보드 완성형 기능이 완성되었습니다! 추가 기능을 시도하다가 코드가 망가지더라도 안전하게 복구할 수 있도록, 지금 Antigravity Chat에 커밋을 요청하세요:
> ```text
> 2단계 대시보드 고도화(24시간 차트, 주간 예보, 디바운스 검색) 작업이 완료되었어. 
> 프로젝트 커밋 규칙에 맞춰서 커밋해줘.
> ```
> *(직접 터미널로 하려면: `git add . && git commit -m "feat: 2단계 - 24시간 차트, 주간예보, 디바운스 검색 대시보드 고도화 완료"`)*

---

## 6단계 — [나만의 커스터마이징 챌린지 (예비 옵션 중 1~2개 선택)]

실습을 일찍 마쳤거나 나만의 개성 있는 대시보드를 만들고 싶은 학생은, **아래 예비 옵션 중 1~2개를 골라** Antigravity에게 추가 요청해 보세요!

- **옵션 A (동적 비주얼 테마)**:
  `"현재 날씨 상태(맑음, 비, 흐림)나 낮/밤(is_day)에 따라 대시보드 전체 배경 그라데이션이 은은하게 바뀌도록 테마 CSS를 적용해줘."`
- **옵션 B (즐겨찾기 도시 저장)**:
  `"사용자가 검색하거나 선택한 도시를 localStorage에 저장하여, 상단에 '최근 본 도시' 뱃지로 표시하고 원클릭으로 다시 볼 수 있게 해줘."`
- **옵션 C (상세 기상 데이터 표시)**:
  `"자외선 지수(UV Index)나 일출/일몰 시간, 강수 확률을 현재 날씨 카드에 추가 지표로 표시해줘."`
- **옵션 D (온도 단위 변환 토글)**:
  `"섭씨(°C)와 화씨(°F)를 버튼 하나로 자유롭게 바꿀 수 있는 단위 변환 토글 스위치를 만들어줘."`

> ⚠️ **[중요!] 커스터마이징 완료 후 반드시 커밋하세요!**  
> 나만의 기능이 정상 작동하는 것을 확인했다면, 병합 전에 꼭 Antigravity Chat에 커밋을 요청합니다:
> ```text
> 3단계 나만의 커스터마이징 기능 추가가 완료되었어. 
> 프로젝트 커밋 규칙에 맞춰서 커밋해줘.
> ```

---

## 7단계 — `weather` 브랜치를 `dev`로 병합 (Merge)

대시보드 구현과 커스터마이징이 모두 끝났습니다! 이제 작업 브랜치(`weather`)를 통합 브랜치(`dev`)로 병합합니다.

터미널에서 아래 명령어를 차례대로 입력하세요:
```bash
git checkout dev
git merge weather
```
> 💡 이미 단계별로 커밋을 꼼꼼하게 남겨두었기 때문에, 충돌 없이 깔끔하게 최신 상태로 병합됩니다!

---

## 8단계 — `dev` 브랜치에서 `README.md` 작성 및 커밋

배포하기 전에, `dev` 브랜치의 `README.md` 파일을 열고 질문 항목들을 직접 작성합니다:

1. **소개**: 완성된 대시보드의 주요 기능 요약
2. **어떻게 만들었나요**: Antigravity IDE의 2단계 프롬프트 경험 및 Implementation Plan 소감
3. **데이터 통신 구조**: Open-Meteo의 특징 및 `src/api/weather.js` 분리 이유
4. **보안에서 확인한 것**: 공개 API vs 비밀 API 차이, 클라이언트 직접 호출의 한계와 백엔드 프록시(BFF) 필요성
5. **커스터마이징한 부분**: **6단계에서 내가 선택하여 추가한 1~2개 옵션 기능 설명**

작성이 끝나면 Antigravity Chat에 커밋을 요청하거나 터미널에서 커밋합니다:
```text
README.md 실습 보고서 및 보안 성찰 작성을 완료했어. 
프로젝트 커밋 규칙에 맞춰서 커밋해줘.
```
*(터미널 직접 입력: `git add README.md && git commit -m "docs: 실습 리포트 및 보안 회고 작성"`)*

---

## 9단계 — 듀얼 배포 (Netlify & GitHub Pages)

9주차와 마찬가지로 **Netlify**와 **GitHub Pages** 두 곳 모두에 배포합니다!

### 1. Netlify 배포 (클라우드 CI/CD 자동 빌드)
1. [Netlify 대시보드](https://app.netlify.com) 접속 → **Add new site → Import an existing project**
2. **GitHub** 선택 → 본인의 `26-w10-weather` Fork 저장소 선택
3. 배포 설정 확인:
   - **Branch to deploy**: `dev`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. **Deploy 26-w10-weather** 버튼 클릭! (1분 내 배포 완료)
5. 생성된 `https://<사이트이름>.netlify.app` 주소를 복사해 둡니다.

### 2. GitHub Pages 배포 (로컬 빌드 후 배포)
1. 로컬 터미널에서 프로덕션 빌드를 수행하고 `gh-pages` 브랜치로 배포합니다:
   ```bash
   npm run build
   npx gh-pages -d dist
   ```
2. 내 GitHub Fork 저장소의 **Settings → Pages**로 이동하여:
   - **Source**: Deploy from a branch
   - **Branch**: `gh-pages` / `/ (root)` 로 설정되어 있는지 확인합니다.
3. 2~3분 뒤 상단에 표시되는 `https://<내아이디>.github.io/26-w10-weather/` 주소를 확인합니다.

### 3. 배포 URL 최종 반영 및 푸시
`README.md`의 배포 링크 섹션에 두 URL을 기재하고 원격 `dev` 브랜치로 푸시합니다:
```bash
git add README.md
git commit -m "docs: Netlify 및 GitHub Pages 배포 링크 추가"
git push origin dev
```

---

## 10단계 — 마일스톤 태그 푸시 및 PR 제출

1. 마일스톤 태그(`v1.0`) 생성 및 푸시:
   ```bash
   git tag v1.0
   git push origin v1.0
   ```
2. 내 GitHub 저장소에서 **Pull requests → New pull request** 클릭
3. 브랜치 방향 확인:
   - **base repository**: `kopo-kangseo-cybersec/26-w10-weather` / **base**: `main`
   - **head repository**: `<내아이디>/26-w10-weather` / **compare**: `dev`
4. PR 템플릿의 체크리스트를 점검하고, 이름, 배포 링크, 태그(`v1.0`), 한 줄 소감을 작성한 뒤 **Create pull request**를 클릭합니다.
5. **AI 자동 채점 확인**:
   - 1~2분 뒤 Gemini 3.5 Flash Lite 채점 봇이 PR 코멘트에 채점 리포트를 등록합니다.
   - 모든 기준을 충족하면 `'통과'` 라벨과 함께 PR이 자동으로 마감(Close)되고 교수님 Slack으로 알림이 전송됩니다!
