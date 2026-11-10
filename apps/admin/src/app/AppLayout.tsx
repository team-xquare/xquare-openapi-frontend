"use client";

import type { ReactNode } from "react";
import styled from "@emotion/styled";
import { usePathname } from "next/navigation";
import { Sidebar } from "../components/sidebar/sidebar";
import { SIDEBAR_WIDTH } from "../components/sidebar/sidebar-style";

// 사이드바 없이 화면 전체를 쓰는 페이지
const FULL_SCREEN_PATHS = ["/login", "/forbidden"];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isFullScreen = FULL_SCREEN_PATHS.includes(pathname);

  return (
    <>
      {/* Page 위치가 바뀌면 보존 중인 페이지 상태가 초기화되므로 사이드바만 조건부로 렌더링 */}
      {!isFullScreen && <Sidebar />}
      <Page data-full-screen={isFullScreen || undefined}>{children}</Page>
    </>
  );
}

const Page = styled.div`
  margin-left: ${SIDEBAR_WIDTH};
  min-height: 100vh;
  width: calc(100% - ${SIDEBAR_WIDTH});

  &[data-full-screen] {
    margin-left: 0;
    width: 100%;
  }
`;
