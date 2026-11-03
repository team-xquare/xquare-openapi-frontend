import type { ReactNode } from "react";
import {
  ErrorActions,
  ErrorCode,
  ErrorDescription,
  ErrorPageContainer,
  ErrorTitle,
} from "./error-page-style";

// 401·403·404·429·500 예외 페이지가 같이 쓰는 레이아웃
export function ErrorPageLayout({
  code,
  title,
  description,
  children,
}: {
  code: number;
  title: string;
  description: string;
  // 이동·다시 시도 버튼
  children: ReactNode;
}) {
  return (
    <ErrorPageContainer>
      <ErrorCode>{code}</ErrorCode>
      <ErrorTitle>{title}</ErrorTitle>
      <ErrorDescription>{description}</ErrorDescription>
      <ErrorActions>{children}</ErrorActions>
    </ErrorPageContainer>
  );
}
