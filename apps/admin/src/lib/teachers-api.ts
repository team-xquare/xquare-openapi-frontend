import { api } from "./api";
import type { ClubSummaryResponse, PageResponse } from "./api-types";
import { withQuery } from "./query";

// 교직원 API (GET · POST /teachers, GET · PATCH · DELETE /teachers/{teacherId})
// 조회는 Swagger에 API 키(X-API-Key)만 적혀 있어, 관리자 로그인 토큰으로 되는지 서버 확인이 필요함

export const TEACHER_SUBJECTS = [
  "MATH",
  "ALGEBRA",
  "ENGLISH",
  "JAVA",
  "MUSIC",
] as const;
export type TeacherSubject = (typeof TEACHER_SUBJECTS)[number];

export const TEACHER_POSITIONS = [
  "ACADEMIC_AFFAIRS",
  "INDUSTRY_COOPERATION",
  "MEISTER",
] as const;
export type TeacherPosition = (typeof TEACHER_POSITIONS)[number];

export interface TeacherResponse {
  id: number;
  name: string;
  // 담임이 아니면 학년 · 반이 null
  grade: number | null;
  classNum: number | null;
  subject: TeacherSubject | null;
  office: string;
  position: TeacherPosition | null;
  // 맡은 동아리가 없으면 null
  club: ClubSummaryResponse | null;
  // 부장 여부
  isManager: boolean;
}

export type TeacherSearch = {
  name?: string;
  grade?: number;
  classNum?: number;
  subject?: TeacherSubject;
  office?: string;
  // 0부터
  page?: number;
  // 1 ~ 100
  size?: number;
};

// 등록 · 수정 본문. 담임이 아니면 학년 · 반을 null로 보냄 (과목 · 직책 · 부장 여부는 필수)
export interface TeacherRequest {
  name: string;
  grade: number | null;
  classNum: number | null;
  subject: TeacherSubject;
  office: string;
  position: TeacherPosition;
  isManager: boolean;
}

// 서버 TeacherRequest 검증과 같음
export const TEACHER_NAME_MAX_LENGTH = 10;
export const TEACHER_OFFICE_MAX_LENGTH = 30;

const teacherPath = (id: number | string) =>
  `/teachers/${encodeURIComponent(String(id))}`;

export const fetchTeachers = (search: TeacherSearch, signal?: AbortSignal) =>
  api.get<PageResponse<TeacherResponse>>(withQuery("/teachers", search), {
    signal,
  });

export const fetchTeacher = (id: number | string, signal?: AbortSignal) =>
  api.get<TeacherResponse>(teacherPath(id), { signal });

export const createTeacher = (body: TeacherRequest, signal?: AbortSignal) =>
  api.post("/teachers", body, { signal });

export const updateTeacher = (
  id: number | string,
  body: TeacherRequest,
  signal?: AbortSignal,
) => api.patch(teacherPath(id), body, { signal });

export const deleteTeacher = (id: number | string, signal?: AbortSignal) =>
  api.delete(teacherPath(id), { signal });
