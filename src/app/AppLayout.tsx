"use client";

import React, { type ReactNode } from "react";
import styled from "@emotion/styled";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "../components/sidebar";

function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = React.useMemo(
    () => [
      // path 별 경로 지정 및 색 변경
      { id: "overview", label: "Overview", path: "/" },
      { id: "all", label: "전체", path: "/all" },
      { id: "meal", label: "급식", path: "/meal" },
      { id: "schedule", label: "일정", path: "/schedule" },
      { id: "club", label: "동아리", path: "/club" },
      { id: "teacher", label: "교직원", path: "/teacher" },
      { id: "student", label: "학생", path: "/student" },
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
      student: "/student",
    };

    const path = routeMap[itemId];
    if (!path) return;
    router.push(path);
  };

  return (
    <Container>
      <Sidebar navItems={navItems} onNavItemClick={handleNavItemClick} />
      <Page $isHome={pathname === "/"}>{children}</Page>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  cursor: default;
`;

const Page = styled.div<{ $isHome: boolean }>`
  background-color: ${({ $isHome }) => ($isHome ? "#fff" : "transparent")};
  margin-left: 280px;
  width: calc(100% - 280px);
  height: 100vh;
  overflow-y: auto;
  cursor: default;
`;

export default AppLayout;
