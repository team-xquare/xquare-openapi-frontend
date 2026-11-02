export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PATCH", "DELETE"];

export const DEFAULT_REQUEST: { method: HttpMethod; url: string } = {
  method: "GET",
  url: "https://open.xquare.app/students",
};

// 기본 예시(GET /students)에서 입력받는 쿼리 파라미터
export const QUERY_FIELDS = [
  { key: "grade", placeholder: "학년 (예: 2)" },
  { key: "classNum", placeholder: "반 (예: 3)" },
];

// 실제 호출 연동 전까지 보여줄 예시 응답
export const SAMPLE_RESPONSE = {
  status: "200 OK",
  duration: "128 ms",
  size: "412 B",
  body: [
    "{",
    '  "content": [',
    '    { "id": 1, "studentNumber": 2315, "name": "장윤호", ... }',
    "  ],",
    '  "page": 0,',
    '  "size": 20,',
    '  "totalCount": 31,',
    '  "totalPage": 2',
    "}",
  ],
  headers: [
    "HTTP/1.1 200 OK",
    "Content-Type: application/json",
    "Content-Length: 412",
  ],
};

export interface CallHistoryItem {
  id: string;
  method: HttpMethod;
  path: string;
  status: number;
  calledAt: string;
}

// 최신순 정렬
export const CALL_HISTORY: CallHistoryItem[] = [
  {
    id: "3",
    method: "GET",
    path: "/students?grade=2&classNum=3",
    status: 200,
    calledAt: "14:32:10",
  },
  {
    id: "2",
    method: "GET",
    path: "/students?grade=2",
    status: 200,
    calledAt: "14:29:55",
  },
  {
    id: "1",
    method: "GET",
    path: "/students/15",
    status: 404,
    calledAt: "14:28:02",
  },
];
