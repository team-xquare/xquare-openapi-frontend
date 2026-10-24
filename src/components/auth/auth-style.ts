import styled from "@emotion/styled";
import Image from "next/image";
import Link from "next/link";
import { Xquare_colors } from "../../styles/colors";
import { AUTH_FONT_FAMILY } from "./auth-font";

// XQUARE 인프라 서비스의 링크 색이 공통 색상 토큰에 없어 따로 지정
const LINK_COLOR = "#5050FF";
const MOBILE = "@media (max-width: 650px)";

export const AuthContainer = styled.div`
  background-color: ${Xquare_colors.white};
  display: flex;
  flex-direction: row;
  min-height: 100%;
  word-break: keep-all;

  ${MOBILE} {
    flex-direction: column;
  }
`;

export const AuthIntro = styled.div`
  align-items: center;
  background-color: ${Xquare_colors.purple[500]};
  box-shadow: inset -4px 0 10px ${Xquare_colors.black}59;
  display: flex;
  flex: 1 1 65%;
  justify-content: center;

  ${MOBILE} {
    max-height: 30vh;
    padding: 0.7rem 0;
    width: 100%;
  }
`;

export const AuthLogo = styled(Image)`
  height: auto;
  max-width: 360px;
  width: 55%;

  ${MOBILE} {
    max-height: 28vh;
    width: 43%;
  }
`;

export const AuthPanel = styled.main`
  align-items: center;
  display: flex;
  flex: 1 1 35%;
  flex-direction: column;
  gap: 2rem;
  margin-top: 15vh;

  ${MOBILE} {
    margin-top: 7vh;
  }
`;

export const AuthFormCard = styled.form`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 450px;
  width: 100%;
`;

export const AuthTitle = styled.h1`
  color: ${Xquare_colors.black};
  font-family: ${AUTH_FONT_FAMILY};
  font-size: 35px;
  font-weight: 800;
  line-height: normal;
  margin: 0;
  text-align: center;
`;

// 단계가 바뀔 때 입력칸 묶음을 살짝 내리며 사라지게 함
export const AuthInputs = styled.div<{ isFading?: boolean }>`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-bottom: 9.8rem;
  opacity: ${(props) => (props.isFading ? 0 : 1)};
  transform: translateY(${(props) => (props.isFading ? "10px" : "0")});
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
  width: 100%;

  ${MOBILE} {
    margin-bottom: 3rem;
  }
`;

export const AuthFormActions = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  width: 100%;
`;

export const AuthLinkRow = styled.p`
  align-items: center;
  color: ${Xquare_colors.black};
  display: flex;
  font-size: 12px;
  gap: 0.6rem;
  margin: 0;
`;

export const AuthLink = styled(Link)`
  align-items: center;
  color: ${LINK_COLOR};
  display: flex;
  font-size: 12px;
  height: 1.8rem;
  justify-content: center;
`;

// 페이지 이동 없이 이전 단계로 돌아가는 링크 모양 버튼 (인프라처럼 높이를 고정하지 않음)
export const AuthLinkButton = styled.button`
  appearance: none;
  background: transparent;
  border: 0;
  color: ${LINK_COLOR};
  cursor: pointer;
  font-size: 12px;
  line-height: normal;
  padding: 0;
`;

// 비밀번호 찾기 페이지가 아직 없어 비활성 버튼으로 자리만 둠
export const PasswordHelpButton = styled.button`
  appearance: none;
  background: transparent;
  border: 0;
  color: ${Xquare_colors.gray[500]};
  cursor: not-allowed;
  font-family: ${AUTH_FONT_FAMILY};
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0;
  text-align: right;
  width: 300px;
`;
