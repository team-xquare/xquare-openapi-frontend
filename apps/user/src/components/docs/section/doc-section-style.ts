import styled from "@emotion/styled";
import { Xquare_colors } from "../../../index";

export const DocSectionContainer = styled.section`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  word-break: keep-all;
`;

export const DocSectionTitle = styled.h2`
  color: ${Xquare_colors.slate[900]};
  font-size: 24px;
  font-weight: 700;
  line-height: 36px;
  margin: 0;
`;

export const DocSectionDescription = styled.p`
  color: ${Xquare_colors.slate[600]};
  font-size: 16px;
  font-weight: 400;
  line-height: 26px;
  margin: 0;
`;

export const DocSectionNote = styled.p`
  color: ${Xquare_colors.slate[600]};
  font-size: 15px;
  font-weight: 400;
  line-height: 24px;
  margin: 0;
`;
