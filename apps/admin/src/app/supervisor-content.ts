import { MAX_PAGE_SIZE, fetchAllPages } from "@/lib/api-types";
import {
  SUPERVISION_FLOORS,
  fetchSupervisionDay,
  fetchSupervisions,
  type StudySupervisorDayResponse,
} from "@/lib/study-supervisors-api";
import { fetchTeachers } from "@/lib/teachers-api";

// 서버가 받는 층(2 ~ 4층)과 같음
export const FLOORS = SUPERVISION_FLOORS;

export type Floor = (typeof FLOORS)[number];

// 감독 교직원. 선택지와 배정된 값에 같이 씀
export interface SupervisionTeacher {
  id: number;
  name: string;
}

export interface Supervision {
  // 수정 · 삭제 API에 쓰는 서버 id
  id: number;
  // YYYY-MM-DD. 하루에 한 건이라 화면 주소에는 날짜를 씀
  date: string;
  // 층별 감독 교직원. 없는 층은 미배정
  teachers: Partial<Record<Floor, SupervisionTeacher>>;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const pad = (value: number) => String(value).padStart(2, "0");

export const getWeekday = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  return WEEKDAYS[new Date(year, month - 1, day).getDay()];
};

export const toMonthPrefix = (year: number, month: number) =>
  `${year}-${pad(month)}`;

// 주소로 들어온 날짜가 YYYY-MM-DD 형식의 실제 날짜인지
export function isValidDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const [year, month, day] = date.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
}

const isFloor = (floor: number): floor is Floor =>
  FLOORS.some((item) => item === floor);

// 배정이 없는 날(id가 null)은 null
function toSupervision(response: StudySupervisorDayResponse): Supervision | null {
  if (response.id === null) return null;
  const teachers: Supervision["teachers"] = {};
  for (const { floor, teacher } of response.supervisors) {
    if (teacher && isFloor(floor)) {
      teachers[floor] = { id: teacher.teacherId, name: teacher.name };
    }
  }
  return { id: response.id, date: response.date, teachers };
}

// 같은 배정을 다시 받았는지 비교하고, 수정 폼을 구분하는 key로 씀
export const supervisionKey = (supervision: Supervision) =>
  [
    supervision.id,
    supervision.date,
    ...FLOORS.map((floor) => {
      const teacher = supervision.teachers[floor];
      return teacher ? `${teacher.id}:${teacher.name}` : "";
    }),
  ].join("|");

// 한 달(YYYY-MM) 배정을 날짜순으로. 배정이 없는 날은 뺌
export async function fetchMonthSupervisions(
  monthPrefix: string,
  signal?: AbortSignal,
) {
  const [year, month] = monthPrefix.split("-").map(Number);
  // 다음 달 0일 = 이번 달 마지막 날
  const lastDay = new Date(year, month, 0).getDate();
  const response = await fetchSupervisions(
    {
      startDate: `${monthPrefix}-01`,
      finishDate: `${monthPrefix}-${pad(lastDay)}`,
    },
    signal,
  );
  return response.supervisions
    .map(toSupervision)
    .filter((supervision) => supervision !== null)
    .sort((a, b) => a.date.localeCompare(b.date));
}

// 그날 배정. 배정이 없으면 null
export async function fetchSupervision(date: string, signal?: AbortSignal) {
  return toSupervision(await fetchSupervisionDay(date, signal));
}

// 겹치는 교직원은 하나만 두고 이름순으로 합침
export function mergeTeachers(...lists: SupervisionTeacher[][]) {
  const byId = new Map<number, SupervisionTeacher>();
  for (const teacher of lists.flat()) {
    if (!byId.has(teacher.id)) byId.set(teacher.id, teacher);
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, "ko"));
}

// 감독 교직원 선택지. 교직원 API에 이름 정렬이 없어 모두 받아 이름순으로 정렬
export async function fetchTeacherChoices(signal?: AbortSignal) {
  const teachers = await fetchAllPages((page) =>
    fetchTeachers({ page, size: MAX_PAGE_SIZE }, signal),
  );
  return mergeTeachers(teachers.map(({ id, name }) => ({ id, name })));
}
