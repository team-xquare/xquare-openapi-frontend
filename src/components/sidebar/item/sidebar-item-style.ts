import styled from "@emotion/styled";
import { Xquare_colors } from "../../../index";

const LABEL_FONT_SIZE = "14px";
const LABEL_FONT_WEIGHT = "600";
const TRANSITION_DURATION = "0.05s";

interface SideBarMenuItemLabelProps {
  isActive?: boolean;
}

export const SideBarMenuItemLabel = styled.button<SideBarMenuItemLabelProps>`
  appearance: none;
  background: transparent;
  border: 0;
  color: ${(props) =>
    props.isActive ? Xquare_colors.white : Xquare_colors.purple[400]};
  cursor: pointer;
  display: block;
  font-size: ${LABEL_FONT_SIZE};
  font-style: normal;
  font-weight: ${LABEL_FONT_WEIGHT};
  line-height: 1.5;
  padding: 0;
  text-align: left;
  transition: color ${TRANSITION_DURATION} linear;
  width: 100%;

  &:hover,
  &:focus-visible {
    color: ${Xquare_colors.white};
  }

  &:focus-visible {
    outline: 2px solid ${Xquare_colors.white};
    outline-offset: 2px;
  }
`;
