import styled from "@emotion/styled";
import { Xquare_colors, Xquare_fonts } from "../../index";

const BORDER = `1px solid ${Xquare_colors.slate[400]}`;
const ACCENT_COLOR = Xquare_colors.blue[400];
const PLACEHOLDER_COLOR = "#8C9199";

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

export const ApiTestColumns = styled.div`
  display: grid;
  flex: 1;
  gap: 24px;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 1024px) {
    align-content: start;
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const ApiTestPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
`;

export const Card = styled.section`
  background: ${Xquare_colors.white};
  border: ${BORDER};
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

// 왼쪽 패널의 남은 높이를 요청 카드가 채움
export const FillCard = styled(Card)`
  flex: 1 0 auto;
`;

export const CardHead = styled.header`
  align-items: center;
  border-bottom: ${BORDER};
  display: flex;
  gap: 12px;
  padding: 16px 20px;

  h2 {
    color: ${Xquare_colors.slate[900]};
    font-size: 18px;
    font-weight: 700;
    line-height: normal;
    margin: 0 auto 0 0;
  }
`;

export const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 20px;
`;

export const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const FieldLabel = styled.span`
  color: ${Xquare_colors.slate[900]};
  font-size: 15px;
  font-weight: 700;
  line-height: normal;
`;

export const TextInput = styled.input`
  border: ${BORDER};
  border-radius: 6px;
  color: ${Xquare_colors.slate[900]};
  font: inherit;
  font-size: 15px;
  line-height: normal;
  padding: 12px 14px;
  width: 100%;

  &::placeholder {
    color: ${PLACEHOLDER_COLOR};
  }

  &:focus {
    border-color: ${ACCENT_COLOR};
    outline: none;
  }
`;

export const FieldHint = styled.p`
  color: ${Xquare_colors.gray[600]};
  font-size: 14px;
  line-height: normal;
  margin: 0;
`;

export const TabList = styled.div`
  align-items: flex-start;
  display: flex;
  gap: 24px;
`;

export const TabButton = styled.button`
  appearance: none;
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  color: ${Xquare_colors.gray[600]};
  cursor: pointer;
  font-size: 15px;
  line-height: normal;
  padding: 0 0 10px;

  &[aria-pressed="true"] {
    border-bottom-color: ${ACCENT_COLOR};
    color: ${ACCENT_COLOR};
    font-weight: 700;
  }
`;

export const CodePanel = styled.pre`
  background: ${Xquare_colors.gray[700]};
  border-radius: 10px;
  color: ${Xquare_colors.white};
  font-family: ${Xquare_fonts.mono};
  font-size: 15px;
  line-height: normal;
  margin: 0;
  overflow-x: auto;
  padding: 16px;
`;
