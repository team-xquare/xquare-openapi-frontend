import styled from "@emotion/styled";
import { Xquare_colors } from "../../styles/colors";

export const SquareButton = styled.button`
  align-items: center;
  background-color: ${Xquare_colors.white};
  border: 1px solid ${Xquare_colors.gray[500]};
  border-radius: 15px;
  color: ${Xquare_colors.gray[500]};
  cursor: pointer;
  display: flex;
  font-size: 1rem;
  font-weight: 600;
  height: 60px;
  justify-content: center;
  transition: 0.2s ease;
  width: 300px;

  &:hover,
  &:focus-visible {
    border: 1px solid ${Xquare_colors.purple[400]};
    color: ${Xquare_colors.purple[400]};
    outline: none;
  }

  &:active {
    background-color: ${Xquare_colors.purple[200]};
    border: 1px solid ${Xquare_colors.purple[600]};
    color: ${Xquare_colors.purple[600]};
  }

  &:disabled {
    background-color: ${Xquare_colors.white};
    border: 1px solid ${Xquare_colors.gray[300]};
    color: ${Xquare_colors.gray[400]};
    cursor: not-allowed;
  }
`;
