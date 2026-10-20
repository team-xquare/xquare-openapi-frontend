export interface EndpointItem {
  method: "GET";
  description: string;
}

export interface EndpointGroup {
  id: string;
  title: string;
  endpoints: EndpointItem[];
}

export const ENDPOINT_GROUPS: EndpointGroup[] = [
  {
    id: "meal",
    title: "급식",
    endpoints: [{ method: "GET", description: "월간 급식 정보 조회" }],
  },
  {
    id: "schedule",
    title: "일정",
    endpoints: [{ method: "GET", description: "학교 통합 일정 조회" }],
  },
  {
    id: "club",
    title: "동아리",
    endpoints: [{ method: "GET", description: "동아리 정보 조회" }],
  },
  {
    id: "teacher",
    title: "교직원",
    endpoints: [
      { method: "GET", description: "교직원 정보 조회" },
      { method: "GET", description: "자습감독 선생님 조회" },
    ],
  },
  {
    id: "supervisor",
    title: "자습감독",
    endpoints: [
      { method: "GET", description: "자습 감독 정보 전체 조회" },
      { method: "GET", description: "자습 감독 정보 일별로 조회" },
    ],
  },
  {
    id: "student",
    title: "학생",
    endpoints: [{ method: "GET", description: "학생 정보 조회" }],
  },
  {
    id: "notice",
    title: "공지",
    endpoints: [
      { method: "GET", description: "공지 목록 조회" },
      { method: "GET", description: "공지 조회" },
    ],
  },
];
