import styled from "@emotion/styled";
import { Xquare_colors } from "../../styles/colors";
import { PrimaryButton } from "../../components/auth-layout/auth-layout-style";

export const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 100%;
  width: 360px;
`;

export const LoginTitle = styled.h1`
  color: ${Xquare_colors.slate[900]};
  font-size: 28px;
  font-weight: 700;
  line-height: normal;
  margin: 0;
`;

export const LoginField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const LoginLabel = styled.label`
  color: ${Xquare_colors.slate[900]};
  font-size: 14px;
  font-weight: 700;
  line-height: normal;
`;

export const LoginInput = styled.input`
  border: 1px solid ${Xquare_colors.slate[400]};
  border-radius: 8px;
  color: ${Xquare_colors.slate[900]};
  font: inherit;
  font-size: 15px;
  height: 48px;
  padding: 0 16px;
  width: 100%;

  &::placeholder {
    color: ${Xquare_colors.slate[400]};
  }

  &:focus {
    border-color: ${Xquare_colors.purple[400]};
    outline: none;
  }
`;

export const LoginButton = styled(PrimaryButton)`
  width: 100%;
`;

export const LoginNote = styled.div`
  color: ${Xquare_colors.slate[600]};
  font-size: 13px;
  line-height: normal;

  p {
    margin: 0;
  }
`;
