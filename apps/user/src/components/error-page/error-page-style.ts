import styled from "@emotion/styled";
import Link from "next/link";
import { Xquare_colors } from "../../styles/colors";

export const ErrorPageContainer = styled.main`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100%;
  padding: 64px 24px;
  text-align: center;
  word-break: keep-all;
`;

export const ErrorCode = styled.p`
  color: ${Xquare_colors.blue[500]};
  font-size: 96px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
  margin: 0;

  @media (max-width: 520px) {
    font-size: 72px;
  }
`;

export const ErrorTitle = styled.h1`
  color: ${Xquare_colors.slate[900]};
  font-size: 28px;
  font-weight: 700;
  line-height: 1.4;
  margin: 24px 0 12px;

  @media (max-width: 520px) {
    font-size: 22px;
  }
`;

export const ErrorDescription = styled.p`
  color: ${Xquare_colors.slate[600]};
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
  max-width: 440px;
  text-wrap: balance;
`;

export const ErrorActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-top: 36px;
`;

// 모달과 같은 주/보조 버튼 색
const ActionStyle = `
  align-items: center;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  font-size: 16px;
  font-weight: 600;
  justify-content: center;
  min-height: 48px;
  min-width: 140px;
  padding: 12px 28px;

  &:focus-visible {
    outline: 2px solid ${Xquare_colors.blue[500]};
    outline-offset: 3px;
  }
`;

const PrimaryStyle = `
  background: ${Xquare_colors.blue[500]};
  border: 1px solid ${Xquare_colors.blue[500]};
  color: ${Xquare_colors.white};
`;

const SecondaryStyle = `
  background: ${Xquare_colors.white};
  border: 1px solid ${Xquare_colors.slate[400]};
  color: ${Xquare_colors.slate[900]};
`;

export const ErrorPrimaryLink = styled(Link)`
  ${ActionStyle}
  ${PrimaryStyle}
`;

export const ErrorPrimaryButton = styled.button`
  ${ActionStyle}
  ${PrimaryStyle}
`;

export const ErrorSecondaryLink = styled(Link)`
  ${ActionStyle}
  ${SecondaryStyle}
`;

export const ErrorSecondaryButton = styled.button`
  ${ActionStyle}
  ${SecondaryStyle}
`;
