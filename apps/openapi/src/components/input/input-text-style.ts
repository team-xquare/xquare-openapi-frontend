import styled from "@emotion/styled";
import Link from "next/link";
import { Xquare_colors } from "../../styles/colors";

const FOCUS_COLOR = Xquare_colors.purple[400];

export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 0.5rem;
`;

// 포커스되면 밑줄, 글자, placeholder를 보라색으로 표시
export const InputField = styled.input`
  background-color: ${Xquare_colors.white};
  border: none;
  border-bottom: 1.2px solid ${Xquare_colors.gray[500]};
  border-radius: 0;
  color: ${Xquare_colors.black};
  cursor: text;
  font: inherit;
  font-size: 1rem;
  font-weight: 400;
  height: 60px;
  line-height: 1rem;
  padding: 0;
  width: 300px;

  &::placeholder {
    color: ${Xquare_colors.gray[500]};
  }

  &:focus {
    border-bottom: 1.2px solid ${FOCUS_COLOR};
    color: ${FOCUS_COLOR};
    outline: none;

    &::placeholder {
      color: ${FOCUS_COLOR};
    }
  }

  &:disabled {
    border-bottom: 1.2px solid ${Xquare_colors.gray[300]};
    cursor: not-allowed;

    &::placeholder {
      color: ${Xquare_colors.gray[300]};
    }
  }
`;

export const InputTitleBox = styled.div`
  align-items: center;
  display: flex;
  height: 1rem;
  justify-content: flex-end;
`;

// Medium(500) 굵기는 인증 화면 폰트에만 있어 먼저 사용하고, 없으면 기본 Pretendard로 표시
export const InputTitle = styled.span<{ titleColor?: string }>`
  color: ${(props) => props.titleColor};
  cursor: pointer;
  font-family: var(--font-pretendard-auth), var(--font-pretendard), sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
`;

export const InputTitleLink = styled(Link)`
  color: inherit;
  height: 1.8rem;
`;
