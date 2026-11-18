import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";
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
            // 서버에 로그아웃 API가 없어서 저장한 토큰을 지우고 로그인 화면으로 이동
            api.auth.logout();
            router.replace("/login");
          }}
        >
          로그아웃
        </SidebarLogoutButton>
      </SidebarFooterActions>
    </SidebarFooterContainer>
  );
}
