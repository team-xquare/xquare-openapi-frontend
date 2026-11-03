import styled from "@emotion/styled";
import Link from "next/link";
import { Xquare_colors } from "../../../index";

export const SidebarFooterContainer = styled.footer`
  align-items: center;
  background-color: ${Xquare_colors.purple[700]};
  display: flex;
  justify-content: space-between;
  gap: 8px;
  flex: 0 0 auto;
  min-height: 60px;
  padding: 20px 24px;
`;

export const SidebarFooterName = styled.span`
  color: ${Xquare_colors.white};
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SidebarFooterActions = styled.nav`
  align-items: center;
  display: flex;
  flex: 0 0 auto;
  gap: 12px;
  font-size: 12px;
  line-height: 1.4;
  white-space: nowrap;
`;

export const SidebarFooterLink = styled(Link)`
  color: ${Xquare_colors.white};

  &:hover,
  &[aria-current="page"] {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid ${Xquare_colors.white};
    outline-offset: 2px;
  }
`;

export const SidebarLogoutButton = styled.button`
  appearance: none;
  background: transparent;
  border: 0;
  color: ${Xquare_colors.slate[400]};
  cursor: pointer;
  font: inherit;
  padding: 0;

  &:hover,
  &:focus-visible {
    color: ${Xquare_colors.white};
  }

  &:focus-visible {
    outline: 2px solid ${Xquare_colors.white};
    outline-offset: 2px;
  }
`;
