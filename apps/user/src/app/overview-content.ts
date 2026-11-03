import type {
  DocTableColumn,
  InfoListItem,
  StepCard,
} from "../components";

// 문서 Overview 페이지 내용 (명세 확정 시 이 파일만 수정)

export const OVERVIEW_BADGES = ["REST", "JSON"];

export const OVERVIEW_TITLE = "XQUARE DSM Open API";

export const OVERVIEW_LEAD =
  "대덕소프트웨어마이스터고등학교의 급식, 일정, 동아리, 교직원, 학생, 공지 정보를 다루는 REST API입니다. 활용 신청으로 발급받은 API 키로 인증하며 조회뿐 아니라 등록, 수정, 삭제를 지원합니다.";

export const QUICK_START_CODES = [
  {
    label: "발급받은 API 키로 호출",
    lines: [
      'curl "{BASE_URL}/students?grade=2&classNum=3" \\',
      '  -H "X-API-KEY: {apiKey}"',
    ],
  },
];

export const AUTH_INFO: InfoListItem[] = [
  { label: "Base URL", value: "[확정 필요]" },
  { label: "인증 방식", value: "API 키" },
  {
    label: "키 발급",
    value:
      "API 활용 신청 시 발급됩니다. 개발계정은 자동승인되어 바로 발급됩니다.",
  },
  { label: "요청 헤더", value: "X-API-KEY: {apiKey}", isCode: true },
  {
    label: "키 보관",
    value: "발급 직후에만 키 전체가 표시됩니다. 분실하면 재발급해야 합니다.",
  },
  {
    label: "호출 한도",
    value:
      "개발계정은 하루 10,000회까지 호출할 수 있습니다. (RATE_LIMIT_EXCEEDED)",
  },
];

export const AUTH_ERROR_RESPONSE_LINES = [
  "{",
  '  "code": "INVALID_API_KEY",',
  '  "message": "API 키가 유효하지 않습니다."',
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
    code: "INVALID_API_KEY",
    status: "401",
    description: "API 키가 없거나 유효하지 않습니다.",
  },
  {
    code: "API_ACCESS_DENIED",
    status: "403",
    description: "활용 신청하지 않은 API를 호출했습니다.",
  },
  {
    code: "RATE_LIMIT_EXCEEDED",
    status: "429",
    description:
      "하루 호출 한도를 넘었습니다. 다음 날 다시 호출할 수 있습니다.",
  },
];

export const ACCESS_LEVELS: InfoListItem[] = [
  {
    label: "개발계정",
    value:
      "활용 신청 즉시 자동승인됩니다. 하루 10,000회까지 호출할 수 있습니다.",
  },
  {
    label: "운영계정",
    value: "활용사례를 등록하고 신청하면 호출 한도를 늘릴 수 있습니다.",
  },
  {
    label: "미신청 API",
    value:
      "활용 신청하지 않은 API를 호출하면 403(API_ACCESS_DENIED)을 반환합니다.",
  },
];

export const GETTING_STARTED_STEPS: StepCard[] = [
  {
    title: "회원가입 후 로그인",
    description:
      "학교 이메일(@dsm.hs.kr)로 가입하고 로그인합니다. 활용 신청은 로그인 후 이용할 수 있습니다.",
  },
  {
    title: "API 활용 신청",
    description:
      "사용할 API를 활용 신청하면 개발계정은 자동승인되어 API 키가 바로 발급됩니다. 키는 이때만 전체가 표시되니 복사해 보관합니다.",
  },
  {
    title: "헤더에 API 키 실어 호출",
    description:
      "X-API-KEY: {apiKey} 헤더를 붙여 호출합니다. 개발계정은 하루 10,000회까지 호출할 수 있습니다.",
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
