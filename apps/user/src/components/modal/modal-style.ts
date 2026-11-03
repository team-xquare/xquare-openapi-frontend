import styled from "@emotion/styled";
import { Xquare_colors } from "../../styles/colors";
import { Xquare_fonts } from "../../styles/fonts";

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

// 문의하기 모달: 오류 정보를 표로 보여 주므로 왼쪽 정렬에 더 넓게 씀
export const ContactDialog = styled(ModalDialog)`
  padding: 40px;
  text-align: left;
  width: 560px;

  /* Figma 문의하기 모달 배경 (검정 45%) */
  &::backdrop {
    background: ${Xquare_colors.black}73;
  }

  @media (max-width: 520px) {
    padding: 28px 24px;
  }
`;

export const ContactTitle = styled(ModalTitle)`
  font-size: 24px;
  margin: 0 0 16px;
`;

export const ContactDescription = styled(ModalDescription)`
  font-size: 16px;
  line-height: 1.5;
`;

// 항목 이름은 90px 고정, 값은 남은 너비에서 줄바꿈
const INFO_ROW = `
  display: flex;
  font-size: 14px;
  gap: 16px;
  line-height: normal;
  margin: 0;

  dt {
    color: ${Xquare_colors.slate[900]};
    flex: 0 0 90px;
    font-weight: 700;
  }

  dd {
    margin: 0;
    min-width: 0;
    overflow-wrap: anywhere;
  }
`;

export const ErrorInfoList = styled.dl`
  background: ${Xquare_colors.slate[100]};
  border-radius: 8px;
  color: ${Xquare_colors.slate[900]};
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 16px 0 0;
  padding: 16px;
`;

export const ErrorInfoRow = styled.div`
  ${INFO_ROW}

  dd {
    font-family: ${Xquare_fonts.mono};
  }
`;

export const ContactInfo = styled.dl`
  ${INFO_ROW}
  margin-top: 16px;

  dd {
    color: ${Xquare_colors.gray[600]};
  }
`;

export const ContactActions = styled(ModalActions)`
  justify-content: flex-start;
  margin-top: 24px;
`;

// Figma 문의하기 모달 버튼 크기 (16px 굵게, 여백 14px 28px)
const CONTACT_BUTTON = `
  font-size: 16px;
  font-weight: 700;
  line-height: normal;
  padding: 14px 28px;
`;

export const ContactPrimaryButton = styled(PrimaryButton)`
  ${CONTACT_BUTTON}
`;

export const ContactSecondaryButton = styled(SecondaryButton)`
  ${CONTACT_BUTTON}
`;
