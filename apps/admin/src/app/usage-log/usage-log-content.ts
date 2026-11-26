import { ApiError } from "@xquare/api";
import { api } from "@/lib/api";
import { errorMessage } from "../notice-content";

export interface UsageLog {
  id: string;
  // 한국 시각 "2026-11-20 13:05:12"
  calledAt: string;
  method: string;
  route: string;
  status: number;
  durationMs: number;
}

export interface UsageLogPage {
  logs: UsageLog[];
  // 서버 페이지 번호 (0부터)
  page: number;
  totalCount: number;
  totalPage: number;
}

// 검색 버튼을 누를 때 정해지는 조건. 페이지를 넘기거나 다시 불러와도 from·to는 그대로 씀
export interface UsageLogQuery {
  // 조회 시작(포함) · 종료(제외), ISO 문자열
  from: string;
  to: string;
  method: string;
  // "all" 또는 정확한 상태 코드
  status: string;
  // API 경로 일부 (예: "/notices"). 빈 문자열이면 거르지 않음
  api: string;
  // "all" 또는 분야 (STUDENT 등)
  field: string;
  // 서버 페이지 번호 (0부터)
  page: number;
}

// 서버 API 응답 (GET /admin/api-usage-logs)
interface UsageLogResponse {
  id: number;
  // 서버가 주는 date-time 문자열 (오프셋이 있을 수도 없을 수도 있음)
  occurredAt: string;
  method: string;
  route: string;
  status: number;
  durationMs: number;
}

interface UsageLogListResponse {
  content: UsageLogResponse[];
  page: number;
  size: number;
  totalCount: number;
  totalPage: number;
}

export const PAGE_SIZE = 20;
// 서버가 받는 API 경로 검색어 최대 길이
export const API_SEARCH_MAX_LENGTH = 160;

// 서버 field 조건에 넣을 수 있는 분야. 공개 급식처럼 분야가 없는 기록은 분야를 고르면 빠짐
export const USAGE_FIELD_LABELS: Record<string, string> = {
  STUDENT: "학생",
  TEACHER: "교직원",
  CLUB: "동아리",
  SCHEDULE: "일정",
  STUDY_SUPERVISOR: "자습 감독",
};
// 서버가 받는 가장 큰 page 값
export const MAX_PAGE_INDEX = 1000;

const DAY = 24 * 60 * 60 * 1000;
// 서버 조회 기간은 최대 31일이라 30일까지만 고르게 함
export const PERIOD_DAYS: Record<string, number> = { "1d": 1, "7d": 7, "30d": 30 };

const SEOUL_FORMAT = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

// "2026-11-20T04:05:12Z" 처럼 끝에 Z나 +09:00 같은 오프셋이 붙어 있는지
const HAS_OFFSET = /(Z|[+-]\d{2}(:?\d{2})?)$/i;

// 오프셋이 있으면 브라우저 시간대와 상관없이 한국 시각으로 바꿔 "YYYY-MM-DD HH:mm:ss"로,
// 오프셋이 없으면 이미 한국 시각으로 보고 그대로 모양만 바꿈
export function formatCalledAt(value: string) {
  if (HAS_OFFSET.test(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      const parts = Object.fromEntries(
        SEOUL_FORMAT.formatToParts(date).map((part) => [part.type, part.value]),
      );
      return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
    }
  }
  return value.slice(0, 19).replace("T", " ");
}

function toUsageLog(response: UsageLogResponse): UsageLog {
  return {
    id: String(response.id),
    calledAt: formatCalledAt(response.occurredAt),
    method: response.method,
    route: response.route,
    status: response.status,
    durationMs: response.durationMs,
  };
}

const STORAGE_KEY = "usage-log-rows";

// 상세 화면이 서버 상세 API 없이 행을 찾을 수 있게 지금 페이지의 행을 id로 저장
export function saveUsageLogs(logs: UsageLog[]) {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(Object.fromEntries(logs.map((log) => [log.id, log]))),
    );
  } catch {
    // 저장소를 쓸 수 없으면 상세에서 목록으로 안내함
  }
}

// 최근 N일을 지금 기준 from ~ to로 만듦. 검색할 때마다 새로 만들어 새 기록도 포함되게 함
export function createUsageLogRange(period: string) {
  const to = new Date();
  const from = new Date(to.getTime() - PERIOD_DAYS[period] * DAY);
  return { from: from.toISOString(), to: to.toISOString() };
}

export async function fetchUsageLogs(
  query: UsageLogQuery,
  signal?: AbortSignal,
): Promise<UsageLogPage> {
  const params = new URLSearchParams({
    from: query.from,
    to: query.to,
    page: String(query.page),
    size: String(PAGE_SIZE),
  });
  if (query.method !== "all") params.set("method", query.method);
  if (query.status !== "all") params.set("status", query.status);
  // 서버는 빈 문자열 · 공백만 있는 검색어를 400으로 막으므로 그런 값은 보내지 않음
  const apiSearch = query.api.trim();
  if (apiSearch) params.set("api", apiSearch);
  if (query.field !== "all") params.set("field", query.field);
  const response = await api.get<UsageLogListResponse>(
    `/admin/api-usage-logs?${params}`,
    { signal },
  );
  return {
    logs: response.content.map(toUsageLog),
    page: response.page,
    totalCount: response.totalCount,
    totalPage: response.totalPage,
  };
}

// 권한이 없으면 서버 문구 대신 알기 쉬운 문구, 그 밖에는 공지 화면과 같은 처리
export const usageLogErrorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError && error.status === 403
    ? "사용 기록을 볼 권한이 없습니다."
    : errorMessage(error, fallback);
