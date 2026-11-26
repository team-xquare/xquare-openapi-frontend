import type { ScheduleResponse } from "@/lib/schedules-api";
import type { StudySupervisorDayResponse } from "@/lib/study-supervisors-api";

export {
  SCHEDULE_CONTENT_MAX_LENGTH,
  SCHEDULE_TITLE_MAX_LENGTH,
} from "@/lib/schedules-api";

export interface Schedule {
  id: string;
  // YYYY-MM-DD
  date: string;
  title: string;
  description?: string;
}

export interface Supervision {
  date: string;
  // 배정되지 않은 층은 비워 둠
  floor2?: string;
  floor3?: string;
  floor4?: string;
}

export interface Month {
  year: number;
  month: number;
}

// 나이스에서 받아온 일정(source NEIS)은 이 화면에서 고치지 않으므로 학교가 등록한 일정만 씀
export const isSchoolSchedule = (response: ScheduleResponse) =>
  response.source === "SCHOOL";

export const toSchedule = (response: ScheduleResponse): Schedule => ({
  id: String(response.id),
  date: response.date,
  title: response.title,
  description: response.content || undefined,
});

// 배정이 없는 날(id null)은 자습 감독 표에 넣지 않음
export const toSupervisions = (days: StudySupervisorDayResponse[]) =>
  days
    .filter((day) => day.id !== null)
    .map((day): Supervision => {
      const teacherOf = (floor: number) =>
        day.supervisors.find((item) => item.floor === floor)?.teacher?.name;
      return {
        date: day.date,
        floor2: teacherOf(2),
        floor3: teacherOf(3),
        floor4: teacherOf(4),
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

const pad = (value: number) => String(value).padStart(2, "0");

// "2026-09-14"이나 "2026-09" → 2026년 9월
export const monthOf = (date: string): Month => ({
  year: Number(date.slice(0, 4)),
  month: Number(date.slice(5, 7)),
});

export const toMonthKey = ({ year, month }: Month) => `${year}-${pad(month)}`;

// 그 달 1일 ~ 말일
export const getMonthRange = ({ year, month }: Month) => {
  const lastDay = new Date(year, month, 0).getDate();
  return {
    startDate: `${year}-${pad(month)}-01`,
    finishDate: `${year}-${pad(month)}-${pad(lastDay)}`,
  };
};
