import styled from "@emotion/styled";
import Link from "next/link";
import { Xquare_colors } from "../../../index";

const CONTENT_WIDTH = "1180px";
const CONTENT_SIDE_PADDING = "24px";
const PLACEHOLDER_COLOR = "#8C9199";
const BACK_LINK_BORDER_COLOR = "#58616A";

export const ApiDetailContainer = styled.main`
  display: flex;
  flex-direction: column;
  gap: 48px;
  margin: 0 auto;
  max-width: calc(${CONTENT_WIDTH} + ${CONTENT_SIDE_PADDING} * 2);
  padding: 54px ${CONTENT_SIDE_PADDING} 80px;
  width: 100%;
  word-break: keep-all;
`;

export const ApiDetailHeader = styled.header`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// 배지 오른쪽은 비어 있지만 디자인과 같이 제목과의 간격을 유지
export const ApiBadgeList = styled.div`
  align-items: flex-start;
  display: flex;
  gap: 8px;
  min-height: 40px;
`;

export const ApiBadge = styled.span`
  align-items: center;
  background-color: ${Xquare_colors.blue[50]};
  border-radius: 4px;
  color: ${Xquare_colors.blue[700]};
  display: inline-flex;
  font-size: 15px;
  height: 24px;
  line-height: 24px;
  padding: 0 8px;
`;

export const ApiDetailTitle = styled.h1`
  color: ${Xquare_colors.slate[900]};
  font-size: 32px;
  font-weight: 700;
  line-height: 48px;
  margin: 0;
`;

export const ApiDetailBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 60px;
`;

export const DetailSectionContainer = styled.section`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const DetailSectionTitle = styled.h2`
  color: ${Xquare_colors.slate[900]};
  font-size: 24px;
  font-weight: 700;
  line-height: 36px;
  margin: 0;
`;

// 응답 코드별 목록은 간격 없이 이어 붙임
export const DetailListStack = styled.div`
  display: flex;
  flex-direction: column;
`;

export const DetailReportGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

export const DetailReport = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const DetailReportTitle = styled.h3`
  color: ${Xquare_colors.slate[900]};
  font-size: 19px;
  font-weight: 700;
  line-height: 28.5px;
  margin: 0;
`;

export const CodeBox = styled.pre`
  background-color: ${Xquare_colors.gray[700]};
  border-radius: 12px;
  color: ${Xquare_colors.white};
  font: inherit;
  font-size: 16px;
  line-height: 24px;
  margin: 0;
  overflow-wrap: anywhere;
  padding: 20px;
  white-space: pre-wrap;
`;

export const ResponseCodeBox = styled(CodeBox)`
  line-height: 20px;
`;

export const TestInput = styled.input`
  background-color: ${Xquare_colors.white};
  border: 1px solid ${Xquare_colors.slate[400]};
  border-radius: 6px;
  color: ${Xquare_colors.slate[900]};
  font: inherit;
  font-size: 16px;
  line-height: 20px;
  padding: 12px 16px;
  width: 100%;

  &::placeholder {
    color: ${PLACEHOLDER_COLOR};
  }

  &:focus {
    border-color: ${Xquare_colors.blue[500]};
    outline: none;
  }
`;

export const TestEndpoint = styled.span`
  column-gap: 12px;
  display: flex;
  flex-wrap: wrap;
  font-weight: 700;
  line-height: 20px;
  overflow-wrap: anywhere;
`;

export const TestStatus = styled.strong`
  font-weight: 700;
  line-height: 20px;
`;

export const TestHeaders = styled.span`
  display: block;
  line-height: 20px;
  white-space: pre-line;
`;

export const SendButton = styled.button`
  background-color: ${Xquare_colors.blue[500]};
  border: 0;
  border-radius: 8px;
  color: ${Xquare_colors.white};
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
  line-height: 20px;
  padding: 14px 28px;
`;

export const BackLinkGroup = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const BackLink = styled(Link)`
  align-items: center;
  background-color: ${Xquare_colors.white};
  border: 1px solid ${BACK_LINK_BORDER_COLOR};
  border-radius: 8px;
  color: ${Xquare_colors.slate[900]};
  display: inline-flex;
  font-size: 19px;
  height: 56px;
  line-height: 28.5px;
  padding: 0 20px;
`;
