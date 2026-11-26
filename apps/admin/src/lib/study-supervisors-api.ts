import { api } from "./api";
import { withQuery } from "./query";

// 자습감독 API (GET · POST /study-supervisors, GET /study-supervisors/day,
// PATCH · DELETE /study-supervisors/{studySupervisorId})

// 감독하는 층 (2 ~ 4층)
export const SUPERVISION_FLOORS = [2, 3, 4] as const;

export interface StudySupervisorFloorResponse {
  floor: number;
  // 배정하지 않은 층이면 null
  teacher: { teacherId: number; name: string } | null;
}

export interface StudySupervisorDayResponse {
  // 배정이 없는 날이면 null
  id: number | null;
  // YYYY-MM-DD
  date: string;
  supervisors: StudySupervisorFloorResponse[];
}

export interface StudySupervisorRangeResponse {
  startDate: string;
  finishDate: string;
  supervisions: StudySupervisorDayResponse[];
}

// 등록 · 수정 본문. 층마다 선생님 한 명 (같은 층을 두 번 넣을 수 없음)
export interface StudySupervisorRequest {
  date: string;
  supervisors: { floor: number; teacherId: number }[];
}

const supervisionPath = (id: number | string) =>
  `/study-supervisors/${encodeURIComponent(String(id))}`;

// 시작일 ~ 종료일(포함) 배정
export const fetchSupervisions = (
  range: { startDate: string; finishDate: string },
  signal?: AbortSignal,
) =>
  api.get<StudySupervisorRangeResponse>(
    withQuery("/study-supervisors", range),
    { signal },
  );

// 하루 배정. 배정이 없으면 id가 null
export const fetchSupervisionDay = (date: string, signal?: AbortSignal) =>
  api.get<StudySupervisorDayResponse>(
    withQuery("/study-supervisors/day", { date }),
    { signal },
  );

export const createSupervision = (
  body: StudySupervisorRequest,
  signal?: AbortSignal,
) => api.post("/study-supervisors", body, { signal });

export const updateSupervision = (
  id: number | string,
  body: StudySupervisorRequest,
  signal?: AbortSignal,
) => api.patch(supervisionPath(id), body, { signal });

export const deleteSupervision = (id: number | string, signal?: AbortSignal) =>
  api.delete(supervisionPath(id), { signal });
