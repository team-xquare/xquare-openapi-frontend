import { api } from "./api";
import type { PageResponse } from "./api-types";
import { withQuery } from "./query";

// 관리자 분야 신청 API (GET /admin/api-applications, GET /admin/api-applications/{applicationId})
// 홈의 승인 대기 항목에 필요한 조회만 둠. 승인 · 반려는 활용신청 화면에서 함

export type ApiField =
  | "STUDENT"
  | "TEACHER"
  | "CLUB"
  | "SCHEDULE"
  | "STUDY_SUPERVISOR";

// 교내: 신청하면 바로 승인, 제한: 관리자 승인 필요
export type ApiFieldLevel = "SCHOOL" | "RESTRICTED";

export type ApiApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export const API_FIELD_LABELS: Record<ApiField, string> = {
  STUDENT: "학생",
  TEACHER: "교직원",
  CLUB: "동아리",
  SCHEDULE: "일정",
  STUDY_SUPERVISOR: "자습감독",
};

export const API_FIELD_LEVEL_LABELS: Record<ApiFieldLevel, string> = {
  SCHOOL: "교내",
  RESTRICTED: "제한",
};

export interface ApiApplicationSummaryResponse {
  applicationId: number;
  projectId: number;
  projectName: string;
  userId: number;
  field: ApiField;
  level: ApiFieldLevel;
  status: ApiApplicationStatus;
  appliedAt: string;
  // 아직 처리하지 않았으면 null
  decidedAt: string | null;
}

export interface ApiApplicationDetailResponse {
  applicationId: number;
  field: ApiField;
  level: ApiFieldLevel;
  status: ApiApplicationStatus;
  appliedAt: string;
  userId: number;
  // 탈퇴한 사용자면 null
  applicant: {
    username: string;
    name: string;
    email: string;
    studentNumber: number;
  } | null;
}

export const fetchApplications = (
  search: { status?: ApiApplicationStatus; page?: number; size?: number },
  signal?: AbortSignal,
) =>
  api.get<PageResponse<ApiApplicationSummaryResponse>>(
    withQuery("/admin/api-applications", search),
    { signal },
  );

export const fetchApplication = (id: number | string, signal?: AbortSignal) =>
  api.get<ApiApplicationDetailResponse>(
    `/admin/api-applications/${encodeURIComponent(String(id))}`,
    { signal },
  );
