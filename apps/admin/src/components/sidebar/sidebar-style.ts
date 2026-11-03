import styled from "@emotion/styled";
import Link from "next/link";
import { Xquare_colors } from "../../styles/colors";

// user 앱의 기존 사이드바 너비, 색상과 헤더·메뉴·푸터 스타일을 재사용합니다.
export const SIDEBAR_WIDTH = "280px";

export const SidebarContainer = styled.aside`
  background-color: ${Xquare_colors.purple[700]};
  color: ${Xquare_colors.white};
  display: flex;
  position: fixed;
  inset: 0 auto 0 0;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  width: ${SIDEBAR_WIDTH};
  cursor: default;
`;

export const SidebarHeader = styled.header`
  align-items: center;
  display: flex;
  flex: 0 0 auto;
  justify-content: space-between;
  padding: 20px;
  font-size: 13px;
  font-weight: 600;
  line-height: normal;
`;

export const SidebarNav = styled.nav`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  padding: 42px 24px 22px;
`;

export const SidebarLink = styled(Link)`
  color: ${Xquare_colors.purple[400]};
  display: block;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  transition: color 0.05s linear;

  &[data-menu="data"] {
    font-size: 14px;
  }

  &[aria-current="page"],
  &:hover,
  &:focus-visible {
    color: ${Xquare_colors.white};
  }

  &:focus-visible {
    outline: 2px solid ${Xquare_colors.white};
    outline-offset: 2px;
  }
`;

export const SidebarSectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
  margin: 0;
`;

export const SidebarFooter = styled.footer`
  align-items: center;
  display: flex;
  justify-content: space-between;
  flex: 0 0 auto;
  min-height: 60px;
  padding: 20px 24px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
`;

export const LogoutButton = styled.button`
  appearance: none;
  background: transparent;
  border: 0;
  color: ${Xquare_colors.purple[400]};
  font-size: 13px;
  font-weight: 400;
  line-height: 1.4;
  padding: 0;
`;
