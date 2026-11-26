import {
  API_FIELD_LABELS,
  API_FIELD_LEVEL_LABELS,
  fetchApplication,
  fetchApplications,
} from "@/lib/api-applications-api";
import { errorMessage, isAbortError } from "@/lib/api-error";
import { MAX_PAGE_SIZE } from "@/lib/api-types";
import { fetchMeals } from "@/lib/meals-api";
import { fetchSchedules } from "@/lib/schedules-api";
import { fetchStudents } from "@/lib/students-api";
import {
  SUPERVISION_FLOORS,
  fetchSupervisions,
  type StudySupervisorDayResponse,
} from "@/lib/study-supervisors-api";
import { fetchAllClubs, fetchAllTeachers } from "./club-content";
import { getMonthDates, getWeekday, isWeekend } from "./meal-content";
import { fetchNoticePage, type NoticeSummary } from "./notice-content";

export interface HomeStat {
  label: string;
  value: string;
  caption: string;
  // 입력이 빠졌거나 불러오지 못한 데이터라 빨간 글씨로 표시
  isWarning?: boolean;
}

export interface HomeTodayItem {
  label: string;
  value: string;
}

export interface HomeIssue {
  title: string;
  description: string;
  actionLabel: string;
  href: string;
}

export interface HomeData {
  stats: HomeStat[];
  today: HomeTodayItem[];
  issues: HomeIssue[];
  // 확인이 필요한 항목 중 불러오지 못한 것 ("활용신청: 서버 문구")
  issueErrors: string[];
  notices: { list: NoticeSummary[] } | { error: string };
}

// 불러오는 동안 현황 카드 자리를 잡아 둠
export const HOME_STAT_LABELS = ["학생", "교직원", "동아리", "공지", "급식"];

export const HOME_TODAY_LABELS = ["학사 일정", "자습 감독", "시간표"];

// 시간표는 학급을 골라야 해서 홈에서는 보여 주지 않음
const TIMETABLE_GUIDE = "학급별 시간표는 일정 관리에서 볼 수 있습니다.";

// 확인이 필요한 항목에서 급식 · 자습 감독을 살펴보는 기간 (오늘부터)
const UPCOMING_DAYS = 7;

const RECENT_NOTICE_COUNT = 3;

const addDays = (date: string, days: number) => {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
};

// "2026-09-14" → "2026-09-14 월요일"
export const formatToday = (date: string) => `${date} ${getWeekday(date)}요일`;

type Settled<T> = { data: T } | { error: string };

// 한 곳이 실패해도 나머지는 보여 주도록 결과를 나눠 담음. 직접 취소한 요청은 그대로 넘김
async function settle<T>(task: Promise<T>, fallback: string): Promise<Settled<T>> {
  try {
    return { data: await task };
  } catch (error) {
    if (isAbortError(error)) throw error;
    return { error: errorMessage(error, fallback) };
  }
}

const failedStat = (label: string, error: string): HomeStat => ({
  label,
  value: "—",
  caption: error,
  isWarning: true,
});

// 가장 오래 기다린 승인 대기 신청과 전체 건수
async function fetchPendingApplications(signal: AbortSignal) {
  const page = await fetchApplications(
    { status: "PENDING", size: MAX_PAGE_SIZE },
    signal,
  );
  const oldest = [...page.content].sort((a, b) =>
    a.appliedAt.localeCompare(b.appliedAt),
  )[0];
  if (!oldest) return { total: page.totalCount, oldest: null, applicant: null };
  // 신청자 이름은 상세에만 있어서 한 건만 더 받음. 못 받아도 나머지는 보여 줌
  const detail = await fetchApplication(oldest.applicationId, signal).catch(
    (error: unknown) => {
      if (isAbortError(error)) throw error;
      return null;
    },
  );
  return {
    total: page.totalCount,
    oldest,
    applicant: detail?.applicant?.name ?? null,
  };
}

