export const MEAL_TIMES = [
  { key: "breakfast", label: "조식" },
  { key: "lunch", label: "중식" },
  { key: "dinner", label: "석식" },
] as const;

export type MealTime = (typeof MEAL_TIMES)[number]["key"];

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const toDate = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const getWeekday = (date: string) => WEEKDAYS[toDate(date).getDay()];

export const isWeekend = (date: string) => {
  const day = toDate(date).getDay();
  return day === 0 || day === 6;
};

export const formatDate = (year: number, month: number, day: number) =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

// 2026-02-31처럼 형식만 맞는 날짜는 걸러 냄
export const isMealDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = toDate(value);
  return (
    formatDate(date.getFullYear(), date.getMonth() + 1, date.getDate()) ===
    value
  );
};

export const getMonthDates = (year: number, month: number) => {
  const lastDay = new Date(year, month, 0).getDate();
  return Array.from({ length: lastDay }, (_, index) =>
    formatDate(year, month, index + 1),
  );
};
