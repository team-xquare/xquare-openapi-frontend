"use client";

import { usePathname } from "next/navigation";
import { ErrorView } from "./error-view";

// 화면을 그리다 예상하지 못한 오류가 났을 때 (사이드바는 그대로 둠)
export default function RootError({
  error,
  retry,
}: {
  // digest: 서버에서 난 오류를 서버 로그에서 찾을 수 있는 값
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const pathname = usePathname();

  return (
    <ErrorView
      status={500}
      onRetry={retry}
      request={pathname}
      requestId={error.digest}
    />
  );
}
