import styled from "@emotion/styled";
import { Xquare_colors } from "../../../styles/colors";
import { Actions } from "../../student/new/page-style";

export const SelectionNote = styled.p`
  color: ${Xquare_colors.slate[600]};
  font-size: 13px;
  font-weight: 400;
  line-height: 1.4;
  margin: -2px 0 0;
`;

export const CheckboxGroup = styled.div`
  display: grid;
  gap: 20px;
  margin-top: -2px;
`;

export const CheckboxLabel = styled.label`
  align-items: center;
  color: ${Xquare_colors.slate[900]};
  display: flex;
  font-size: 14px;
  font-weight: 400;
  gap: 12px;
`;

export const Checkbox = styled.input`
  accent-color: ${Xquare_colors.purple[400]};
  appearance: none;
  border: 1px solid ${Xquare_colors.slate[400]};
  border-radius: 4px;
  height: 20px;
  margin: 0;
  position: relative;
  width: 20px;

  &:checked {
    background: ${Xquare_colors.purple[400]};
    border-color: ${Xquare_colors.purple[400]};
  }

  &:checked::after {
    border: solid ${Xquare_colors.white};
    border-width: 0 2px 2px 0;
    content: "";
    height: 10px;
    left: 6px;
    position: absolute;
    top: 3px;
    transform: rotate(45deg);
    width: 5px;
  }
`;

export const TwoFields = styled.div`
  display: grid;
  gap: 18px;
  grid-template-columns: 1fr 1fr;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const BottomActions = styled(Actions)`
  justify-content: flex-start;
  margin-top: 34px;
  max-width: 810px;
  width: 100%;
`;

export const EditBottomActions = styled(Actions)`
  margin-top: 34px;
  max-width: 810px;
  width: 100%;
`;

export const EditActionGroup = styled.div`
  display: flex;
  gap: 12px;
`;
