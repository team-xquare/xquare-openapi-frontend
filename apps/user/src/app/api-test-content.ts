export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PATCH", "DELETE"];

export const DEFAULT_REQUEST: { method: HttpMethod; url: string } = {
  method: "POST",
  url: "https://open.xquare.app/auth/login",
};

// 실제 호출 연동 전까지 보여줄 예시 응답
export const SAMPLE_RESPONSE = {
  status: "200 OK",
  duration: "128 ms",
  size: "412 B",
  body: [
    "{",
    '  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",',
    '  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",',
    '  "expiresIn": 3600',
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
    method: "POST",
    path: "/auth/login",
    status: 200,
    calledAt: "14:32:10",
  },
  {
    id: "2",
    method: "GET",
    path: "/students?grade=SECOND",
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
