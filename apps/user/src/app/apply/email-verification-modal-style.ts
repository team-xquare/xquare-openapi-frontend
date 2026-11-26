import styled from "@emotion/styled";
import { Xquare_colors } from "../../styles/colors";

export const CodeInputWrap = styled.div`
  align-items: center;
  border: 1px solid ${Xquare_colors.slate[400]};
  border-radius: 8px;
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding: 0 16px 0 20px;
`;

export const CodeInput = styled.input`
  border: 0;
  color: ${Xquare_colors.slate[900]};
  flex: 1;
  font-size: 16px;
  min-width: 0;
  outline: none;
  padding: 16px 0;

  &::placeholder {
    color: ${Xquare_colors.slate[400]};
  }
`;

export const Timer = styled.span`
  color: ${Xquare_colors.blue[500]};
  flex: 0 0 auto;
  font-size: 16px;
  font-weight: 700;
`;

export const VerificationNotice = styled.p`
  color: ${Xquare_colors.gray[600]};
  font-size: 14px;
  line-height: 1.5;
  margin: 8px 0 0;
  text-align: left;
`;

export const ResendButton = styled.button`
  background: transparent;
  border: 0;
  color: ${Xquare_colors.blue[500]};
  cursor: pointer;
  font: inherit;
  padding: 0;
  text-decoration: underline;
`;
