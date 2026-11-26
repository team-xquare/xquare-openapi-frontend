import { api } from "./api";

// 내 프로젝트 API (GET /projects). 로그인한 사용자의 프로젝트와 분야별 신청 상태

export type ApiField =
  | "STUDENT"
  | "TEACHER"
  | "CLUB"
  | "SCHEDULE"
  | "STUDY_SUPERVISOR";

// 승인 대기 · 승인 · 반려
export type ApiFieldStatus = "PENDING" | "APPROVED" | "REJECTED";

export const API_FIELD_LABELS: Record<ApiField, string> = {
  STUDENT: "학생",
  TEACHER: "교직원",
  CLUB: "동아리",
  SCHEDULE: "일정",
  STUDY_SUPERVISOR: "자습감독",
};

export interface ProjectFieldResponse {
  field: ApiField;
  // 교내: 신청하면 바로 승인, 제한: 관리자 승인 필요
  level: "SCHOOL" | "RESTRICTED";
  status: ApiFieldStatus;
  // 반려됐을 때만 있음
  rejectReason: string | null;
}

export interface ProjectSummaryResponse {
  projectId: number;
  name: string;
  keyIssued: boolean;
  issuedAt: string | null;
  expiresAt: string | null;
  fields: ProjectFieldResponse[];
}

export const fetchMyProjects = (signal?: AbortSignal) =>
  api.get<ProjectSummaryResponse[]>("/projects", { signal });
