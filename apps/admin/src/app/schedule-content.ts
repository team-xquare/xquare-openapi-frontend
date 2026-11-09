import { BASE_DATE } from "./home-content";

export type ScheduleSource = "neis" | "school";

export const SCHEDULE_SOURCE_LABEL: Record<ScheduleSource, string> = {
  neis: "나이스",
  school: "학교 입력",
};

export interface Schedule {
  id: string;
  // YYYY-MM-DD
  date: string;
  title: string;
  description?: string;
  source: ScheduleSource;
}

export interface Supervision {
  date: string;
  // 배정되지 않은 층은 비워 둠
  floor2?: string;
  floor3?: string;
  floor4?: string;
}

export const SCHEDULE_TITLE_MAX_LENGTH = 50;

// 일정 화면을 처음 열었을 때 보여줄 연·월 (홈 화면과 같은 기준일)
export const SCHEDULE_BASE_YEAR = Number(BASE_DATE.slice(0, 4));
export const SCHEDULE_BASE_MONTH = Number(BASE_DATE.slice(5, 7));

// 일정 API 연동 전까지 쓰는 더미 데이터
export const SCHEDULES: Schedule[] = [
  { id: "1", date: "2026-08-17", title: "여름방학 종료", source: "neis" },
  { id: "2", date: "2026-09-01", title: "2학기 개학", source: "neis" },
  {
    id: "3",
    date: "2026-09-05",
    title: "체육대회",
    description: "우천 시 9월 12일로 순연",
    source: "school",
  },
  {
    id: "4",
    date: "2026-09-14",
    title: "중간고사 시작",
    description: "1~3학년 전체",
    source: "school",
  },
  { id: "5", date: "2026-09-28", title: "추석 연휴 시작", source: "neis" },
  { id: "6", date: "2026-10-09", title: "한글날", source: "neis" },
];

// 자습 감독은 자습감독 화면에서 입력하고, 일정 화면에서는 보기만 함
export const SUPERVISIONS: Supervision[] = [
  {
    date: "2026-09-14",
    floor2: "이진경",
    floor3: "정은진",
    floor4: "김선생",
  },
  { date: "2026-09-15", floor2: "정은진", floor3: "박지현" },
];
