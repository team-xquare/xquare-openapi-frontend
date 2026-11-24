import { api } from "@/lib/api";

export type AccessTier = "제한" | "교내";
export type ApplicationStatus = "승인 대기" | "반려" | "승인 완료";
export type ApplicationKind = "첫 신청 (키 발급)" | "분야 추가";

export type Application = {
  id: string;
  project: string;
  field: string;
  tier: AccessTier;
  status: ApplicationStatus;
  applicant: string;
  username: string;
  appliedAt: string;
  kind: ApplicationKind;
  purpose: string;
  url: string;
  // 같은 프로젝트에 이미 신청된 분야와 상태 (상세의 "이 프로젝트의 분야")
  projectFields: string;
};

// 신청일시 최신순
export const APPLICATIONS: Application[] = [
  {
    id: "application-5",
    project: "team-xquare",
    field: "학생",
    tier: "제한",
    status: "승인 대기",
    applicant: "전재준",
    username: "jaejun0210",
    appliedAt: "2026-11-19 16:40",
    kind: "분야 추가",
    purpose: "학생 정보를 조회해 팀 서비스의 학생 목록 화면에 보여 주려고 합니다",
    url: "https://team-xquare.example.com",
    projectFields: "동아리, 일정 (승인 완료) · 학생 (승인 대기)",
  },
  {
    id: "application-3",
    project: "team-xquare",
    field: "일정",
    tier: "교내",
    status: "승인 완료",
    applicant: "전재준",
    username: "jaejun0210",
    appliedAt: "2026-11-03 09:12",
    kind: "분야 추가",
    purpose: "학교 일정을 서비스 달력에 보여 줍니다",
    url: "https://team-xquare.example.com",
    projectFields: "동아리, 일정 (승인 완료) · 학생 (승인 대기)",
  },
  {
    id: "application-4",
    project: "dsm-timetable",
    field: "교직원",
    tier: "제한",
    status: "반려",
    applicant: "전재준",
    username: "jaejun0210",
    appliedAt: "2026-11-02 10:07",
    kind: "분야 추가",
    purpose: "교직원 정보를 시간표에 표시하려고 합니다",
    url: "https://timetable.example.com",
    projectFields: "일정 (승인 완료) · 교직원 (반려)",
  },
  {
    id: "application-2",
    project: "동아리 소개 페이지",
    field: "동아리",
    tier: "교내",
    status: "승인 완료",
    applicant: "이서연",
    username: "seoyeon.lee",
    appliedAt: "2026-10-21 16:20",
    kind: "첫 신청 (키 발급)",
    purpose: "동아리 정보를 한 곳에서 제공합니다",
    url: "https://clubs.example.com",
    projectFields: "동아리 (승인 완료)",
  },
  {
    id: "application-1",
    project: "자습 알림",
    field: "자습 감독",
    tier: "제한",
    status: "승인 완료",
    applicant: "정하준",
    username: "hajun.jung",
    appliedAt: "2026-10-12 09:05",
    kind: "첫 신청 (키 발급)",
    purpose: "자습 감독 정보를 알림으로 제공하려고 합니다",
    url: "https://study.example.com",
    projectFields: "자습 감독 (승인 완료)",
  },
];

// 승인 · 반려를 할 수 있는 신청: 제한 단계이고 승인 대기인 것 (목록과 상세가 같이 씀)
export const canReview = (application: Application) =>
  application.tier === "제한" && application.status === "승인 대기";

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
