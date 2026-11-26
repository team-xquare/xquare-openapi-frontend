import type { TimetableResponse } from "@/lib/timetables-api";

// 시간표는 컴시간 알리미에서 받아오고, 일정 화면에서는 보기만 함

// [교시][요일] 순서의 과목. 수업이 없는 칸은 null
export type WeekTimetable = (string | null)[][];

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

// 처음 열었을 때 보여줄 학급 (Figma와 같은 2학년 1반)
export const TIMETABLE_DEFAULT_CLASS = { grade: 2, classNumber: 1 };

const toDate = (date: string) => new Date(`${date}T00:00:00Z`);

const addDays = (date: string, days: number) => {
  const next = toDate(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
};

// date가 속한 주의 월요일
const mondayOf = (date: string) =>
  addDays(date, -((toDate(date).getUTCDay() + 6) % 7));

const buildWeek = (start: string, name: string): TimetableWeek => {
  const dates = TIMETABLE_DAYS.map((_, index) => addDays(start, index));
  const range = `${dates[0].slice(5)} ~ ${dates[dates.length - 1].slice(5)}`;
  return { start, dates, label: `${name} · ${range}` };
};

// 오늘을 기준으로 지난 주 · 이번 주 · 다음 주
export const getTimetableWeeks = (today: string): TimetableWeek[] => {
  const thisMonday = mondayOf(today);
  return [
    buildWeek(addDays(thisMonday, -7), "지난 주"),
    buildWeek(thisMonday, "이번 주"),
    buildWeek(addDays(thisMonday, 7), "다음 주"),
  ];
};

// 7교시보다 늦게 끝나는 날이 있으면 그 교시까지 줄을 늘림 (시작 시각은 모름)
export const getTimetablePeriods = (timetable: TimetableResponse | null) => {
  const lastPeriod = Math.max(
    TIMETABLE_PERIODS.length,
    ...(timetable?.days.flatMap((day) => day.periods.map((item) => item.period)) ??
      []),
  );
  return Array.from(
    { length: lastPeriod },
    (_, index) =>
      TIMETABLE_PERIODS[index] ?? { period: index + 1, startsAt: undefined },
  );
};

// 서버의 날짜별 교시 목록을 [교시][요일] 표로 바꿈
export const toWeekTimetable = (
  timetable: TimetableResponse,
  week: TimetableWeek,
  periods: { period: number }[],
): WeekTimetable =>
  periods.map(({ period }) =>
    week.dates.map((date) => {
      const day = timetable.days.find((item) => item.date === date);
      return day?.periods.find((item) => item.period === period)?.subject ?? null;
    }),
  );
