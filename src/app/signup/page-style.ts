import styled from "@emotion/styled";

// 인증코드를 발송하면 이메일 아래에 인증코드 입력칸이 나타남
export const VerifyInputWrap = styled.div<{ isVisible: boolean }>`
  align-self: center;
  max-width: 100%;
  opacity: ${(props) => (props.isVisible ? 1 : 0)};
  pointer-events: ${(props) => (props.isVisible ? "auto" : "none")};
  transform: translateY(${(props) => (props.isVisible ? "0" : "-4px")});
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
  width: fit-content;
`;
