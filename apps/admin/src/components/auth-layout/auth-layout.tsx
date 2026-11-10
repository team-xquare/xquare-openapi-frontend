"use client";

import type { ReactNode } from "react";
import {
  AuthContainer,
  AuthIntro,
  AuthPanel,
  IntroDescription,
  IntroLogo,
  IntroSubtitle,
} from "./auth-layout-style";

// 관리자 로그인, 권한 없음(403)이 같이 쓰는 소개 + 패널 레이아웃
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AuthContainer>
      <AuthIntro>
        <IntroLogo>XQUARE</IntroLogo>
        <IntroSubtitle>데이터 관리자</IntroSubtitle>
        <IntroDescription>
          학교 데이터를 입력하고 관리하는 교직원 전용 화면입니다.
        </IntroDescription>
      </AuthIntro>
      <AuthPanel>{children}</AuthPanel>
    </AuthContainer>
  );
}
