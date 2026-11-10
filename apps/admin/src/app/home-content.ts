import { NOTICES } from "./notice-content";

// 홈 API 연동 전까지 쓰는 더미 데이터 (Figma 기준일)
export const BASE_DATE = "2026-09-14";
export const BASE_WEEKDAY = "월";

export interface HomeStat {
  label: string;
  value: string;
  caption: string;
  // 입력이 빠진 데이터라 빨간 글씨로 표시
  isWarning?: boolean;
}

const BASE_MONTH = BASE_DATE.slice(0, 7);
const noticesThisMonth = NOTICES.filter((notice) =>
  notice.createdAt.startsWith(BASE_MONTH),
);

export const HOME_STATS: HomeStat[] = [
  { label: "학생", value: "312명", caption: "학년 전체" },
  { label: "교직원", value: "48명", caption: "부장 2명 포함" },
  { label: "동아리", value: "5개", caption: "담당 미지정 1개" },
  // 공지는 공지 관리 화면과 같은 더미 목록에서 셈
  {
    label: "공지",
    value: `${NOTICES.length}건`,
    caption: `이번 달 ${noticesThisMonth.length}건`,
  },
  {
    label: "급식",
    value: "9월 미등록 1일",
    caption: "나이스 미제공 날짜",
    isWarning: true,
  },
];

export const TODAY_ITEMS = [
  { label: "학사 일정", value: "중간고사 시작 · 1~3학년 전체" },
  { label: "자습 감독", value: "2층 이진경 · 3층 정은진 · 4층 김선생" },
  {
    label: "시간표",
    value: "시간표 API가 아직 정의되지 않아 표시할 수 없습니다.",
  },
];

export interface HomeIssue {
  title: string;
  description: string;
  actionLabel: string;
  // 급식·자습감독·동아리 화면은 아직 없어 공지(/notice)와 같은 규칙으로 경로만 정해 둠
  href: string;
}

export const HOME_ISSUES: HomeIssue[] = [
  {
    title: "2026-09-03 급식 미등록",
    description: "나이스에 이 날짜 급식이 없습니다.",
    actionLabel: "입력",
    href: "/meal/new?date=2026-09-03",
  },
  {
    title: "2026-09-16 자습 감독 미배정",
    description: "2층 · 3층 · 4층 모두 비어 있습니다.",
    actionLabel: "배정",
    href: "/supervisor/new",
  },
  {
    title: "동아리 DAUS 담당 선생님 미지정",
    description: "동아리 수정에서 담당 선생님을 지정하세요.",
    actionLabel: "지정",
    href: "/club/daus/edit",
  },
];

// NOTICES가 최신순이라 앞에서부터 자름
export const RECENT_NOTICES = NOTICES.slice(0, 3);
