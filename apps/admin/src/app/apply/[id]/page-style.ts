import styled from "@emotion/styled";
import Link from "next/link";
import { Xquare_colors } from "../../../styles/colors";

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
  margin-top: 34px;
  width: 114px;

  &:hover,
  &:focus-visible {
    border-color: ${Xquare_colors.purple[400]};
    color: ${Xquare_colors.purple[400]};
    outline: none;
  }
`;
