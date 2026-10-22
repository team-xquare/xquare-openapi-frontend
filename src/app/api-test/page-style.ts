import styled from "@emotion/styled";
import { Xquare_colors } from "../../index";

const BORDER = `1px solid ${Xquare_colors.slate[400]}`;
const ACCENT_COLOR = Xquare_colors.blue[400];

export const ApiTestContainer = styled.main`
  display: flex;
  flex-direction: column;
  gap: 28px;
  min-height: 100%;
  padding: 40px;
  word-break: keep-all;

  @media (max-width: 720px) {
    padding: 24px 18px 48px;
  }
`;

export const ApiTestHeader = styled.header`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ApiTestTitle = styled.h1`
  color: ${Xquare_colors.slate[900]};
  font-size: 28px;
  font-weight: 700;
  line-height: normal;
  margin: 0;
`;

export const ApiTestLead = styled.p`
  color: ${Xquare_colors.gray[600]};
  font-size: 16px;
  line-height: normal;
  margin: 0;
`;

export const RequestBar = styled.div`
  align-items: center;
  display: flex;
  gap: 12px;
`;

export const MethodSelectWrap = styled.label`
  flex: 0 0 auto;
  position: relative;

  &::after {
    color: ${Xquare_colors.gray[600]};
    content: "▾";
    font-size: 14px;
    pointer-events: none;
    position: absolute;
    right: 19px;
    top: 50%;
    transform: translateY(-50%);
  }
`;

export const MethodSelect = styled.select`
  appearance: none;
  background: ${Xquare_colors.white};
  border: ${BORDER};
  border-radius: 8px;
  color: ${ACCENT_COLOR};
  cursor: pointer;
  field-sizing: content;
  font: inherit;
  font-size: 16px;
  font-weight: 700;
  line-height: 20px;
  padding: 14px 32px 14px 18px;

  &:focus-visible {
    border-color: ${ACCENT_COLOR};
    outline: none;
  }
`;

export const UrlInput = styled.input`
  border: ${BORDER};
  border-radius: 8px;
  color: ${Xquare_colors.slate[900]};
  flex: 1;
  font: inherit;
  font-size: 16px;
  line-height: 20px;
  min-width: 0;
  padding: 14px 18px;

  &:focus {
    border-color: ${ACCENT_COLOR};
    outline: none;
  }
`;

export const SendButton = styled.button`
  background: ${ACCENT_COLOR};
  border: 0;
  border-radius: 8px;
  color: ${Xquare_colors.white};
  cursor: pointer;
  flex: 0 0 auto;
  font-size: 16px;
  font-weight: 700;
  line-height: 20px;
  padding: 14px 36px;
`;
