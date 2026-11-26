import { API_BASE_URL } from "../lib/api";

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PATCH", "DELETE"];

// 누구나 신청하면 바로 쓸 수 있는 공개 API(급식)를 기본 요청으로 둠
export const DEFAULT_REQUEST: { method: HttpMethod; url: string } = {
  method: "GET",
  url: `${API_BASE_URL.replace(/\/+$/, "")}/meals`,
};

// 기본 예시(GET /meals)에서 입력받는 쿼리 파라미터 (Swagger MealSearchRequest 기준, 둘 다 비우면 이번 달)
export const QUERY_FIELDS = [
  { key: "startDate", placeholder: "시작일 (예: 2026-11-01)" },
  { key: "finishDate", placeholder: "종료일 (예: 2026-11-30)" },
];

export interface CallHistoryItem {
  id: string;
  method: HttpMethod;
  path: string;
  status: number;
  calledAt: string;
}

export interface ApiResponse {
  // 0이면 서버에 닿지 못한 것(네트워크·CORS 오류)
  status: number;
  statusText: string;
  duration: number;
  size: number;
  body: string;
  headers: string[];
  errorMessage?: string;
  // 응답 칩에 보여줄 오류 이름 (없으면 "연결 실패")
  errorLabel?: string;
}
