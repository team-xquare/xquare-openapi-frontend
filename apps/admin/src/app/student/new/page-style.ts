import styled from "@emotion/styled";
import Link from "next/link";
import { Xquare_colors } from "../../../styles/colors";

const BORDER = `1px solid ${Xquare_colors.slate[200]}`;
const STRONG_BORDER = `1px solid ${Xquare_colors.slate[400]}`;
const CONTROL = `
  border: ${STRONG_BORDER};
  border-radius: 8px;
  color: ${Xquare_colors.slate[900]};
  font: inherit;
  font-size: 15px;
  font-weight: 400;
  height: 48px;
  padding: 0 16px;
  width: 100%;
  &:focus { border-color: ${Xquare_colors.purple[400]}; outline: none; }
  &::placeholder { color: ${Xquare_colors.slate[400]}; }
`;

const ACTION_BUTTON = `
  align-items: center;
  border-radius: 8px;
  display: inline-flex;
  font: inherit;
  font-size: 14px;
  font-weight: 400;
  height: 40px;
  justify-content: center;
  padding: 0 20px;
`;

export const RegisterPage = styled.main`
  display: flex;
  flex-direction: column;
  padding: 48px 58px 64px;
  word-break: keep-all;

  @media (max-width: 760px) {
    padding: 32px 20px 48px;
  }
`;

export const PageHead = styled.header`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 36px;
`;

export const PageTitle = styled.h1`
  color: ${Xquare_colors.slate[900]};
  font-size: 28px;
  margin: 0;
`;

export const PageDescription = styled.p`
  color: ${Xquare_colors.slate[600]};
  font-size: 15px;
  margin: 0;
`;

export const RegisterForm = styled.form`
  border: ${BORDER};
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  max-width: 810px;
  padding: 36px 38px;

  @media (max-width: 760px) {
    gap: 24px;
    padding: 24px 20px;
  }
`;

export const NumberFields = styled.div`
  display: grid;
  gap: 18px;
  grid-template-columns: 1fr 1fr;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const Field = styled.label`
  color: ${Xquare_colors.slate[900]};
  display: flex;
  flex-direction: column;
  font-size: 14px;
  font-weight: 700;
  gap: 8px;
  input,
  select {
    ${CONTROL}
  }
`;

export const FieldLabel = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 18px;
`;

export const Required = styled.span`
  color: ${Xquare_colors.red[600]};
  margin-left: 4px;
`;

export const Calculated = styled.div`
  ${CONTROL}
  align-items: center;
  background: ${Xquare_colors.slate[50]};
  color: ${Xquare_colors.slate[600]};
  display: flex;
  font-weight: 400;
`;

export const HelpText = styled.p`
  color: ${Xquare_colors.slate[600]};
  font-size: 13px;
  font-weight: 400;
  line-height: 1.45;
  margin: -12px 0 0;
`;

export const ClubRow = styled.div`
  align-items: flex-end;
  display: flex;
  gap: 12px;
  input {
    flex: 1;
  }

  @media (max-width: 600px) {
    align-items: stretch;
    flex-direction: column;

    input {
      width: 100%;
    }
  }
`;

export const ReadonlyInput = styled.input`
  ${CONTROL}
  background: ${Xquare_colors.slate[50]};
`;

export const SmallLink = styled(Link)`
  align-items: center;
  border: ${STRONG_BORDER};
  border-radius: 8px;
  color: ${Xquare_colors.slate[900]};
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 14px;
  font-weight: 400;
  height: 48px;
  justify-content: center;
  padding: 0 16px;
`;

export const Note = styled.p`
  color: ${Xquare_colors.slate[600]};
  font-size: 13px;
  font-weight: 400;
  line-height: 1.4;
  margin: -2px 0 0;
`;

export const Actions = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 6px;
`;

export const ActionGroup = styled.div`
  display: flex;
  gap: 12px;
`;

export const DeleteButton = styled.button`
  ${ACTION_BUTTON}
  background: ${Xquare_colors.white};
  border: 1px solid ${Xquare_colors.red[600]};
  color: ${Xquare_colors.red[600]};
  cursor: pointer;

  &:hover {
    background: ${Xquare_colors.red[500]}12;
  }
`;

export const CancelLink = styled(Link)`
  ${ACTION_BUTTON}
  border: ${STRONG_BORDER};
  color: ${Xquare_colors.slate[900]};
`;

export const SaveButton = styled.button`
  ${ACTION_BUTTON}
  background: ${Xquare_colors.purple[400]};
  border: 0;
  color: ${Xquare_colors.white};
  cursor: pointer;

  &:hover {
    background: ${Xquare_colors.purple[700]};
  }

  &:focus-visible {
    outline: 2px solid ${Xquare_colors.purple[400]};
    outline-offset: 2px;
  }
`;
