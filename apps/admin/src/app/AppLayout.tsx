"use client";

import type { ReactNode } from "react";
import styled from "@emotion/styled";
import { usePathname } from "next/navigation";
import { Sidebar } from "../components/sidebar/sidebar";

// 사이드바 없이 화면 전체를 쓰는 페이지
const FULL_SCREEN_PATHS = ["/login", "/forbidden"];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isFullScreen = FULL_SCREEN_PATHS.includes(pathname);

  return (
    <Shell>
      {/* Page 위치가 바뀌면 보존 중인 페이지 상태가 초기화되므로 사이드바만 조건부로 렌더링 */}
      {!isFullScreen && <Sidebar />}
      <Page>{children}</Page>
    </Shell>
  );
}

// 사이드바와 본문을 한 줄로 놓아 사이드바 열이 본문 높이만큼 늘어나게 함
const Shell = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Page = styled.div`
  flex: 1 1 0;
  min-width: 0;
`;
