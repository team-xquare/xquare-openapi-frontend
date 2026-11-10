"use client";

import { usePathname } from "next/navigation";
import {
  SidebarContainer,
  SidebarInner,
  SidebarHeader,
  SidebarNav,
  SidebarLink,
  SidebarSectionTitle,
  SidebarFooter,
  LogoutButton,
} from "./sidebar-style";

const PRIMARY_ITEMS = [
  { label: "홈", href: "/" },
  { label: "공지", href: "/notice" },
  { label: "활용신청", href: "/apply" },
];

const DATA_ITEMS = [
  { label: "급식", href: "/meal" },
  { label: "일정", href: "/schedule" },
  { label: "동아리", href: "/club" },
  { label: "교직원", href: "/teacher" },
  { label: "자습감독", href: "/supervisor" },
  { label: "학생", href: "/student" },
];

export function Sidebar() {
  const pathname = usePathname();
  const renderItem = ({ label, href }: (typeof PRIMARY_ITEMS)[number]) => {
    const isActive =
      pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

    return (
      <SidebarLink
        key={href}
        href={href}
        data-menu={DATA_ITEMS.some((item) => item.href === href) ? "data" : "primary"}
        aria-current={isActive ? "page" : undefined}
      >
        {label}
      </SidebarLink>
    );
  };

  return (
    <SidebarContainer aria-label="관리자 사이드바">
      <SidebarInner>
        <SidebarHeader>
          <span>XQUARE</span>
          <span>데이터 관리자</span>
        </SidebarHeader>
        <SidebarNav aria-label="관리자 메뉴">
          {PRIMARY_ITEMS.map(renderItem)}
          <SidebarSectionTitle>데이터 관리</SidebarSectionTitle>
          {DATA_ITEMS.map(renderItem)}
        </SidebarNav>
        <SidebarFooter>
          {/* 로그인 연동 전 시안의 사용자명을 표시합니다. */}
          <span>홍길동</span>
          <LogoutButton
            type="button"
            disabled
            title="로그인 연동 후 사용할 수 있습니다."
          >
            로그아웃
          </LogoutButton>
        </SidebarFooter>
      </SidebarInner>
    </SidebarContainer>
  );
}
