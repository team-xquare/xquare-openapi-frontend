export interface Notice {
  id: string;
  title: string;
  author: string;
  createdAt: string;
  updatedAt?: string;
  content: string;
}

// 최신순 정렬
export const NOTICES: Notice[] = [
  {
    id: "5",
    title: "9월 급식 변경 안내",
    author: "김영희",
    createdAt: "2026-09-03 08:30",
    content:
      "9월 급식 식단이 일부 변경되었습니다.\n\n변경된 식단은 급식 엔드포인트에서 확인할 수 있습니다.",
  },
  {
    id: "4",
    title: "2학기 동아리 모집 안내",
    author: "홍길동",
    createdAt: "2026-09-01 09:00",
    updatedAt: "2026-09-01 10:30",
    content:
      "9월 15일까지 각 동아리 부장에게 신청서를 제출하세요.\n\n신청서는 교무실 앞 비치함에서 가져갈 수 있습니다.\n중복 지원은 불가하며, 면접 일정은 추후 공지합니다.",
  },
  {
    id: "3",
    title: "체육대회 일정 공지",
    author: "이진경",
    createdAt: "2026-08-28 14:00",
    content:
      "체육대회는 9월 26일 운동장에서 진행됩니다.\n\n세부 종목과 반별 일정은 담임 선생님을 통해 안내합니다.",
  },
  {
    id: "2",
    title: "기숙사 점호 시간 변경",
    author: "정은진",
    createdAt: "2026-08-25 17:00",
    content: "9월부터 기숙사 저녁 점호 시간이 22시 30분으로 변경됩니다.",
  },
  {
    id: "1",
    title: "9월 자습 감독 배정",
    author: "홍길동",
    createdAt: "2026-08-20 10:00",
    content:
      "9월 자습 감독 배정표가 확정되었습니다.\n\n배정 내역은 자습감독 엔드포인트에서 확인할 수 있습니다.",
  },
];
