import styled from "@emotion/styled";
import Link from "next/link";
import { Xquare_colors } from "../../styles/colors";

// Figma 소개 영역의 "데이터 관리자" 글자색. 색상 토큰에 없는 값이라 따로 둠
const INTRO_SUBTITLE_COLOR = "#C4B5FD";
const MOBILE = "@media (max-width: 760px)";

// 1728px 화면에서 소개 1000px · 패널 728px, 좁아져도 같은 비율
export const AuthContainer = styled.div`
  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  word-break: keep-all;

  ${MOBILE} {
    flex-direction: column;
  }
`;

export const AuthIntro = styled.div`
  align-items: center;
  background: ${Xquare_colors.purple[700]};
  color: ${Xquare_colors.white};
  display: flex;
  flex: 0 0 calc(100% * 1000 / 1728);
  flex-direction: column;
  gap: 12px;
  justify-content: center;
  line-height: normal;
  padding: 40px 16px;
  text-align: center;

  p {
    margin: 0;
  }

  ${MOBILE} {
    flex: 0 0 auto;
  }
`;

export const IntroLogo = styled.p`
  font-size: 40px;
  font-weight: 700;
`;

export const IntroSubtitle = styled.p`
  color: ${INTRO_SUBTITLE_COLOR};
  font-size: 20px;
  font-weight: 600;
`;

export const IntroDescription = styled.p`
  font-size: 15px;
`;

export const AuthPanel = styled.main`
  align-items: center;
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding: 40px 16px;

  ${MOBILE} {
    flex: 1 1 auto;
  }
`;

const BUTTON = `
  align-items: center;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  font-size: 15px;
  font-weight: 700;
  justify-content: center;
  line-height: normal;
  padding: 14px 24px;
  white-space: nowrap;

  &:focus-visible {
    outline: 2px solid ${Xquare_colors.purple[400]};
    outline-offset: 2px;
  }
`;

const PRIMARY = `
  ${BUTTON}
  background: ${Xquare_colors.purple[400]};
  border: 0;
  color: ${Xquare_colors.white};

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
`;

export const PrimaryButton = styled.button`
  ${PRIMARY}
`;

export const PrimaryLink = styled(Link)`
  ${PRIMARY}
`;

export const SecondaryAnchor = styled.a`
  ${BUTTON}
  background: ${Xquare_colors.white};
  border: 1px solid ${Xquare_colors.slate[400]};
  color: ${Xquare_colors.slate[900]};
`;
