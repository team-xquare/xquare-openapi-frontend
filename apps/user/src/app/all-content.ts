export interface EndpointItem {
  method: "GET";
  description: string;
  // 상세 페이지가 있으면 /{그룹 id}/{detailId}로 이동
  detailId?: string;
}

// 분야의 접근 단계: 공개(키 없이) · 교내(신청하면 자동 승인) · 제한(관리자 승인)
export type EndpointAccess = "public" | "school" | "restricted";

export const ENDPOINT_ACCESS_LABELS: Record<EndpointAccess, string> = {
  public: "공개 · 키 없이 호출",
  school: "교내 · 신청하면 자동 승인",
  restricted: "제한 · 관리자 승인 필요",
};

export interface EndpointGroup {
  id: string;
  title: string;
  // 정해지지 않은 분야는 배지를 보여 주지 않음
  access?: EndpointAccess;
  endpoints: EndpointItem[];
}

export const ENDPOINT_GROUPS: EndpointGroup[] = [
  {
    id: "meal",
    title: "급식",
    access: "public",
    endpoints: [{ method: "GET", description: "월간 급식 정보 조회" }],
  },
  {
    id: "schedule",
    title: "일정",
    access: "school",
    endpoints: [{ method: "GET", description: "학교 통합 일정 조회" }],
  },
  {
    id: "club",
    title: "동아리",
    access: "school",
    endpoints: [{ method: "GET", description: "동아리 정보 조회" }],
  },
  {
    id: "teacher",
    title: "교직원",
    access: "restricted",
    endpoints: [
      { method: "GET", description: "교직원 정보 조회" },
      { method: "GET", description: "자습감독 선생님 조회" },
    ],
  },
  {
    id: "supervisor",
    title: "자습감독",
    access: "restricted",
    endpoints: [
      { method: "GET", description: "자습 감독 정보 전체 조회" },
      { method: "GET", description: "자습 감독 정보 일별로 조회" },
    ],
  },
  {
    id: "student",
    title: "학생",
    access: "restricted",
    endpoints: [
      { method: "GET", description: "학생 정보 조회", detailId: "get-student" },
    ],
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
