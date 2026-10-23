import styled from "@emotion/styled";
import { Xquare_colors } from "../../styles/colors";

export const ModalDialog = styled.dialog`
  background: ${Xquare_colors.white};
  border: 0;
  border-radius: 16px;
  color: ${Xquare_colors.slate[900]};
  margin: auto;
  max-height: calc(100dvh - 40px);
  max-width: calc(100vw - 40px);
  padding: 34px 40px 28px;
  text-align: center;
  width: 480px;

  &::backdrop {
    background: ${Xquare_colors.black}80;
  }

  @media (max-width: 520px) {
    padding: 28px 24px;
  }
`;

export const ModalTitle = styled.h2`
  font-size: 22px;
  font-weight: 700;
  line-height: 1.4;
  margin: 0 0 12px;
`;

export const ModalDescription = styled.p`
  color: ${Xquare_colors.gray[600]};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.3;
  margin: 0;
  word-break: keep-all;
`;

export const ModalActions = styled.form`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 30px;
`;

export const PrimaryButton = styled.button`
  background: ${Xquare_colors.blue[500]};
  border: 1px solid ${Xquare_colors.blue[500]};
  border-radius: 8px;
  color: ${Xquare_colors.white};
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  min-height: 44px;
  padding: 10px 24px;

  &:focus-visible {
    outline: 2px solid ${Xquare_colors.blue[500]};
    outline-offset: 3px;
  }
`;

export const SecondaryButton = styled(PrimaryButton)`
  background: ${Xquare_colors.white};
  border-color: ${Xquare_colors.slate[400]};
  color: ${Xquare_colors.slate[900]};
`;
