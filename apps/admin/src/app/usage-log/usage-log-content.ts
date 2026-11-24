// API 연동은 backend 사용 기록 조회 API 이후 (OPN-109 연동 / OPN-106). 그 전까지는 시안 기준 목업을 씁니다.
export type UsageLog = {
  id: string;
  api: string;
  field: string;
  status: string;
  // 성공/실패는 응답 문자열 앞자리로 추측하지 않고 따로 둡니다.
  ok: boolean;
  applicant: string;
  calledAt: string;
  project: string;
  // 단계 필터용. 키가 없는 공개 API는 "none"입니다.
  stage: "test" | "prod" | "none";
};

// 기간 필터의 기준 시각입니다. 목업 호출 시각이 2026-11-20 근처라
// 지금 날짜로 계산하면 목업이 모두 사라지므로, 목업에서 가장 최근 시각 직후로 고정합니다.
// API를 연동하면 이 값 대신 현재 시각을 씁니다.
export const REFERENCE_TIME = "2026-11-20 14:00:00";

export const USAGE_LOGS: UsageLog[] = [
  {
    id: "log-1",
    api: "GET /students/{studentId}",
    field: "학생",
    status: "403 FORBIDDEN",
    ok: false,
    applicant: "전재준",
    calledAt: "2026-11-20 13:05:12",
    project: "team-xquare · xq_test_8f3a••••",
    stage: "test",
  },
  {
    id: "log-2",
    api: "GET /clubs",
    field: "동아리",
    status: "200 OK",
    ok: true,
    applicant: "전재준",
    calledAt: "2026-11-20 13:04:58",
    project: "team-xquare · xq_test_8f3a••••",
    stage: "test",
  },
  {
    id: "log-3",
    api: "학교 통합 일정 조회",
    field: "일정",
    status: "200 OK",
    ok: true,
    applicant: "전재준",
    calledAt: "2026-11-20 12:41:03",
    project: "dsm-timetable · xq_test_51bd••••",
    stage: "test",
  },
  {
    id: "log-4",
    api: "월간 급식 정보 조회",
    field: "급식",
    status: "200 OK",
    ok: true,
    applicant: "—",
    calledAt: "2026-11-20 12:30:27",
    project: "키 없음 (공개 API)",
    stage: "none",
  },
  {
    id: "log-5",
    api: "자습 감독 정보 일별로 조회",
    field: "자습 감독",
    status: "401 INVALID_API_KEY",
    ok: false,
    applicant: "정하준",
    calledAt: "2026-11-20 11:58:40",
    project: "자습 알림 · xq_test_0c71•••• (만료)",
    stage: "test",
  },
  {
    id: "log-6",
    api: "학생 정보 목록 조회",
    field: "학생",
    status: "200 OK",
    ok: true,
    applicant: "정하준",
    calledAt: "2026-11-20 10:12:45",
    project: "dsm-timetable · xq_test_51bd••••",
    stage: "test",
  },
  {
    id: "log-7",
    api: "일간 급식 정보 조회",
    field: "급식",
    status: "200 OK",
    ok: true,
    applicant: "—",
    calledAt: "2026-11-20 09:02:11",
    project: "키 없음 (공개 API)",
    stage: "none",
  },
  {
    id: "log-8",
    api: "GET /clubs/{clubId}",
    field: "동아리",
    status: "404 NOT_FOUND",
    ok: false,
    applicant: "전재준",
    calledAt: "2026-11-19 17:20:33",
    project: "team-xquare · xq_test_8f3a••••",
    stage: "test",
  },
  {
    id: "log-9",
    api: "학교 통합 일정 조회",
    field: "일정",
    status: "200 OK",
    ok: true,
    applicant: "전재준",
    calledAt: "2026-11-19 15:44:09",
    project: "dsm-timetable · xq_test_51bd••••",
    stage: "test",
  },
  {
    id: "log-10",
    api: "자습 감독 정보 일별로 조회",
    field: "자습 감독",
    status: "200 OK",
    ok: true,
    applicant: "정하준",
    calledAt: "2026-11-18 21:15:00",
    project: "자습 알림 · xq_live_4d92••••",
    stage: "prod",
  },
  {
    id: "log-11",
    api: "GET /students",
    field: "학생",
    status: "500 INTERNAL_SERVER_ERROR",
    ok: false,
    applicant: "박서준",
    calledAt: "2026-11-17 14:22:51",
    project: "급식봇 · xq_live_77e2••••",
    stage: "prod",
  },
  {
    id: "log-12",
    api: "월간 급식 정보 조회",
    field: "급식",
    status: "200 OK",
    ok: true,
    applicant: "박서준",
    calledAt: "2026-11-15 12:10:05",
    project: "급식봇 · xq_live_77e2••••",
    stage: "prod",
  },
  {
    id: "log-13",
    api: "GET /clubs",
    field: "동아리",
    status: "200 OK",
    ok: true,
    applicant: "전재준",
    calledAt: "2026-11-09 16:33:47",
    project: "team-xquare · xq_test_8f3a••••",
    stage: "test",
  },
  {
    id: "log-14",
    api: "학교 통합 일정 조회",
    field: "일정",
    status: "429 TOO_MANY_REQUESTS",
    ok: false,
    applicant: "전재준",
    calledAt: "2026-11-03 11:08:20",
    project: "dsm-timetable · xq_test_51bd••••",
    stage: "test",
  },
  {
    id: "log-15",
    api: "GET /students/{studentId}",
    field: "학생",
    status: "200 OK",
    ok: true,
    applicant: "전재준",
    calledAt: "2026-10-12 10:00:00",
    project: "team-xquare · xq_test_8f3a••••",
    stage: "test",
  },
];
