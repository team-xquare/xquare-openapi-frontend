import styled from "@emotion/styled";
import { Xquare_colors } from "../../index";

const SIDEBAR_WIDTH = "280px";
const ANIMATION_DURATION = "0.3s";
const CONTENT_GAP = "22px";
const SECTION_GAP = "20px";
const NAV_GAP = "18px";
const NAV_PADDING = "0 24px 22px";

export const SidebarContainer = styled.div`
  display: flex;
  position: fixed;
  inset: 0 auto 0 0;
  flex-direction: column;
  height: 100vh;
  width: ${SIDEBAR_WIDTH};
  transition: width ${ANIMATION_DURATION} ease;
  cursor: default;
`;

export const SidebarContent = styled.div`
  background-color: ${Xquare_colors.purple[700]};
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: ${CONTENT_GAP};
  height: 100%;
`;

export const SidebarOverview = styled.button`
  appearance: none;
  background: transparent;
  border: 0;
  color: ${Xquare_colors.purple[400]};
  cursor: pointer;
  font-family: inherit;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  padding: 42px 24px 0;
  text-align: left;
  width: 100%;

  &[aria-current="page"] {
    color: ${Xquare_colors.white};
  }

  &:hover,
  &:focus-visible {
    color: ${Xquare_colors.white};
  }
`;

export const SidebarSectionTitle = styled.h2`
  color: ${Xquare_colors.white};
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
  padding: 0 24px;
`;

export const SidebarNavContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${SECTION_GAP};
  height: 100%;
`;

export const SidebarNavContainer = styled.nav`
  align-items: flex-start;
  background-color: ${Xquare_colors.purple[700]};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${NAV_GAP};
  padding: ${NAV_PADDING};
  width: 100%;
`;
