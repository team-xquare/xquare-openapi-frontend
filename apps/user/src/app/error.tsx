"use client";

import { ErrorView } from "./error-view";

// 화면을 그리다 예상하지 못한 오류가 났을 때 (사이드바는 그대로 둠)
export default function RootError({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return <ErrorView status={500} onRetry={retry} />;
}
