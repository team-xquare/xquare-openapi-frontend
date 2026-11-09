export type Application = {
  id: string;
  api: string;
  applicant: string;
  username: string;
  appliedAt: string;
  accountType: "개발계정" | "운영계정";
  serviceName: string;
  purpose: string;
  url: string;
};

export const APPLICATIONS: Application[] = [
  {
    id: "application-23",
    api: "team-xquare · 학생 정보 조회 (GET /students)",
    applicant: "전재준",
    username: "jaejun0210",
    appliedAt: "2026-10-01 14:32",
    accountType: "개발계정",
    serviceName: "team-xquare",
    purpose: "학생 정보 조회 서비스 개발",
    url: "https://team-xquare.example.com",
  },
  {
    id: "application-22",
    api: "급식봇 · 월간 급식 정보 조회 (GET /meals)",
    applicant: "박서준",
    username: "seojunpark",
    appliedAt: "2026-09-30 18:05",
    accountType: "개발계정",
    serviceName: "급식봇",
    purpose: "학교 급식 알림 봇 운영",
    url: "https://meals.example.com",
  },
  {
    id: "application-21",
    api: "DSM 일정 위젯 · 학교 통합 일정 조회 (GET /schedules)",
    applicant: "김민수",
    username: "minsu.kim",
    appliedAt: "2026-09-28 10:41",
    accountType: "개발계정",
    serviceName: "DSM 일정 위젯",
    purpose: "학교 일정 위젯 제공",
    url: "https://schedule.example.com",
  },
  {
    id: "application-20",
    api: "동아리 소개 페이지 · 동아리 정보 조회 (GET /clubs)",
    applicant: "이서연",
    username: "seoyeon.lee",
    appliedAt: "2026-09-21 16:20",
    accountType: "개발계정",
    serviceName: "동아리 소개 페이지",
    purpose: "동아리 정보를 한 곳에서 제공",
    url: "https://clubs.example.com",
  },
  {
    id: "application-19",
    api: "자습 알림 · 자습 감독 정보 전체 조회 (GET /study-supervisors)",
    applicant: "정하준",
    username: "hajun.jung",
    appliedAt: "2026-09-12 09:05",
    accountType: "개발계정",
    serviceName: "자습 알림",
    purpose: "자습 감독 정보를 알림으로 제공",
    url: "https://study.example.com",
  },
  {
    id: "application-18",
    api: "학생회 공지 · 공지사항 조회 (GET /notices)",
    applicant: "최유진",
    username: "yujin.choi",
    appliedAt: "2026-09-08 13:18",
    accountType: "개발계정",
    serviceName: "학생회 공지",
    purpose: "학생회 공지사항 안내",
    url: "https://council.example.com",
  },
  {
    id: "application-17",
    api: "교직원 포털 · 교직원 정보 조회 (GET /teachers)",
    applicant: "한지훈",
    username: "jihoon.han",
    appliedAt: "2026-09-05 11:02",
    accountType: "운영계정",
    serviceName: "교직원 포털",
    purpose: "교직원 전용 포털 서비스 운영",
    url: "https://staff.example.com",
  },
];
