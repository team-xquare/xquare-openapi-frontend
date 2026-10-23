import styled from "@emotion/styled";
import { Xquare_colors } from "../../index";

export const ApplyContainer = styled.main`
  display: flex;
  flex-direction: column;
  gap: 80px;
  min-height: 100%;
  padding: 40px 40px 80px;
  word-break: keep-all;

  @media (max-width: 720px) {
    gap: 56px;
    padding: 24px 18px 40px;
  }
`;

export const ApplyHeader = styled.header`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ApplyTitle = styled.h1`
  color: ${Xquare_colors.slate[900]};
  font-size: 28px;
  font-weight: 700;
  line-height: 1.3;
  margin: 0;

  @media (max-width: 520px) {
    font-size: 23px;
  }
`;

export const ApplyLead = styled.p`
  color: ${Xquare_colors.slate[900]};
  font-size: 16px;
  line-height: 1.5;
  margin: 0;
`;

export const ApplyForm = styled.form`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  gap: 80px;
`;

export const ApplySection = styled.section`
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
`;

export const StepTitle = styled.h2`
  color: ${Xquare_colors.slate[900]};
  font-size: 18px;
  font-weight: 700;
  line-height: 1.45;
  margin: 0 0 10px;
`;

export const FieldRow = styled.div`
  align-items: center;
  border-bottom: 1px solid ${Xquare_colors.gray[300]};
  display: flex;
  gap: 24px;
  min-height: 54px;
  justify-content: space-between;
  padding: 8px 0;

  @media (max-width: 560px) {
    align-items: stretch;
    flex-direction: column;
    gap: 8px;
    justify-content: center;
    min-height: 74px;
  }
`;

export const FieldLabel = styled.label`
  color: ${Xquare_colors.slate[900]};
  flex: 0 0 auto;
  font-size: 16px;
  line-height: 1.5;
`;

export const FieldInput = styled.input`
  background: transparent;
  border: 0;
  border-radius: 0;
  color: ${Xquare_colors.slate[900]};
  font: inherit;
  font-size: 16px;
  font-weight: 400;
  min-width: 0;
  outline: none;
  padding: 4px 0;
  text-align: right;
  width: min(60%, 420px);

  &::placeholder {
    color: ${Xquare_colors.gray[400]};
    opacity: 1;
  }

  &:focus-visible {
    box-shadow: 0 1px 0 ${Xquare_colors.blue[500]};
  }

  @media (max-width: 560px) {
    text-align: left;
    width: 100%;
  }
`;

export const CompleteButton = styled.button`
  align-items: center;
  align-self: flex-end;
  background: ${Xquare_colors.white};
  border: 1px solid ${Xquare_colors.gray[500]};
  border-radius: 10px;
  color: ${Xquare_colors.gray[500]};
  cursor: pointer;
  display: inline-flex;
  font-size: 15px;
  gap: 8px;
  justify-content: center;
  margin-top: auto;
  min-height: 40px;
  min-width: 100px;
  padding: 0 18px;

  transition:
    background-color 120ms ease,
    color 120ms ease,
    border-color 120ms ease;

  &:hover:not(:disabled),
  &:focus-visible:not(:disabled) {
    background: ${Xquare_colors.blue[500]};
    color: ${Xquare_colors.white};
    outline: none;
  }

  &:disabled {
    border-color: ${Xquare_colors.gray[400]};
    color: ${Xquare_colors.gray[400]};
    cursor: not-allowed;
  }
`;
