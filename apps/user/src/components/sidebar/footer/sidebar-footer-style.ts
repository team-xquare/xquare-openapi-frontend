import styled from "@emotion/styled";
import { Xquare_colors } from "../../../index";

export const SidebarFooterContainer = styled.footer`
  align-items: center;
  background-color: ${Xquare_colors.purple[700]};
  display: flex;
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
