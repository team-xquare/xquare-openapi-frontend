import styled from "@emotion/styled";
import { Xquare_colors, Xquare_fonts } from "../../../index";

export const CodeBlockWrap = styled.figure`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  width: 100%;
`;

export const CodeBlockLabel = styled.figcaption`
  color: ${Xquare_colors.slate[600]};
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
`;

export const CodeBlockPre = styled.pre`
  background-color: ${Xquare_colors.purple[700]};
  border-radius: 8px;
  color: ${Xquare_colors.white};
  font-family: ${Xquare_fonts.mono};
  font-size: 14px;
  line-height: 22px;
  margin: 0;
  overflow-x: auto;
  padding: 20px 24px;
`;

export const CodeBlockCode = styled.code`
  display: flex;
  flex-direction: column;
  font-family: inherit;
  gap: 2px;
`;

export const CodeBlockLine = styled.span<{ isHighlighted: boolean }>`
  color: ${(props) =>
    props.isHighlighted ? Xquare_colors.purple[500] : "inherit"};
  white-space: pre-wrap;
`;
