import styled from "@emotion/styled";
import { Xquare_colors } from "../../styles/colors";

export const ProjectSelectorWrap = styled.div`
  position: relative;
  width: min(60%, 420px);

  @media (max-width: 560px) {
    width: 100%;
  }
`;

export const ProjectTrigger = styled.button`
  align-items: center;
  background: transparent;
  border: 0;
  color: ${Xquare_colors.slate[900]};
  cursor: pointer;
  display: flex;
  font: inherit;
  font-size: 16px;
  gap: 8px;
  justify-content: flex-end;
  padding: 4px 0;
  text-align: right;
  width: 100%;

  &:focus-visible {
    outline: 2px solid ${Xquare_colors.blue[500]};
    outline-offset: 3px;
  }
`;

export const ProjectTriggerName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ProjectChevron = styled.span<{ open: boolean }>`
  font-size: 11px;
  transform: rotate(${(props) => (props.open ? "180deg" : "0deg")});
  transition: transform 120ms ease;
`;

export const ProjectMenu = styled.div`
  background: ${Xquare_colors.white};
  border: 1px solid ${Xquare_colors.slate[200]};
  border-radius: 9px;
  box-shadow: 0 8px 20px #00000018;
  overflow: hidden;
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  width: 306px;
  z-index: 10;
`;

export const ProjectOption = styled.button<{ selected?: boolean }>`
  background: ${(props) =>
    props.selected ? Xquare_colors.purple[100] : Xquare_colors.white};
  border: 0;
  border-bottom: 1px solid ${Xquare_colors.slate[200]};
  color: ${Xquare_colors.slate[900]};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 14px;
  text-align: left;
  width: 100%;

  &:hover,
  &:focus-visible {
    background: ${Xquare_colors.purple[100]};
    outline: none;
  }

  &:last-child {
    border-bottom: 0;
  }
`;

export const ProjectOptionName = styled.span`
  align-items: center;
  display: flex;
  font-size: 15px;
  font-weight: 600;
  gap: 7px;
`;

export const ProjectOptionDescription = styled.span`
  color: ${Xquare_colors.gray[600]};
  font-size: 12px;
`;

export const ProjectCheck = styled.span`
  font-size: 14px;
`;
