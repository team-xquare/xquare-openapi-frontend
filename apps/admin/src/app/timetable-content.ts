import { BASE_DATE } from "./home-content";

// 시간표는 컴시간 알리미에서 받아오고, 일정 화면에서는 보기만 함

export interface Lesson {
  subject: string;
  teacher: string;
  // 원래 시간표와 달라진 수업
  changed?: boolean;
}

// [교시][요일] 순서. 수업이 없는 칸은 null
export type WeekTimetable = (Lesson | null)[][];

export interface TimetableWeek {
  // 그 주 월요일 (YYYY-MM-DD)
  start: string;
  // 월~금 날짜
  dates: string[];
  label: string;
}

export const TIMETABLE_DAYS = ["월", "화", "수", "목", "금"];

export const TIMETABLE_PERIODS = [
  { period: 1, startsAt: "08:40" },
  { period: 2, startsAt: "09:40" },
  { period: 3, startsAt: "10:40" },
  { period: 4, startsAt: "11:40" },
  { period: 5, startsAt: "13:30" },
  { period: 6, startsAt: "14:30" },
  { period: 7, startsAt: "15:30" },
];

export const TIMETABLE_GRADES = [1, 2, 3];
export const TIMETABLE_CLASSES = [1, 2, 3, 4];

// 홈 화면과 같은 기준일을 오늘로 보고, 마지막 동기화는 그날 아침으로 둠
export const TIMETABLE_TODAY = BASE_DATE;
export const TIMETABLE_SYNCED_AT = `${BASE_DATE} 06:00`;

const toDate = (date: string) => new Date(`${date}T00:00:00Z`);

const addDays = (date: string, days: number) => {
  const next = toDate(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
};

// 오늘이 속한 주의 월요일
const THIS_MONDAY = addDays(
  TIMETABLE_TODAY,
  -((toDate(TIMETABLE_TODAY).getUTCDay() + 6) % 7),
);

const buildWeek = (offset: number, name: string): TimetableWeek => {
  const start = addDays(THIS_MONDAY, offset * 7);
  const dates = TIMETABLE_DAYS.map((_, index) => addDays(start, index));
  const range = `${dates[0].slice(5)} ~ ${dates[dates.length - 1].slice(5)}`;
  return { start, dates, label: `${name} · ${range}` };
};

export const TIMETABLE_THIS_WEEK = buildWeek(0, "이번 주");

export const TIMETABLE_WEEKS: TimetableWeek[] = [
  buildWeek(-1, "지난 주"),
  TIMETABLE_THIS_WEEK,
  buildWeek(1, "다음 주"),
];

// 처음 열었을 때 보여줄 학급과 주 (Figma와 같은 2학년 1반 이번 주)
export const TIMETABLE_DEFAULT = {
  grade: 2,
  classNumber: 1,
  weekStart: TIMETABLE_THIS_WEEK.start,
};

export const toTimetableKey = (
  grade: number,
  classNumber: number,
  weekStart: string,
) => `${grade}-${classNumber}-${weekStart}`;

// 시간표 API 연동 전까지 쓰는 더미 데이터. 2학년 1반 이번 주만 있고,
// 다른 학급이나 주를 고르면 모든 칸이 빈 칸(—)으로 보임
const SAMPLE_WEEK: WeekTimetable = [
  [
    { subject: "정보보안", teacher: "박지현" },
    { subject: "자료구조", teacher: "오태훈" },
    { subject: "수학", teacher: "김선생" },
    { subject: "웹프로그래밍", teacher: "윤가람" },
    { subject: "데이터베이스", teacher: "최민수" },
  ],
  [
    { subject: "정보보안", teacher: "박지현" },
    { subject: "자료구조", teacher: "오태훈" },
    { subject: "문학", teacher: "이진경" },
    { subject: "웹프로그래밍", teacher: "윤가람" },
    { subject: "데이터베이스", teacher: "최민수" },
  ],
  [
    { subject: "데이터베이스", teacher: "최민수", changed: true },
    { subject: "영어", teacher: "정은진" },
    { subject: "네트워크", teacher: "서지우" },
    { subject: "국어", teacher: "이진경" },
    { subject: "수학", teacher: "김선생" },
  ],
  [
    { subject: "수학", teacher: "김선생" },
    { subject: "국어", teacher: "이진경" },
    { subject: "네트워크", teacher: "서지우" },
    { subject: "영어", teacher: "정은진" },
    { subject: "문학", teacher: "이진경" },
  ],
  [
    { subject: "영어", teacher: "정은진" },
    { subject: "웹프로그래밍", teacher: "윤가람" },
    { subject: "체육", teacher: "한서윤" },
    { subject: "수학", teacher: "김선생" },
    { subject: "정보보안", teacher: "박지현" },
  ],
  [
    { subject: "문학", teacher: "이진경" },
    { subject: "웹프로그래밍", teacher: "윤가람" },
    { subject: "창체", teacher: "오태훈" },
    { subject: "데이터베이스", teacher: "최민수", changed: true },
    { subject: "영어", teacher: "정은진" },
  ],
  [
    { subject: "체육", teacher: "한서윤" },
    { subject: "진로", teacher: "김선생" },
    { subject: "창체", teacher: "오태훈" },
    { subject: "자료구조", teacher: "오태훈" },
    null,
  ],
];

export const TIMETABLES: Record<string, WeekTimetable> = {
  [toTimetableKey(
    TIMETABLE_DEFAULT.grade,
    TIMETABLE_DEFAULT.classNumber,
    TIMETABLE_DEFAULT.weekStart,
  )]: SAMPLE_WEEK,
};
