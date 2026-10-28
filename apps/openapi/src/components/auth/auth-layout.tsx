"use client";

import type { ReactNode } from "react";
import logo from "../../assets/logo.svg";
import { pretendardAuth } from "./auth-font";
import { AuthContainer, AuthIntro, AuthLogo, AuthPanel } from "./auth-style";

// 로그인, 회원가입이 같이 쓰는 로고 + 폼 레이아웃
export function AuthLayout({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <AuthContainer className={pretendardAuth.variable}>
      <AuthIntro>
        <AuthLogo src={logo} alt="Xquare logo" loading="eager" />
      </AuthIntro>
      <AuthPanel aria-label={label}>{children}</AuthPanel>
    </AuthContainer>
  );
}
