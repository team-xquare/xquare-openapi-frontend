// 예외 페이지 문구 (상태 코드별)

export type ErrorStatus = 401 | 403 | 404 | 429 | 500;

export type ErrorAction =
  | { label: string; href: string }
  // back: 이전 페이지로, retry: 실패한 요청 다시 시도, contact: 문의하기 모달 열기
  | { label: string; kind: "back" | "retry" | "contact" };

export interface ErrorPageContent {
  title: string;
  description: string;
  // 첫 번째가 주 버튼
  actions: [ErrorAction, ErrorAction];
}

export const ERROR_PAGES: Record<ErrorStatus, ErrorPageContent> = {
  401: {
    title: "로그인이 필요합니다",
    description:
      "로그인한 사용자만 볼 수 있는 페이지입니다. 로그인한 뒤 다시 시도해 주세요.",
    actions: [
      { label: "로그인하기", href: "/login" },
      { label: "홈으로", href: "/" },
    ],
  },
  403: {
    title: "접근 권한이 없습니다",
    description:
      "이 페이지를 볼 수 있는 권한이 없습니다. 계정을 확인하거나 관리자에게 문의해 주세요.",
    actions: [
      { label: "홈으로", href: "/" },
      { label: "이전 페이지", kind: "back" },
    ],
  },
  404: {
    title: "페이지를 찾을 수 없습니다",
    description:
      "주소가 잘못되었거나 페이지가 옮겨졌을 수 있습니다. 주소를 다시 확인해 주세요.",
    actions: [
      { label: "홈으로", href: "/" },
      { label: "이전 페이지", kind: "back" },
    ],
  },
  429: {
    title: "요청이 너무 많습니다",
    description:
      "짧은 시간에 요청이 많아 잠시 제한되었습니다. 잠시 후 다시 시도해 주세요.",
    actions: [
      { label: "다시 시도", kind: "retry" },
      { label: "홈으로", href: "/" },
    ],
  },
  500: {
    title: "서버에 문제가 발생했습니다",
    description:
      "일시적인 오류입니다. 잠시 후 다시 시도해 주세요. 문제가 계속되면 담당자에게 문의해 주세요.",
    actions: [
      { label: "다시 시도", kind: "retry" },
      { label: "문의하기", kind: "contact" },
    ],
  },
};
