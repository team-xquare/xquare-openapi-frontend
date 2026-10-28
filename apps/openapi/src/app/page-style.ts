import styled from "@emotion/styled";
import { Xquare_colors } from "../index";

const CONTENT_WIDTH = "1180px";
const CONTENT_SIDE_PADDING = "24px";

export const OverviewContainer = styled.main`
  display: flex;
  flex-direction: column;
  gap: 48px;
  margin: 0 auto;
  max-width: calc(${CONTENT_WIDTH} + ${CONTENT_SIDE_PADDING} * 2);
  padding: 54px ${CONTENT_SIDE_PADDING} 80px;
  width: 100%;
`;

export const OverviewHeader = styled.header`
  display: flex;
  flex-direction: column;
  gap: 16px;
  word-break: keep-all;
`;

export const OverviewBadgeList = styled.div`
  display: flex;
  gap: 8px;
`;

export const OverviewTitle = styled.h1`
  color: ${Xquare_colors.slate[900]};
  font-size: 36px;
  font-weight: 700;
  line-height: 48px;
  margin: 0;
`;

export const OverviewLead = styled.p`
  color: ${Xquare_colors.slate[600]};
  font-size: 17px;
  font-weight: 400;
  line-height: 28px;
  margin: 0;
`;
