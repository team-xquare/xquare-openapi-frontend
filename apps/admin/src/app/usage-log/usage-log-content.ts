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
};

export const TOTAL_COUNT = "1,284";

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
  },
];
