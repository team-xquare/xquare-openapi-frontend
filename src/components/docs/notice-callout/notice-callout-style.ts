import styled from "@emotion/styled";
import { Xquare_colors } from "../../../index";

export const NoticeCalloutContainer = styled.aside`
  background-color: ${Xquare_colors.purple[100]};
  border-radius: 6px;
  display: flex;
  gap: 16px;
  padding: 18px 20px;
  width: 100%;

  &::before {
    background-color: ${Xquare_colors.purple[400]};
    border-radius: 2px;
    content: "";
    flex-shrink: 0;
    width: 3px;
  }
`;

export const NoticeCalloutBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  font-size: 15px;
  gap: 6px;
  min-width: 0;
`;

export const NoticeCalloutTitle = styled.strong`
  color: ${Xquare_colors.purple[400]};
  font-weight: 700;
  line-height: 22px;
`;

export const NoticeCalloutText = styled.p`
  color: ${Xquare_colors.slate[600]};
  font-weight: 400;
  line-height: 24px;
  margin: 0;
`;
