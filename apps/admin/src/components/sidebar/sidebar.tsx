"use client";

import { usePathname, useRouter } from "next/navigation";
import { logout, useMyInfo } from "../../lib/my-info";
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
  const router = useRouter();
  const myInfo = useMyInfo();
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
          <span>{myInfo?.name}</span>
          <LogoutButton
            type="button"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
          >
            로그아웃
          </LogoutButton>
        </SidebarFooter>
      </SidebarInner>
    </SidebarContainer>
  );
}
