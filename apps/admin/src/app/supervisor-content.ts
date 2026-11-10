export const FLOORS = [2, 3, 4] as const;

export type Floor = (typeof FLOORS)[number];

export interface Supervision {
  // YYYY-MM-DD. 하루에 한 건이라 날짜를 id로 씀
  date: string;
  // 층별 감독 교직원. 없는 층은 미배정
  teachers: Partial<Record<Floor, string>>;
}

// 홈 기준일(2026-09-14)이 있는 달을 처음에 보여 줌
export const SUPERVISION_BASE_YEAR = 2026;
export const SUPERVISION_BASE_MONTH = 9;

// 자습감독 API 연동 전까지 쓰는 더미 데이터 (Figma 기준)
export const SUPERVISIONS: Supervision[] = [
  {
    date: "2026-09-14",
    teachers: { 2: "이진경", 3: "정은진", 4: "김선생" },
  },
  { date: "2026-09-15", teachers: { 2: "정은진", 3: "박지현" } },
  { date: "2026-09-16", teachers: {} },
  {
    date: "2026-09-17",
    teachers: { 2: "홍길동", 3: "김선생", 4: "박선생" },
  },
  {
    date: "2026-09-18",
    teachers: { 2: "박지현", 3: "정은진", 4: "이진경" },
  },
];

// 교직원 API 연동 전이라 선택 목록도 더미로 둠
export const TEACHERS = [
  "홍길동",
  "이진경",
  "정은진",
  "김선생",
  "박지현",
  "박선생",
  "김영희",
];

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export const getWeekday = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  return WEEKDAYS[new Date(year, month - 1, day).getDay()];
};

export const toMonthPrefix = (year: number, month: number) =>
  `${year}-${String(month).padStart(2, "0")}`;

export const findSupervision = (date: string) =>
  SUPERVISIONS.find((supervision) => supervision.date === date);
