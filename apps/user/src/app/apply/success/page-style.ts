import styled from "@emotion/styled";
import Link from "next/link";
import { Xquare_colors } from "../../../styles/colors";

export const SuccessPage = styled.main`
  color: ${Xquare_colors.slate[900]};
  min-height: 100%;
  padding: 56px 40px;
  word-break: keep-all;

  @media (max-width: 720px) {
    padding: 32px 18px;
  }
`;

export const SuccessTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  line-height: 1.4;
  margin: 0 0 24px;
`;

export const SuccessLead = styled.p`
  color: ${Xquare_colors.gray[600]};
  font-size: 16px;
  line-height: 1.5;
  margin: 0 0 24px;
`;

export const ApplicationDetails = styled.dl`
  border-block: 1px solid ${Xquare_colors.slate[400]};
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin: 0 0 24px;
  padding: 24px 0;
`;

export const DetailRow = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: 160px minmax(0, 1fr);
  font-size: 16px;
  line-height: 1.5;

  dt { font-weight: 700; }
  dd { margin: 0; overflow-wrap: anywhere; }

  @media (max-width: 640px) {
    gap: 12px;
    grid-template-columns: 90px minmax(0, 1fr);
  }
`;

export const KeyPanel = styled.div`
  align-items: center;
  background: ${Xquare_colors.gray[700]};
  border-radius: 12px;
  display: flex;
  gap: 20px;
  justify-content: space-between;
  padding: 20px;

  @media (max-width: 640px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

export const ApiKey = styled.span`
  color: ${Xquare_colors.gray[300]};
  font-size: 16px;
  line-height: 1.5;
  overflow-wrap: anywhere;
  user-select: all;
`;

const ButtonStyle = `
  align-items: center;
  border-radius: 8px;
  display: inline-flex;
  font-size: 16px;
  font-weight: 600;
  justify-content: center;
  min-height: 48px;
  padding: 12px 28px;
`;

export const CopyButton = styled.button`
  ${ButtonStyle}
  background: ${Xquare_colors.blue[500]};
  border: 1px solid ${Xquare_colors.blue[500]};
  color: ${Xquare_colors.white};
  cursor: pointer;
  flex-shrink: 0;
`;

export const KeyNotice = styled.p`
  color: ${Xquare_colors.gray[600]};
  font-size: 14px;
  line-height: 1.5;
  margin: 20px 0 0;

  &:empty { display: none; }
`;

export const SuccessActions = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 44px;
`;

export const PrimaryLink = styled(Link)`
  ${ButtonStyle}
  background: ${Xquare_colors.blue[500]};
  border: 1px solid ${Xquare_colors.blue[500]};
  color: ${Xquare_colors.white};
`;

export const SecondaryLink = styled(Link)`
  ${ButtonStyle}
  background: ${Xquare_colors.white};
  border: 1px solid ${Xquare_colors.slate[400]};
  color: ${Xquare_colors.slate[900]};
`;

export const HistoryButton = styled.button`
  ${ButtonStyle}
  background: ${Xquare_colors.white};
  border: 1px solid ${Xquare_colors.slate[400]};
  color: ${Xquare_colors.slate[900]};
  cursor: not-allowed;
`;
