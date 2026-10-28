"use client";

import React, { type ReactNode } from "react";
import styled from "@emotion/styled";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "../components/sidebar";

// 사이드바 없이 화면 전체를 쓰는 페이지
const FULL_SCREEN_PATHS = ["/login", "/signup"];

function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isFullScreen = FULL_SCREEN_PATHS.includes(pathname);
  const navItems = React.useMemo(
    () => [
      // path 별 경로 지정 및 색 변경
      { id: "overview", label: "Overview", path: "/" },
      { id: "all", label: "전체", path: "/all" },
      { id: "meal", label: "급식", path: "/meal" },
      { id: "schedule", label: "일정", path: "/schedule" },
      { id: "club", label: "동아리", path: "/club" },
      { id: "teacher", label: "교직원", path: "/teacher" },
      { id: "supervisor", label: "자습감독", path: "/supervisor" },
      { id: "student", label: "학생", path: "/student" },
      { id: "notice", label: "공지", path: "/notice" },
    ],
    [],
  );

  const handleNavItemClick = (itemId: string) => {
    const routeMap: Record<string, string> = {
      overview: "/",
      all: "/all",
      meal: "/meal",
      schedule: "/schedule",
      club: "/club",
      teacher: "/teacher",
      supervisor: "/supervisor",
      student: "/student",
      notice: "/notice",
    };

    const path = routeMap[itemId];
    if (!path) return;
    router.push(path);
  };

  return (
    <Container>
      {/* Page 위치가 바뀌면 보존 중인 페이지 상태가 초기화되므로 사이드바만 조건부로 렌더링 */}
      {!isFullScreen && (
        <Sidebar navItems={navItems} onNavItemClick={handleNavItemClick} />
      )}
      <Page isFullScreen={isFullScreen}>{children}</Page>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  cursor: default;
`;

const Page = styled.div<{ isFullScreen: boolean }>`
  background-color: #fff;
  margin-left: ${(props) => (props.isFullScreen ? "0" : "280px")};
  width: ${(props) => (props.isFullScreen ? "100%" : "calc(100% - 280px)")};
  height: 100vh;
  overflow-y: auto;
  cursor: default;
`;

export default AppLayout;
