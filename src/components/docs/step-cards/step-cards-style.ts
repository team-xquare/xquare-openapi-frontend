import styled from "@emotion/styled";
import { Xquare_colors, Xquare_fonts } from "../../../index";

export const StepCardList = styled.ol`
  display: flex;
  gap: 20px;
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
`;

export const StepCardItem = styled.li`
  background-color: ${Xquare_colors.slate[50]};
  border-radius: 8px;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  padding: 24px;
`;

export const StepCardNumber = styled.span`
  color: ${Xquare_colors.purple[400]};
  font-family: ${Xquare_fonts.mono};
  font-size: 13px;
  line-height: 18px;
`;

export const StepCardTitle = styled.h3`
  color: ${Xquare_colors.slate[900]};
  font-size: 18px;
  font-weight: 700;
  line-height: 26px;
  margin: 0;
`;

export const StepCardDescription = styled.p`
  color: ${Xquare_colors.slate[600]};
  font-size: 15px;
  font-weight: 400;
  line-height: 24px;
  margin: 0;
`;
