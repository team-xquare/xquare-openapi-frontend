import { api } from "./api";
import type { PageResponse } from "./api-types";
import { withQuery } from "./query";

// 동아리 API (GET · POST /clubs, GET · PATCH · DELETE /clubs/{clubId})

const FLOORS = [1, 2, 3, 4, 5] as const;
const ROOM_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

// 사용 교실. ROOM_{층}_{번호}
export type ClubRoom =
  `ROOM_${(typeof FLOORS)[number]}_${(typeof ROOM_NUMBERS)[number]}`;

export const CLUB_ROOMS: ClubRoom[] = FLOORS.flatMap((floor) =>
  ROOM_NUMBERS.map((number) => `ROOM_${floor}_${number}` as const),
);

export interface ClubStudentResponse {
  id: number;
  studentNumber: number;
  name: string;
}

export interface ClubTeacherResponse {
  id: number;
  name: string;
}

export interface ClubResponse {
  id: number;
  name: string;
  // 로고 이미지 주소(또는 파일 이름)
  logo: string;
  room: ClubRoom | null;
  // 팀장. 없으면 null
  manager: ClubStudentResponse | null;
  member: ClubStudentResponse[];
  // 담당 선생님. 없으면 null
  teacher: ClubTeacherResponse | null;
}

export type ClubSearch = {
  name?: string;
  room?: ClubRoom;
  // 선생님 이름
  teacher?: string;
  // 0부터
  page?: number;
  // 1 ~ 100
  size?: number;
};

// 등록 · 수정 본문. 구성원 · 팀장 · 담당 선생님은 id로 보냄
export interface ClubRequest {
  name: string;
  logo: string;
  room: ClubRoom;
  // 팀장 학생 id (구성원 중 한 명)
  manager: number;
  // 구성원 학생 id (최대 50명)
  member: number[];
  // 담당 선생님 id. 없으면 null
  teacher: number | null;
}

// 서버 ClubRequest 검증과 같음
export const CLUB_NAME_MAX_LENGTH = 20;
export const CLUB_LOGO_MAX_LENGTH = 255;
export const CLUB_MEMBER_MAX_COUNT = 50;

const clubPath = (id: number | string) =>
  `/clubs/${encodeURIComponent(String(id))}`;

export const fetchClubs = (search: ClubSearch, signal?: AbortSignal) =>
  api.get<PageResponse<ClubResponse>>(withQuery("/clubs", search), { signal });

export const fetchClub = (id: number | string, signal?: AbortSignal) =>
  api.get<ClubResponse>(clubPath(id), { signal });

export const createClub = (body: ClubRequest, signal?: AbortSignal) =>
  api.post("/clubs", body, { signal });

export const updateClub = (
  id: number | string,
  body: ClubRequest,
  signal?: AbortSignal,
) => api.patch(clubPath(id), body, { signal });

export const deleteClub = (id: number | string, signal?: AbortSignal) =>
  api.delete(clubPath(id), { signal });
