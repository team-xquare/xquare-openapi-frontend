import { api } from "./api";
import type { ClubSummaryResponse, PageResponse } from "./api-types";
import { withQuery } from "./query";

// 학생 API (GET · POST /students, GET · PATCH · DELETE /students/{studentId})
// 조회는 Swagger에 API 키(X-API-Key)만 적혀 있어, 관리자 로그인 토큰으로 되는지 서버 확인이 필요함

export interface StudentResponse {
  id: number;
  // 학번 (2학년 3반 15번 → 2315)
  studentNumber: number;
  grade: number;
  classNum: number;
  number: number;
  name: string;
  // YYYY-MM-DD
  birthDate: string;
  email: string;
  // 소속 동아리가 없으면 null
  club: ClubSummaryResponse | null;
}

export type StudentSearch = {
  name?: string;
  grade?: number;
  classNum?: number;
  // 0부터
  page?: number;
  // 1 ~ 100
  size?: number;
};

// 등록 · 수정 본문. 학년 · 반 · 번호는 학번으로 서버가 나눔
export interface StudentRequest {
  studentNumber: number;
  name: string;
  // YYYY-MM-DD
  birthDate: string;
  // @dsm.hs.kr 메일만 받음
  email: string;
}

// 서버 StudentRequest 검증과 같음
export const STUDENT_NAME_MAX_LENGTH = 10;
export const STUDENT_EMAIL_PATTERN = /^[^@\s]+@dsm\.hs\.kr$/;

const studentPath = (id: number | string) =>
  `/students/${encodeURIComponent(String(id))}`;

export const fetchStudents = (search: StudentSearch, signal?: AbortSignal) =>
  api.get<PageResponse<StudentResponse>>(withQuery("/students", search), {
    signal,
  });

export const fetchStudent = (id: number | string, signal?: AbortSignal) =>
  api.get<StudentResponse>(studentPath(id), { signal });

export const createStudent = (body: StudentRequest, signal?: AbortSignal) =>
  api.post("/students", body, { signal });

export const updateStudent = (
  id: number | string,
  body: StudentRequest,
  signal?: AbortSignal,
) => api.patch(studentPath(id), body, { signal });

export const deleteStudent = (id: number | string, signal?: AbortSignal) =>
  api.delete(studentPath(id), { signal });
