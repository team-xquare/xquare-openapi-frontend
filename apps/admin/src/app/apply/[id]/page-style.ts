import styled from "@emotion/styled";
import Link from "next/link";
import { Xquare_colors } from "../../../styles/colors";
import type { AccessTier } from "../apply-content";

const BORDER = `1px solid ${Xquare_colors.slate[200]}`;
const STRONG_BORDER = `1px solid ${Xquare_colors.slate[400]}`;

export const DetailPage = styled.main`
  display: flex;
  flex-direction: column;
  padding: 48px 58px 64px;
  word-break: keep-all;
`;

export const PageHead = styled.header`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 36px;
`;

export const PageTitle = styled.h1`
  color: ${Xquare_colors.slate[900]};
  font-size: 28px;
  font-weight: 700;
  line-height: normal;
  margin: 0;
`;

export const PageDescription = styled.p`
  color: ${Xquare_colors.slate[600]};
  font-size: 16px;
  line-height: normal;
  margin: 0;
`;

export const DetailCard = styled.dl`
  border: ${BORDER};
  border-radius: 14px;
  display: grid;
  gap: 22px;
  margin: 0;
  max-width: 1080px;
  padding: 34px 36px;
`;

export const DetailRow = styled.div`
  display: grid;
  font-size: 16px;
  grid-template-columns: 165px 1fr;
  line-height: 1.5;

  dt {
    color: ${Xquare_colors.slate[600]};
    font-weight: 700;
    font-size: 14px;
  }

  dd {
    color: ${Xquare_colors.slate[900]};
    margin: 0;
    font-size: 15px;
  }
`;

export const BackLink = styled(Link)`
  align-items: center;
  border: ${STRONG_BORDER};
  border-radius: 9px;
  color: ${Xquare_colors.slate[900]};
  display: inline-flex;
  font-size: 15px;
  padding: 13px 0;
  justify-content: center;
  width: 114px;

  &:hover,
  &:focus-visible {
    border-color: ${Xquare_colors.purple[400]};
    color: ${Xquare_colors.purple[400]};
    outline: none;
  }
`;

export const ActionBar = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-top: 34px;
  max-width: 1080px;
`;

export const ActionGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const ACTION_BUTTON = `
  border-radius: 9px;
  cursor: pointer;
  font: inherit;
  font-size: 15px;
  padding: 13px 0;
  width: 114px;

  &:focus-visible {
    outline: 2px solid ${Xquare_colors.purple[400]};
    outline-offset: 3px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
`;

export const RejectButton = styled.button`
  ${ACTION_BUTTON}
  background: ${Xquare_colors.white};
  border: 1px solid ${Xquare_colors.red[600]};
  color: ${Xquare_colors.red[600]};
`;

export const ApproveButton = styled.button`
  ${ACTION_BUTTON}
  background: ${Xquare_colors.purple[400]};
  border: 1px solid ${Xquare_colors.purple[400]};
  color: ${Xquare_colors.white};
`;

export const ReasonTextarea = styled.textarea`
  background: ${Xquare_colors.white};
  border: ${STRONG_BORDER};
  border-radius: 8px;
  color: ${Xquare_colors.slate[900]};
  font: inherit;
  font-size: 15px;
  min-height: 96px;
  padding: 12px 16px;
  resize: vertical;
  width: 100%;

  &::placeholder {
    color: ${Xquare_colors.slate[400]};
  }

  &:focus-visible {
    border-color: ${Xquare_colors.purple[400]};
    box-shadow: 0 0 0 2px ${Xquare_colors.purple[100]};
    outline: none;
  }
`;

export const ReasonHelp = styled.p<{ $isError?: boolean }>`
  color: ${({ $isError }) =>
    $isError ? Xquare_colors.red[600] : Xquare_colors.slate[600]};
  font-size: 13px;
  margin: 8px 0 0;
`;

// 승인 · 반려 결과 안내 (성공은 초록, 실패는 빨강)
export const ActionMessage = styled.p<{ $isError: boolean }>`
  color: ${({ $isError }) =>
    $isError ? Xquare_colors.red[600] : Xquare_colors.green[700]};
  font-size: 14px;
  margin: 16px 0 0;
  max-width: 1080px;
  /* 안내가 없을 때도 자리를 남겨 둬야 스크린 리더가 새 안내를 읽음 */
  min-height: 1.5em;
  text-align: right;
`;

export const TierValue = styled.span<{ $tier: AccessTier }>`
  color: ${({ $tier }) =>
    $tier === "제한" ? Xquare_colors.orange[600] : Xquare_colors.slate[900]};
`;

// 활용신청을 불러오는 중이거나 불러오지 못했을 때
export const LoadStatus = styled.div`
  color: ${Xquare_colors.slate[600]};
  font-size: 14px;

  p {
    margin: 0 0 16px;
  }
`;

export const LoadButton = styled.button`
  background: ${Xquare_colors.white};
  border: ${STRONG_BORDER};
  border-radius: 9px;
  color: ${Xquare_colors.slate[900]};
  cursor: pointer;
  font: inherit;
  font-size: 15px;
  padding: 13px 0;
  width: 114px;

  &:hover,
  &:focus-visible {
    border-color: ${Xquare_colors.purple[400]};
    color: ${Xquare_colors.purple[400]};
    outline: none;
  }
`;
