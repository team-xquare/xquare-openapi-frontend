import { ApiError } from "@xquare/api";
import { api } from "@/lib/api";
import type { ErrorStatus } from "./error-content";

export interface NoticeSummary {
  id: string;
  title: string;
  author: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Notice extends NoticeSummary {
  content: string;
}

export interface NoticePage {
  notices: NoticeSummary[];
  // 0부터 셈
  page: number;
  totalCount: number;
  totalPage: number;
}

// 공지 API 응답 (GET /notices, GET /notices/{noticeId}). 조회도 로그인 토큰이 필요함
interface NoticeSummaryResponse {
  id: number;
  title: string;
  // 작성자 계정이 지워졌으면 null
  author: string | null;
  // 서울 시각 "2026-09-01T09:00:00"
  createdAt: string;
  // 수정된 적이 없으면 null
  updatedAt: string | null;
}

interface NoticeDetailResponse extends NoticeSummaryResponse {
  content: string;
}

interface NoticeListResponse {
  notices: NoticeSummaryResponse[];
  page: number;
  size: number;
  totalCount: number;
  totalPage: number;
}

// "2026-09-01T09:00:00" → "2026-09-01 09:00"
const formatDateTime = (value: string) => value.slice(0, 16).replace("T", " ");

function toNoticeSummary(response: NoticeSummaryResponse): NoticeSummary {
  return {
    id: String(response.id),
    title: response.title,
    author: response.author ?? "알 수 없음",
    createdAt: formatDateTime(response.createdAt),
    updatedAt: response.updatedAt ? formatDateTime(response.updatedAt) : undefined,
  };
}

// 토큰이 없으면 요청해도 401이라 보내지 않고 바로 로그인 필요로 끝냄
function ensureLoggedIn() {
  if (!api.auth.isLoggedIn()) {
    throw new ApiError(401, "INVALID_TOKEN", "로그인이 필요합니다.");
  }
}

// 최신순 목록 한 페이지
export async function fetchNoticePage(
  page: number,
  size: number,
  signal?: AbortSignal,
): Promise<NoticePage> {
  ensureLoggedIn();
  const response = await api.get<NoticeListResponse>(
    `/notices?page=${page}&size=${size}`,
    { signal },
  );
  return {
    notices: response.notices.map(toNoticeSummary),
    page: response.page,
    totalCount: response.totalCount,
    totalPage: response.totalPage,
  };
}

export async function fetchNotice(id: string, signal?: AbortSignal): Promise<Notice> {
  ensureLoggedIn();
  const response = await api.get<NoticeDetailResponse>(
    `/notices/${encodeURIComponent(id)}`,
    { signal },
  );
  return { ...toNoticeSummary(response), content: response.content };
}

export const isAbortError = (error: unknown) =>
  error instanceof Error && error.name === "AbortError";

// 예외 페이지(ErrorView)로 보여 줄 상태 코드. 그 밖의 오류는 500 화면(다시 시도)
export function toErrorStatus(error: unknown): ErrorStatus {
  if (error instanceof ApiError) {
    const { status } = error;
    if (status === 401 || status === 403 || status === 404 || status === 429) {
      return status;
    }
  }
  return 500;
}
