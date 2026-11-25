import { ApiError } from "@xquare/api";
import { api } from "@/lib/api";

export type AccessTier = "제한" | "교내";

// 서버 시각 문자열을 서울 시각 "2026-11-24 19:39"로 바꿈.
// 오프셋(Z, +09:00 등)이 있으면 서울 시각으로 환산하고, 없으면 이미 서울 시각으로 봄
function formatDateTime(value: string) {
  if (/(Z|[+-]\d{2}:?\d{2})$/i.test(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      const parts = Object.fromEntries(
        new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Seoul",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
        })
          .formatToParts(date)
          .map((part) => [part.type, part.value]),
      );
      return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
    }
  }
  return value.slice(0, 16).replace("T", " ");
}

// 관리자 분야 신청 API 응답 (GET /admin/api-applications)
export type ApplicationField =
  | "STUDENT"
  | "TEACHER"
  | "CLUB"
  | "SCHEDULE"
  | "STUDY_SUPERVISOR";
export type ApplicationLevel = "SCHOOL" | "RESTRICTED";
export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

interface ApplicationSummaryResponse {
  applicationId: number;
  projectId: number;
  projectName: string;
  userId: number;
  field: ApplicationField;
  level: ApplicationLevel;
  status: ApplicationStatus;
  // UTC(Z) 등 오프셋이 붙은 시각이거나 오프셋 없는 서울 시각
  appliedAt: string;
  decidedAt: string | null;
}

interface ApplicationListResponse {
  content: ApplicationSummaryResponse[];
  // 0부터 시작
  page: number;
  size: number;
  totalCount: number;
  totalPage: number;
}

export interface ApplicationSummary {
  id: string;
  projectName: string;
  field: ApplicationField;
  tier: AccessTier;
  status: ApplicationStatus;
  appliedAt: string;
}

export interface ApplicationPage {
  applications: ApplicationSummary[];
  totalCount: number;
  totalPage: number;
}

export const FIELD_LABELS: Record<ApplicationField, string> = {
  STUDENT: "학생",
  TEACHER: "교직원",
  CLUB: "동아리",
  SCHEDULE: "일정",
  STUDY_SUPERVISOR: "자습 감독",
};

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: "승인 대기",
  APPROVED: "승인",
  REJECTED: "반려",
};

// 단계는 서버가 분야로 정해 내려줌: 개인정보가 들어간 분야는 제한, 나머지는 교내
const tierOf = (level: ApplicationLevel): AccessTier =>
  level === "RESTRICTED" ? "제한" : "교내";

export const APPLICATION_PAGE_SIZE = 10;

// 반려 사유 최대 길이 (서버 ApiApplicationRejectRequest.reason maxLength)
export const REJECT_REASON_MAX_LENGTH = 200;

// status가 빈 문자열이면 거르지 않음. page는 0부터
export async function fetchApplications(
  params: { status: string; page: number },
  signal?: AbortSignal,
): Promise<ApplicationPage> {
  const query = new URLSearchParams({
    page: String(params.page),
    size: String(APPLICATION_PAGE_SIZE),
  });
  if (params.status) query.set("status", params.status);
  const response = await api.get<ApplicationListResponse>(
    `/admin/api-applications?${query}`,
    { signal },
  );
  return {
    applications: response.content.map((item) => ({
      id: String(item.applicationId),
      projectName: item.projectName,
      field: item.field,
      tier: tierOf(item.level),
      status: item.status,
      appliedAt: formatDateTime(item.appliedAt),
    })),
    totalCount: response.totalCount,
    totalPage: response.totalPage,
  };
}

// 관리자 분야 신청 상세 API 응답 (GET /admin/api-applications/{applicationId}).
// 승인 · 반려 API도 처리한 뒤의 상세를 같은 모양으로 돌려줌
interface ApplicationDetailResponse {
  applicationId: number;
  field: ApplicationField;
  level: ApplicationLevel;
  status: ApplicationStatus;
  rejectReason: string | null;
  appliedAt: string;
  decidedAt: string | null;
  project: {
    projectId: number;
    name: string;
    purpose: string;
    keyIssued: boolean;
    createdAt: string;
    // 이 프로젝트가 신청한 분야 전체
    fields: {
      field: ApplicationField;
      level: ApplicationLevel;
      status: ApplicationStatus;
      rejectReason: string | null;
    }[];
  };
  userId: number;
  // 신청자 계정이 지워졌으면 null
  applicant: {
    username: string;
    name: string;
    email: string;
    studentNumber: number | null;
  } | null;
}

export interface ApplicationDetail extends ApplicationSummary {
  rejectReason: string | null;
  decidedAt: string | null;
  purpose: string;
  keyIssued: boolean;
  applicant: ApplicationDetailResponse["applicant"];
  projectFields: { field: ApplicationField; status: ApplicationStatus }[];
}

const toDetail = (response: ApplicationDetailResponse): ApplicationDetail => ({
  id: String(response.applicationId),
  projectName: response.project.name,
  field: response.field,
  tier: tierOf(response.level),
  status: response.status,
  appliedAt: formatDateTime(response.appliedAt),
  rejectReason: response.rejectReason,
  decidedAt: response.decidedAt ? formatDateTime(response.decidedAt) : null,
  purpose: response.project.purpose,
  keyIssued: response.project.keyIssued,
  applicant: response.applicant,
  projectFields: response.project.fields.map((item) => ({
    field: item.field,
    status: item.status,
  })),
});

const detailPath = (id: string) =>
  `/admin/api-applications/${encodeURIComponent(id)}`;

export async function fetchApplication(
  id: string,
  signal?: AbortSignal,
): Promise<ApplicationDetail> {
  return toDetail(
    await api.get<ApplicationDetailResponse>(detailPath(id), { signal }),
  );
}

// 대기 중인 신청을 승인. 프로젝트의 첫 승인이면 서버가 API 키를 발급함
export async function approveApplication(id: string) {
  return toDetail(
    await api.post<ApplicationDetailResponse>(`${detailPath(id)}/approve`),
  );
}

export async function rejectApplication(id: string, reason: string) {
  return toDetail(
    await api.post<ApplicationDetailResponse>(`${detailPath(id)}/reject`, {
      reason,
    }),
  );
}

// 다른 관리자가 먼저 승인 · 반려한 신청 (409 APPLICATION_ALREADY_DECIDED)
export const isAlreadyDecidedError = (error: unknown) =>
  error instanceof ApiError && error.code === "APPLICATION_ALREADY_DECIDED";
