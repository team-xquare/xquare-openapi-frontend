import styled from "@emotion/styled";
import { Xquare_colors, Xquare_fonts } from "../../../index";

export type DocTableCellVariant = "default" | "strong" | "muted" | "code" | "accent";

export const DocTableContainer = styled.div`
  border-bottom: 1px solid ${Xquare_colors.slate[400]};
  border-top: 1px solid ${Xquare_colors.slate[400]};
  display: flex;
  flex-direction: column;
  line-height: 24px;
  width: 100%;
`;

export const DocTableRow = styled.div`
  display: flex;
  gap: 20px;
  padding: 14px 0;
  width: 100%;

  &:not(:last-of-type) {
    border-bottom: 1px solid ${Xquare_colors.slate[200]};
  }
`;

export const DocTableCell = styled.div<{
  cellWidth?: number;
  variant: DocTableCellVariant;
}>`
  color: ${(props) =>
    props.variant === "accent"
      ? Xquare_colors.purple[400]
      : props.variant === "muted"
        ? Xquare_colors.slate[600]
        : Xquare_colors.slate[900]};
  flex: ${(props) => (props.cellWidth ? `0 0 ${props.cellWidth}px` : "1")};
  font-family: ${(props) =>
    props.variant === "code" || props.variant === "accent"
      ? Xquare_fonts.mono
      : "inherit"};
  font-size: ${(props) =>
    props.variant === "code" || props.variant === "accent" ? "15px" : "16px"};
  font-weight: ${(props) => (props.variant === "strong" ? 700 : 400)};
  min-width: 0;
`;

export const DocTableHeadCell = styled.div<{ cellWidth?: number }>`
  color: ${Xquare_colors.slate[900]};
  flex: ${(props) => (props.cellWidth ? `0 0 ${props.cellWidth}px` : "1")};
  font-size: 16px;
  font-weight: 700;
  min-width: 0;
`;
