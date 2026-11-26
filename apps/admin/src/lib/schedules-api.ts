import { api } from "./api";
import { withQuery } from "./query";

// 학사 일정 API (POST /schedules, GET · PATCH · DELETE /schedules/{scheduleId})

export interface ScheduleResponse {
  id: number;
  // YYYY-MM-DD
  date: string;
  title: string;
  content: string | null;
  // NEIS: 나이스에서 받아온 일정, SCHOOL: 학교가 직접 등록한 일정
  source: "NEIS" | "SCHOOL";
}

// 등록 · 수정 본문
export interface ScheduleRequest {
  date: string;
  title: string;
  // 설명이 없으면 null
  content: string | null;
}

// 서버 ScheduleRequest 검증과 같음
export const SCHEDULE_TITLE_MAX_LENGTH = 50;
export const SCHEDULE_CONTENT_MAX_LENGTH = 1000;

const schedulePath = (id: number | string) =>
  `/schedules/${encodeURIComponent(String(id))}`;

// 시작일 ~ 종료일(포함, 최대 92일) 일정. 나이스 일정과 학교 일정이 같이 옴.
// Swagger에 API 키(X-API-Key)만 적혀 있어, 관리자 로그인 토큰으로 되는지 서버 확인이 필요함
export const fetchSchedules = (
  range: { startDate: string; finishDate: string },
  signal?: AbortSignal,
) => api.get<ScheduleResponse[]>(withQuery("/schedules", range), { signal });

export const fetchSchedule = (id: number | string, signal?: AbortSignal) =>
  api.get<ScheduleResponse>(schedulePath(id), { signal });

export const createSchedule = (body: ScheduleRequest, signal?: AbortSignal) =>
  api.post("/schedules", body, { signal });

export const updateSchedule = (
  id: number | string,
  body: ScheduleRequest,
  signal?: AbortSignal,
) => api.patch(schedulePath(id), body, { signal });

export const deleteSchedule = (id: number | string, signal?: AbortSignal) =>
  api.delete(schedulePath(id), { signal });
