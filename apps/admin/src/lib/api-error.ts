import { ApiError } from "@xquare/api";

// 화면을 떠나 직접 취소한 요청. 실패로 보여 주지 않음
export const isAbortError = (error: unknown) =>
  error instanceof Error && error.name === "AbortError";

export const isNotFoundError = (error: unknown) =>
  error instanceof ApiError && error.status === 404;

// 서버 에러는 서버 문구 그대로, 그 밖의 예외는 기본 문구
export const errorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback;
