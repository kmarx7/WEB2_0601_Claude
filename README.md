# 고객 관심 등록 웹앱

제품 또는 수업에 관심 있는 고객의 연락처와 문의를 수집해 Google Sheets에 자동으로 저장하는 리드 수집 웹앱입니다.

## 기술 스택

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Google Sheets API v4** (googleapis)
- **서버 API Route** (`/api/leads`) — 클라이언트에 API 키 노출 없음

---

## 1. 로컬 실행 방법

```bash
# 의존성 설치
npm install

# 환경변수 설정 (아래 4번 참고)
cp .env.example .env.local
# .env.local을 실제 값으로 편집

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 2. Google Cloud 서비스 계정 생성 방법

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 프로젝트 생성 또는 기존 프로젝트 선택
3. 왼쪽 메뉴 **API 및 서비스 > 라이브러리** 이동
4. **Google Sheets API** 검색 후 **사용 설정**
5. **API 및 서비스 > 사용자 인증 정보** 이동
6. **사용자 인증 정보 만들기 > 서비스 계정** 클릭
7. 서비스 계정 이름 입력 후 **만들기 및 계속**
8. 역할은 비워두고 **완료**
9. 생성된 서비스 계정 클릭 > **키** 탭 > **키 추가 > 새 키 만들기**
10. **JSON** 선택 후 다운로드
11. JSON 파일에서 `client_email`과 `private_key` 값을 복사해 환경변수에 설정

---

## 3. Google Sheet 공유 방법

1. Google Sheets에서 새 스프레드시트 생성
2. **A1행에 헤더 입력** (아래 참고):

   | timestamp | name | phone | email | product_or_class | contact_method | message | privacy_required_consent | optional_info_consent | marketing_consent | source |
   |---|---|---|---|---|---|---|---|---|---|---|

3. 스프레드시트 URL에서 ID 복사
   - URL 예: `https://docs.google.com/spreadsheets/d/`**`1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms`**`/edit`
4. 우상단 **공유** 버튼 클릭
5. 서비스 계정 이메일(`GOOGLE_SHEETS_CLIENT_EMAIL` 값) 입력
6. 권한을 **편집자**로 설정 후 **공유**

---

## 4. 환경변수 설정 방법

`.env.local` 파일을 생성하고 아래 내용 입력:

```env
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_SHEETS_SHEET_NAME=Sheet1
```

> **주의:** `GOOGLE_SHEETS_PRIVATE_KEY`는 JSON 파일의 `private_key` 값 전체를 큰따옴표로 감싸 입력합니다.
> `.env.local`은 절대 git에 커밋하지 마세요. (`.gitignore`에 포함되어 있습니다.)

---

## 5. 로컬 테스트 방법

1. 환경변수 설정 후 `npm run dev` 실행
2. [http://localhost:3000](http://localhost:3000) 접속
3. 폼 작성 후 **관심 등록하기** 클릭
4. "관심 등록이 완료되었습니다!" 메시지 확인
5. Google Sheets에서 데이터 행 추가 여부 확인

**API 직접 테스트 (curl):**

```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "홍길동",
    "phone": "010-1234-5678",
    "email": "test@example.com",
    "productOrClass": "영어 회화 초급반",
    "contactMethod": "문자",
    "message": "수업 일정이 궁금합니다.",
    "privacyRequiredConsent": true,
    "optionalInfoConsent": true,
    "marketingConsent": false,
    "website": ""
  }'
```

---

## 6. Vercel 배포 시 환경변수 설정 방법

1. [Vercel](https://vercel.com) 접속 후 GitHub 저장소 연결
2. 프로젝트 **Settings > Environment Variables** 이동
3. 아래 4개 변수를 각각 추가:

   | Key | Value |
   |-----|-------|
   | `GOOGLE_SHEETS_CLIENT_EMAIL` | 서비스 계정 이메일 |
   | `GOOGLE_SHEETS_PRIVATE_KEY` | Private Key 전체 (따옴표 없이 입력) |
   | `GOOGLE_SHEETS_SPREADSHEET_ID` | 스프레드시트 ID |
   | `GOOGLE_SHEETS_SHEET_NAME` | 시트 이름 (예: Sheet1) |

4. **Production / Preview / Development** 환경 모두 선택 후 저장
5. **Deployments** 탭에서 **Redeploy** 클릭

> **Private Key 입력 시 주의:** Vercel 환경변수 입력창에는 `\n`을 실제 줄바꿈으로 변환하지 않습니다.
> JSON 파일의 `private_key` 값을 그대로 붙여넣으면 됩니다 (`\n` 이스케이프 문자열 포함).

---

## 파일 구조

```
src/
├── app/
│   ├── layout.tsx              # 루트 레이아웃
│   ├── page.tsx                # 메인 페이지
│   └── api/leads/route.ts      # POST /api/leads (서버 전용)
├── components/
│   ├── LeadForm.tsx            # 폼 전체 (상태, 제출 로직)
│   ├── FormField.tsx           # Input/Textarea 재사용 컴포넌트
│   └── ConsentBox.tsx          # 동의 아코디언 컴포넌트
├── lib/
│   └── googleSheets.ts         # Google Sheets API 연동 (서버 전용)
└── types/
    └── lead.ts                 # TypeScript 타입 정의
```

## 보안 설계

- Google Sheets 인증 정보는 서버 환경변수에만 저장, 클라이언트에 노출되지 않음
- API Route(`/api/leads`)에서 서버 측 입력값 검증 수행
- IP 주소 미수집
- Honeypot 필드로 봇 제출 차단
- 제출 버튼 연타 방지 (ref 락 + disabled 처리)
- `GOOGLE_SHEETS_PRIVATE_KEY`는 코드, 주석, README 어디에도 기재 금지
