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

// 홈 대시보드(home-content.ts)가 홈 API 연동 전까지 쓰는 더미 데이터, 최신순 정렬.
// 공지 관리 화면은 공지 API를 씀
export const NOTICES: Notice[] = [
  {
    id: "5",
    title: "9월 급식 변경 안내",
    author: "김영희",
    createdAt: "2026-09-03 08:30",
    content:
      "9월 급식 식단이 일부 변경되었습니다.\n\n변경된 식단은 급식 엔드포인트에서 확인할 수 있습니다.",
  },
  {
    id: "4",
    title: "2학기 동아리 모집 안내",
    author: "홍길동",
    createdAt: "2026-09-01 09:00",
    updatedAt: "2026-09-01 10:30",
    content:
      "9월 15일까지 각 동아리 부장에게 신청서를 제출하세요.\n\n신청서는 교무실 앞 비치함에서 가져갈 수 있습니다.\n중복 지원은 불가하며, 면접 일정은 추후 공지합니다.",
  },
  {
    id: "3",
    title: "체육대회 일정 공지",
    author: "이진경",
    createdAt: "2026-08-28 14:10",
    content:
      "체육대회는 9월 26일 운동장에서 진행됩니다.\n\n세부 종목과 반별 일정은 담임 선생님을 통해 안내합니다.",
  },
  {
    id: "2",
    title: "기숙사 점호 시간 변경",
    author: "정은진",
    createdAt: "2026-08-25 17:40",
    updatedAt: "2026-08-26 09:00",
    content: "9월부터 기숙사 저녁 점호 시간이 22시 30분으로 변경됩니다.",
  },
  {
    id: "1",
    title: "9월 자습 감독 배정",
    author: "홍길동",
    createdAt: "2026-08-20 11:25",
    content:
      "9월 자습 감독 배정표가 확정되었습니다.\n\n배정 내역은 자습감독 엔드포인트에서 확인할 수 있습니다.",
  },
];

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