const supervisionText = (day: StudySupervisorDayResponse | undefined) => {
  if (!day || day.id === null) return "배정된 감독이 없습니다.";
  return SUPERVISION_FLOORS.map((floor) => {
    const teacher = day.supervisors.find((item) => item.floor === floor)?.teacher;
    return `${floor}층 ${teacher?.name ?? "미배정"}`;
  }).join(" · ");
};

// 감독이 비어 있는 층. 배정이 없는 날이면 모든 층
const emptyFloors = (day: StudySupervisorDayResponse | undefined) =>
  SUPERVISION_FLOORS.filter(
    (floor) =>
      !day ||
      day.id === null ||
      !day.supervisors.find((item) => item.floor === floor)?.teacher,
  );

// 홈 화면 데이터. today는 브라우저 기준 오늘(YYYY-MM-DD)
export async function loadHomeData(
  today: string,
  signal: AbortSignal,
): Promise<HomeData> {
  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7));
  const monthDates = getMonthDates(year, month);
  const upcomingDates = Array.from({ length: UPCOMING_DAYS }, (_, index) =>
    addDays(today, index),
  ).filter((date) => !isWeekend(date));
  const lastUpcoming = addDays(today, UPCOMING_DAYS - 1);
  const monthEnd = monthDates[monthDates.length - 1];

  const [
    students,
    teachers,
    clubs,
    notices,
    meals,
    schedules,
    supervisions,
    pending,
  ] = await Promise.all([
    settle(fetchStudents({ size: 1 }, signal), "학생 수를 불러오지 못했습니다."),
    settle(fetchAllTeachers(signal), "교직원 수를 불러오지 못했습니다."),
    settle(fetchAllClubs(signal), "동아리를 불러오지 못했습니다."),
    settle(
      fetchNoticePage(0, MAX_PAGE_SIZE, signal),
      "공지를 불러오지 못했습니다.",
    ),
    // 이번 달 현황과 앞으로 7일 확인을 한 번에 받음
    settle(
      fetchMeals(
        {
          startDate: monthDates[0],
          finishDate: lastUpcoming > monthEnd ? lastUpcoming : monthEnd,
        },
        signal,
      ),
      "급식을 불러오지 못했습니다.",
    ),
    settle(
      fetchSchedules({ startDate: today, finishDate: today }, signal),
      "학사 일정을 불러오지 못했습니다.",
    ),
    settle(
      fetchSupervisions({ startDate: today, finishDate: lastUpcoming }, signal),
      "자습 감독을 불러오지 못했습니다.",
    ),
    settle(
      fetchPendingApplications(signal),
      "활용신청을 불러오지 못했습니다.",
    ),
  ]);

  const mealDates = "data" in meals
    ? new Set(meals.data.meals.map((meal) => meal.date))
    : null;
  const thisMonth = today.slice(0, 7);

  const stats: HomeStat[] = [
    "data" in students
      ? {
          label: "학생",
          value: `${students.data.totalCount}명`,
          caption: "학년 전체",
        }
      : failedStat("학생", students.error),
    "data" in teachers
      ? {
          label: "교직원",
          value: `${teachers.data.length}명`,
          caption: `부장 ${teachers.data.filter((teacher) => teacher.isManager).length}명 포함`,
        }
      : failedStat("교직원", teachers.error),
    "data" in clubs
      ? {
          label: "동아리",
          value: `${clubs.data.length}개`,
          caption: `담당 미지정 ${clubs.data.filter((club) => !club.teacher).length}개`,
        }
      : failedStat("동아리", clubs.error),
    "data" in notices
      ? {
          label: "공지",
          value: `${notices.data.totalCount}건`,
          // 최신순 100건 안에서 셈. 한 달에 100건 넘게 쓰지 않는다고 봄
          caption: `이번 달 ${notices.data.notices.filter((notice) => notice.createdAt.startsWith(thisMonth)).length}건`,
        }
      : failedStat("공지", notices.error),
    (() => {
      if (!mealDates) return failedStat("급식", "error" in meals ? meals.error : "");
      const missing = monthDates.filter(
        (date) => !isWeekend(date) && !mealDates.has(date),
      ).length;
      return {
        label: "급식",
        value: `${month}월 미등록 ${missing}일`,
        caption: "급식 미등록 날짜",
        isWarning: missing > 0,
      };
    })(),
  ];

  const todayItems: HomeTodayItem[] = [
    {
      label: "학사 일정",
      value:
        "error" in schedules
          ? schedules.error
          : schedules.data.length > 0
            ? schedules.data
                .map((schedule) =>
                  schedule.content
                    ? `${schedule.title} · ${schedule.content}`
                    : schedule.title,
                )
                .join(", ")
            : "오늘 일정이 없습니다.",
    },
    {
      label: "자습 감독",
      value:
        "error" in supervisions
          ? supervisions.error
          : supervisionText(
              supervisions.data.supervisions.find((day) => day.date === today),
            ),
    },
    { label: "시간표", value: TIMETABLE_GUIDE },
  ];

  const issues: HomeIssue[] = [];
  const issueErrors: string[] = [];

  if ("error" in pending) {
    issueErrors.push(`활용신청: ${pending.error}`);
  } else if (pending.data.oldest) {
    const { total, oldest, applicant } = pending.data;
    const target = `${oldest.projectName} · ${API_FIELD_LABELS[oldest.field]} 분야 (${API_FIELD_LEVEL_LABELS[oldest.level]})`;
    issues.push({
      title: `활용신청 승인 대기 ${total}건`,
      description:
        [target, applicant].filter(Boolean).join(" · ") +
        (total > 1 ? ` 외 ${total - 1}건` : ""),
      actionLabel: "검토",
      // 한 건이면 바로 상세로, 여러 건이면 목록에서 고르게 함
      href: total === 1 ? `/apply/${oldest.applicationId}` : "/apply",
    });
  }

  if (mealDates) {
    const missing = upcomingDates.find((date) => !mealDates.has(date));
    if (missing) {
      issues.push({
        title: `${missing} 급식 미등록`,
        description: "이 날짜 급식이 아직 등록되지 않았습니다.",
        actionLabel: "입력",
        href: `/meal/new?date=${missing}`,
      });
    }
  } else if ("error" in meals) {
    issueErrors.push(`급식: ${meals.error}`);
  }

  if ("error" in supervisions) {
    issueErrors.push(`자습 감독: ${supervisions.error}`);
  } else {
    const days = supervisions.data.supervisions;
    const date = upcomingDates.find(
      (item) => emptyFloors(days.find((day) => day.date === item)).length > 0,
    );
    if (date) {
      const day = days.find((item) => item.date === date);
      const floors = emptyFloors(day);
      issues.push({
        title: `${date} 자습 감독 미배정`,
        description:
          floors.length === SUPERVISION_FLOORS.length
            ? `${floors.map((floor) => `${floor}층`).join(" · ")} 모두 비어 있습니다.`
            : `${floors.map((floor) => `${floor}층`).join(" · ")}이 비어 있습니다.`,
        actionLabel: "배정",
        // 배정이 없는 날은 새로 등록하고, 일부만 빈 날은 그 배정을 고침
        href:
          day && day.id !== null
            ? `/supervisor/${date}/edit`
            : "/supervisor/new",
      });
    }
  }

  if ("error" in clubs) {
    issueErrors.push(`동아리: ${clubs.error}`);
  } else {
    const unassigned = clubs.data.filter((club) => !club.teacher);
    if (unassigned.length > 0) {
      const [first] = unassigned;
      issues.push({
        title: `동아리 ${first.name} 담당 선생님 미지정`,
        description:
          unassigned.length > 1
            ? `동아리 수정에서 담당 선생님을 지정하세요. (미지정 ${unassigned.length}개)`
            : "동아리 수정에서 담당 선생님을 지정하세요.",
        actionLabel: "지정",
        href: `/club/${first.id}/edit`,
      });
    }
  }

  return {
    stats,
    today: todayItems,
    issues,
    issueErrors,
    notices:
      "data" in notices
        ? { list: notices.data.notices.slice(0, RECENT_NOTICE_COUNT) }
        : { error: notices.error },
  };
}
