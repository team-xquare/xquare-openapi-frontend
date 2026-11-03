import { usePathname, useRouter } from "next/navigation";
import {
  SidebarFooterContainer,
  SidebarFooterName,
  SidebarFooterActions,
  SidebarFooterLink,
  SidebarLogoutButton,
} from "./sidebar-footer-style";

export function SidebarFooter() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <SidebarFooterContainer>
      <SidebarFooterName>사용자</SidebarFooterName>
      <SidebarFooterActions aria-label="계정 메뉴">
        <SidebarFooterLink
          href="/mypage"
          aria-current={pathname === "/mypage" ? "page" : undefined}
        >
          마이페이지
        </SidebarFooterLink>
        <SidebarLogoutButton
          type="button"
          onClick={() => {
            // 로그인 API 연동 전에는 로그인 화면으로 이동합니다.
            router.replace("/login");
          }}
        >
          로그아웃
        </SidebarLogoutButton>
      </SidebarFooterActions>
    </SidebarFooterContainer>
  );
}
