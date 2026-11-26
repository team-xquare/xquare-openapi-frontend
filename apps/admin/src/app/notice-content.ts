import { ApiError } from "@xquare/api";
import { api } from "@/lib/api";

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

// 서버 NoticeRequest 검증 한도와 같음
export const NOTICE_TITLE_MAX_LENGTH = 100;
export const NOTICE_CONTENT_MAX_LENGTH = 4000;

// 공지 API 응답 (GET /notices, GET /notices/{noticeId})
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

// 서버가 한 번에 주는 최대 건수
const LIST_FETCH_SIZE = 100;

// 공지 API에 제목 검색이 없어서 목록을 모두 받아 화면에서 거르고 페이지를 나눔 (최신순)
export async function fetchAllNotices(signal?: AbortSignal) {
  const notices: NoticeSummary[] = [];
  for (let page = 0; ; page += 1) {
    const response = await api.get<NoticeListResponse>(
      `/notices?page=${page}&size=${LIST_FETCH_SIZE}`,
      { signal },
    );
    notices.push(...response.notices.map(toNoticeSummary));
    if (page + 1 >= response.totalPage) return notices;
  }
}

// 공지 한 페이지(최신순)와 전체 건수. 홈의 최근 공지 · 공지 현황에 씀
export async function fetchNoticePage(
  page: number,
  size: number,
  signal?: AbortSignal,
) {
  const response = await api.get<NoticeListResponse>(
    `/notices?page=${page}&size=${size}`,
    { signal },
  );
  return {
    notices: response.notices.map(toNoticeSummary),
    totalCount: response.totalCount,
  };
}

export async function fetchNotice(id: string, signal?: AbortSignal): Promise<Notice> {
  const response = await api.get<NoticeDetailResponse>(
    `/notices/${encodeURIComponent(id)}`,
    { signal },
  );
  return { ...toNoticeSummary(response), content: response.content };
}

export const isAbortError = (error: unknown) =>
  error instanceof Error && error.name === "AbortError";

export const isNotFoundError = (error: unknown) =>
  error instanceof ApiError && error.status === 404;

// 서버 에러는 서버 문구 그대로, 그 밖의 예외는 기본 문구
export const errorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback;
