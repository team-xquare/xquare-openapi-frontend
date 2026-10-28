import type {
  DocTableColumn,
  InfoListItem,
  StepCard,
} from "../components";

// 문서 Overview 페이지 내용 (명세 확정 시 이 파일만 수정)

export const OVERVIEW_BADGES = ["REST", "JSON"];

export const OVERVIEW_TITLE = "XQUARE DSM Open API";

export const OVERVIEW_LEAD =
  "대덕소프트웨어마이스터고등학교의 급식, 일정, 동아리, 교직원, 학생, 공지 정보를 다루는 REST API입니다. JWT 인증을 사용하며 조회뿐 아니라 등록, 수정, 삭제를 지원합니다.";

export const QUICK_START_CODES = [
  {
    label: "1. 토큰 발급",
    lines: [
      "curl -X POST {BASE_URL}/auth/login \\",
      '  -H "Content-Type: application/json" \\',
      `  -d '{"email": "user@example.com", "password": "Password1!"}'`,
    ],
  },
  {
    label: "2. 발급받은 토큰으로 호출",
    lines: [
      'curl "{BASE_URL}/students?grade=SECOND&class=THREE" \\',
      '  -H "Authorization: Bearer {accessToken}"',
    ],
  },
];

export const AUTH_INFO: InfoListItem[] = [
  { label: "Base URL", value: "[확정 필요]" },
  { label: "인증 방식", value: "JWT Bearer 토큰" },
  { label: "토큰 발급", value: "POST /auth/login", isCode: true },
  {
    label: "요청 헤더",
    value: "Authorization: Bearer {accessToken}",
    isCode: true,
  },
  { label: "토큰 유효기간", value: "3600초 (expiresIn)" },
  {
    label: "계정 인증",
    value: "이메일 OTP 인증을 마친 계정만 로그인할 수 있습니다.",
  },
  {
    label: "계정 잠금",
    value: "로그인 5회 실패 시 계정이 잠깁니다. (ACCOUNT_LOCKED)",
  },
];

export const LOGIN_RESPONSE_LINES = [
  "{",
  '  "success": true,',
  '  "data": {',
  '    "accessToken": "eyJhbGci...",',
  '    "tokenType": "Bearer",',
  '    "expiresIn": 3600,',
  '    "user": { "userId": "user_123", "email": "user@example.com", "status": "ACTIVE" }',
  "  },",
  '  "error": null',
  "}",
];

export const ENDPOINT_COLUMNS: DocTableColumn[] = [
  { key: "category", label: "구분", width: 110, variant: "strong" },
  { key: "method", label: "Method", width: 90, variant: "accent" },
  { key: "path", label: "Endpoint", width: 240, variant: "code" },
  { key: "description", label: "기능", variant: "muted" },
];

export const ENDPOINT_ROWS = [
  {
    category: "인증/인가",
    method: "POST",
    path: "/auth/login",
    description: "로그인하고 액세스 토큰을 발급받습니다.",
  },
  {
    category: "학생",
    method: "GET",
    path: "/students",
    description: "학생 전체를 조회합니다. name, grade, class로 검색합니다.",
  },
];

export const RESPONSE_FORMAT_CODES = [
  {
    label: "A. 래퍼 방식 — /auth/login",
    lines: ['{ "success": true, "data": { ... }, "error": null }'],
  },
  {
    label: "B. 목록 방식 — /students",
    lines: [
      "{",
      '  [ { "id": 1, "grade": "SECOND", "class": "THREE", "number": 15,',
      '      "name": "장윤호", "birthDate": "2009-07-28",',
      '      "email": "example@dsm.hs.kr",',
      '      "club": { "id": 1, "name": "", "logo": "image.png" } } ]',
      '  "totalCount": 3',
      "}",
    ],
  },
];

export const ERROR_CODE_COLUMNS: DocTableColumn[] = [
  { key: "code", label: "코드", width: 260, variant: "accent" },
  { key: "status", label: "HTTP Status", width: 130 },
  { key: "description", label: "설명", variant: "muted" },
];

export const ERROR_CODE_ROWS = [
  {
    code: "INVALID_CREDENTIALS",
    status: "401",
    description:
      "토큰이 없거나 유효하지 않습니다. 로그인 시에는 이메일 또는 비밀번호 불일치입니다.",
  },
  {
    code: "EMAIL_NOT_VERIFIED",
    status: "403",
    description: "이메일 미인증 계정입니다.",
  },
  {
    code: "ACCOUNT_LOCKED",
    status: "423",
    description: "로그인 5회 실패로 계정이 잠겼습니다.",
  },
];

export const ACCESS_LEVELS: InfoListItem[] = [
  {
    label: "USER",
    value:
      "로그인한 일반 사용자가 호출할 수 있습니다. 학생 조회 계열이 여기에 속합니다.",
  },
  {
    label: "ADMIN",
    value:
      "관리자만 호출할 수 있습니다. 등록, 수정, 삭제 계열이 여기에 속합니다.",
  },
  { label: "ALL", value: "대상 제한 없이 호출할 수 있습니다." },
];

export const GETTING_STARTED_STEPS: StepCard[] = [
  {
    title: "계정 이메일 인증",
    description:
      "이메일로 발송된 OTP를 입력해 계정을 인증합니다. 미인증 상태에서는 로그인이 거부됩니다.",
  },
  {
    title: "로그인해 토큰 발급",
    description:
      "POST /auth/login에 이메일과 비밀번호를 보내면 accessToken을 받습니다. 5회 실패하면 계정이 잠깁니다.",
  },
  {
    title: "헤더에 토큰 실어 호출",
    description:
      "Authorization: Bearer {accessToken} 헤더를 붙여 호출합니다. 토큰은 1시간 뒤 만료됩니다.",
  },
];

export const META_INFO: InfoListItem[] = [
  { label: "서비스명", value: "XQUARE DSM Open API" },
  { label: "담당자", value: "XQUARE" },
  { label: "기준일", value: "2026-08-26" },
];

export const OVERVIEW_NOTICE = {
  title: "참고",
  description:
    "Base URL이 아직 명세서에 없습니다. 응답 형식도 /auth/login은 success/data/error 래퍼, /students는 배열+totalCount로 갈려 있어 통일이 필요합니다.",
};
