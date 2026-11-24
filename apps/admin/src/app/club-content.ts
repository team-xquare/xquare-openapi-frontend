import { fetchAllPages, MAX_PAGE_SIZE } from "@/lib/api-types";
import {
  CLUB_ROOMS,
  fetchClubs,
  type ClubResponse,
  type ClubRoom,
  type ClubStudentResponse,
} from "@/lib/clubs-api";
import { fetchStudents, type StudentResponse } from "@/lib/students-api";
import { fetchTeachers } from "@/lib/teachers-api";

// ROOM_2_3 → "2-3" (층-번호)
export const formatClubRoom = (room: ClubRoom) =>
  room.slice("ROOM_".length).replace("_", "-");

// 선택 목록 값(문자열)을 교실 값으로 되돌림. 목록에 없는 값이면 undefined
export const toClubRoom = (value: string) =>
  CLUB_ROOMS.find((room) => room === value);

// 학번만 있는 구성원 응답도 쓰도록 학번(2315)을 2학년 3반 15번으로 나눔
export const formatStudentNumber = (studentNumber: number) =>
  `${Math.floor(studentNumber / 1000)}학년 ${Math.floor(studentNumber / 100) % 10}반 ${studentNumber % 100}번`;

// 팀장을 맨 앞에 둠. 응답의 member에 팀장이 들어 있는지 정해져 있지 않아 id로 겹침을 뺌
export const getClubMembers = (club: ClubResponse) => {
  const members: ClubStudentResponse[] = club.manager ? [club.manager] : [];
  for (const member of club.member) {
    if (!members.some((item) => item.id === member.id)) members.push(member);
  }
  return members;
};

// 로고 API가 문자열만 받아서 이미지 주소일 때만 그림으로 보여 줌
export const isLogoUrl = (logo: string) => /^https?:\/\//i.test(logo);

// 담당 선생님 '미지정' 검색이 API에 없고, 교실 · 선생님 선택 목록도 전체 동아리로 만들어서
// 목록을 모두 받아 화면에서 거름
export const fetchAllClubs = (signal?: AbortSignal) =>
  fetchAllPages((page) => fetchClubs({ page, size: MAX_PAGE_SIZE }, signal));

export const fetchAllTeachers = (signal?: AbortSignal) =>
  fetchAllPages((page) => fetchTeachers({ page, size: MAX_PAGE_SIZE }, signal));

const MAX_SEARCH_RESULTS = 8;

// 이름 또는 학번 앞자리로 찾음. 학생 API에 학번 검색이 없어 학번은 앞 두 자리로
// 학년 · 반을 좁혀 받은 뒤 화면에서 앞자리가 같은 학생만 거름
export async function searchStudents(
  query: string,
  signal?: AbortSignal,
): Promise<StudentResponse[]> {
  const keyword = query.trim();
  if (!keyword) return [];

  if (!/^\d+$/.test(keyword)) {
    const page = await fetchStudents(
      { name: keyword, size: MAX_SEARCH_RESULTS },
      signal,
    );
    return page.content;
  }

  // 학번은 네 자리, 학년은 1 ~ 3이라 그 밖이면 서버에 묻지 않음
  const grade = Number(keyword[0]);
  if (keyword.length > 4 || grade < 1 || grade > 3) return [];
  const classNum = keyword.length >= 2 ? Number(keyword[1]) : undefined;

  const page = await fetchStudents(
    { grade, classNum, size: MAX_PAGE_SIZE },
    signal,
  );
  return page.content
    .filter((student) => String(student.studentNumber).startsWith(keyword))
    .sort((a, b) => a.studentNumber - b.studentNumber)
    .slice(0, MAX_SEARCH_RESULTS);
}
