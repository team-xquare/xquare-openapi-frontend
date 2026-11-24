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

// 활용신청 API 응답 (GET /api-key-applications)
export type ApplicationField =
  | "STUDENT"
  | "TEACHER"
  | "CLUB"
  | "SCHEDULE"
  | "STUDY_SUPERVISOR";
export type ApplicationType = "FIRST" | "ADD_FIELD";

interface ApplicationSummaryResponse {
  id: number;
  userId: number;
  field: ApplicationField;
  type: ApplicationType;
  serviceName: string;
  purpose: string;
  // 오프셋 없는 서울 시각이거나 UTC(Z) 등 오프셋이 붙은 시각
  appliedAt: string;
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
  field: ApplicationField;
  type: ApplicationType;
  serviceName: string;
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

export const TYPE_LABELS: Record<ApplicationType, string> = {
  FIRST: "첫 신청 (키 발급)",
  ADD_FIELD: "분야 추가",
};

// 단계는 분야로 정해짐: 개인정보가 들어간 분야는 제한, 나머지는 교내
export const tierOf = (field: ApplicationField): AccessTier =>
  field === "STUDENT" || field === "TEACHER" || field === "STUDY_SUPERVISOR"
    ? "제한"
    : "교내";

export const APPLICATION_PAGE_SIZE = 10;

// field, type이 빈 문자열이면 거르지 않음. page는 0부터
export async function fetchApplications(
  params: { field: string; type: string; page: number },
  signal?: AbortSignal,
): Promise<ApplicationPage> {
  const query = new URLSearchParams({
    page: String(params.page),
    size: String(APPLICATION_PAGE_SIZE),
  });
  if (params.field) query.set("field", params.field);
  if (params.type) query.set("type", params.type);
  const response = await api.get<ApplicationListResponse>(
    `/api-key-applications?${query}`,
    { signal },
  );
  return {
    applications: response.content.map((item) => ({
      id: String(item.id),
      field: item.field,
      type: item.type,
      serviceName: item.serviceName,
      appliedAt: formatDateTime(item.appliedAt),
    })),
    totalCount: response.totalCount,
    totalPage: response.totalPage,
  };
}

// 활용신청 상세 API 응답 (GET /api-key-applications/{applicationId})
interface ApplicationDetailResponse extends ApplicationSummaryResponse {
  // 신청자 계정이 지워졌으면 null
  applicant: {
    username: string;
    name: string;
    email: string;
    studentNumber: number | null;
  } | null;
  // 이 신청자가 신청한 분야
  fields: { field: ApplicationField; appliedAt: string }[];
}

export interface ApplicationDetail extends ApplicationSummary {
  purpose: string;
  applicant: ApplicationDetailResponse["applicant"];
  fields: { field: ApplicationField; appliedAt: string }[];
}

export async function fetchApplication(
  id: string,
  signal?: AbortSignal,
): Promise<ApplicationDetail> {
  const response = await api.get<ApplicationDetailResponse>(
    `/api-key-applications/${encodeURIComponent(id)}`,
    { signal },
  );
  return {
    id: String(response.id),
    field: response.field,
    type: response.type,
    serviceName: response.serviceName,
    appliedAt: formatDateTime(response.appliedAt),
    purpose: response.purpose,
    applicant: response.applicant,
    fields: response.fields.map((item) => ({
      field: item.field,
      appliedAt: formatDateTime(item.appliedAt),
    })),
  };
}
