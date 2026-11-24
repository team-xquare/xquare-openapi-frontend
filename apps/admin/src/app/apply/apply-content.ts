export type AccessTier = "제한" | "교내";
export type ApplicationStatus = "승인 대기" | "반려" | "승인 완료";
export type ApplicationKind = "첫 신청 (키 발급)" | "분야 추가";

export type Application = {
  id: string;
  project: string;
  field: string;
  tier: AccessTier;
  status: ApplicationStatus;
  applicant: string;
  username: string;
  appliedAt: string;
  kind: ApplicationKind;
  purpose: string;
  url: string;
  // 같은 프로젝트에 이미 신청된 분야와 상태 (상세의 "이 프로젝트의 분야")
  projectFields: string;
};

// 신청일시 최신순
export const APPLICATIONS: Application[] = [
  {
    id: "application-5",
    project: "team-xquare",
    field: "학생",
    tier: "제한",
    status: "승인 대기",
    applicant: "전재준",
    username: "jaejun0210",
    appliedAt: "2026-11-19 16:40",
    kind: "분야 추가",
    purpose: "학생 정보를 조회해 팀 서비스의 학생 목록 화면에 보여 주려고 합니다",
    url: "https://team-xquare.example.com",
    projectFields: "동아리, 일정 (승인 완료) · 학생 (승인 대기)",
  },
  {
    id: "application-3",
    project: "team-xquare",
    field: "일정",
    tier: "교내",
    status: "승인 완료",
    applicant: "전재준",
    username: "jaejun0210",
    appliedAt: "2026-11-03 09:12",
    kind: "분야 추가",
    purpose: "학교 일정을 서비스 달력에 보여 줍니다",
    url: "https://team-xquare.example.com",
    projectFields: "동아리, 일정 (승인 완료) · 학생 (승인 대기)",
  },
  {
    id: "application-4",
    project: "dsm-timetable",
    field: "교직원",
    tier: "제한",
    status: "반려",
    applicant: "전재준",
    username: "jaejun0210",
    appliedAt: "2026-11-02 10:07",
    kind: "분야 추가",
    purpose: "교직원 정보를 시간표에 표시하려고 합니다",
    url: "https://timetable.example.com",
    projectFields: "일정 (승인 완료) · 교직원 (반려)",
  },
  {
    id: "application-2",
    project: "동아리 소개 페이지",
    field: "동아리",
    tier: "교내",
    status: "승인 완료",
    applicant: "이서연",
    username: "seoyeon.lee",
    appliedAt: "2026-10-21 16:20",
    kind: "첫 신청 (키 발급)",
    purpose: "동아리 정보를 한 곳에서 제공합니다",
    url: "https://clubs.example.com",
    projectFields: "동아리 (승인 완료)",
  },
  {
    id: "application-1",
    project: "자습 알림",
    field: "자습 감독",
    tier: "제한",
    status: "승인 완료",
    applicant: "정하준",
    username: "hajun.jung",
    appliedAt: "2026-10-12 09:05",
    kind: "첫 신청 (키 발급)",
    purpose: "자습 감독 정보를 알림으로 제공하려고 합니다",
    url: "https://study.example.com",
    projectFields: "자습 감독 (승인 완료)",
  },
];

// 승인 · 반려를 할 수 있는 신청: 제한 단계이고 승인 대기인 것 (목록과 상세가 같이 씀)
export const canReview = (application: Application) =>
  application.tier === "제한" && application.status === "승인 대기";
