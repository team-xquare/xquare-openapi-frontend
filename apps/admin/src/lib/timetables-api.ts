import { api } from "./api";
import { withQuery } from "./query";

// 시간표 API (GET /timetables). 컴시간 알리미에서 받아온 학급 시간표라 조회만 있음

export interface TimetablePeriodResponse {
  // 교시 (1부터)
  period: number;
  subject: string;
}

export interface TimetableDayResponse {
  // YYYY-MM-DD
  date: string;
  periods: TimetablePeriodResponse[];
}

export interface TimetableResponse {
  grade: number;
  classNum: number;
  // 그 주의 첫날 ~ 마지막 날
  startDate: string;
  finishDate: string;
  days: TimetableDayResponse[];
}

// date가 속한 주의 학급 시간표. date가 없으면 이번 주
export const fetchTimetable = (
  search: { grade: number; classNum: number; date?: string },
  signal?: AbortSignal,
) => api.get<TimetableResponse>(withQuery("/timetables", search), { signal });
