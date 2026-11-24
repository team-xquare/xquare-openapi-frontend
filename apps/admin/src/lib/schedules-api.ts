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

// 기간 목록 조회는 Swagger에 없어서 급식 · 자습감독과 같은 형식(startDate · finishDate)으로 가정함.
// 응답도 정해지지 않아 배열이나 { schedules } 둘 다 받음 (서버 확인 필요)
export async function fetchSchedules(
  range: { startDate: string; finishDate: string },
  signal?: AbortSignal,
): Promise<ScheduleResponse[]> {
  const response = await api.get<
    ScheduleResponse[] | { schedules?: ScheduleResponse[] }
  >(withQuery("/schedules", range), { signal });
  if (Array.isArray(response)) return response;
  return response?.schedules ?? [];
}

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
