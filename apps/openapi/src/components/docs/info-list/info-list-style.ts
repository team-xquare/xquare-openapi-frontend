import styled from "@emotion/styled";
import { Xquare_colors, Xquare_fonts } from "../../../index";

export const InfoListContainer = styled.dl`
  border-bottom: 1px solid ${Xquare_colors.slate[400]};
  border-top: 1px solid ${Xquare_colors.slate[400]};
  color: ${Xquare_colors.slate[900]};
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 0;
  padding: 24px 0;
  width: 100%;
`;

// 반쪽 항목도 좁은 화면에서는 한 줄을 다 씀
export const InfoListRow = styled.div<{
  isHalf: boolean;
  isLabelCentered: boolean;
}>`
  align-items: ${(props) => (props.isLabelCentered ? "center" : "stretch")};
  display: flex;
  gap: 20px;
  grid-column: ${(props) => (props.isHalf ? "auto" : "1 / -1")};
  min-width: 0;

  @media (max-width: 1200px) {
    grid-column: 1 / -1;
  }
`;

export const InfoListKey = styled.dt<{ labelWidth: number }>`
  flex-shrink: 0;
  font-size: 17px;
  font-weight: 700;
  line-height: 25.5px;
  width: ${(props) => props.labelWidth}px;
`;

export const InfoListValue = styled.dd<{ isCode: boolean }>`
  flex: 1;
  font-family: ${(props) => (props.isCode ? Xquare_fonts.mono : "inherit")};
  font-size: ${(props) => (props.isCode ? "15px" : "16px")};
  font-weight: 400;
  line-height: 24px;
  margin: 0;
  min-width: 0;
`;
