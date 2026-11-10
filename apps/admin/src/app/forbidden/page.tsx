"use client";

import { AuthLayout } from "../../components/auth-layout/auth-layout";
import {
  PrimaryLink,
  SecondaryAnchor,
} from "../../components/auth-layout/auth-layout-style";
import {
  ForbiddenActions,
  ForbiddenBox,
  ForbiddenDescription,
  ForbiddenTitle,
  StatusCode,
} from "./page-style";

// user 앱(Open API 문서) 주소. next build는 값이 없으면 next.config에서 멈추므로
// 로컬 user 앱 기본값은 개발 서버(next dev)에서만 쓰임
const OPEN_API_DOCS_URL =
  process.env.NEXT_PUBLIC_OPEN_API_DOCS_URL || "http://localhost:3000";

// 로그인한 계정에 ADMIN 권한이 없을 때 보여주는 화면
export default function ForbiddenPage() {
  return (
    <AuthLayout>
      <ForbiddenBox>
        <StatusCode aria-hidden="true">403</StatusCode>
        <ForbiddenTitle>관리자 권한이 필요합니다</ForbiddenTitle>
        <ForbiddenDescription>
          <p>이 계정은 데이터 관리자 권한(ADMIN)이 없습니다.</p>
          <p>관리자 계정으로 다시 로그인해 주세요.</p>
        </ForbiddenDescription>
        <ForbiddenActions>
          {/* 로그아웃 API 연동 전이라 로그인 화면으로 이동만 함 */}
          <PrimaryLink href="/login">다른 계정으로 로그인</PrimaryLink>
          <SecondaryAnchor href={OPEN_API_DOCS_URL}>Open API 문서로</SecondaryAnchor>
        </ForbiddenActions>
      </ForbiddenBox>
    </AuthLayout>
  );
}
