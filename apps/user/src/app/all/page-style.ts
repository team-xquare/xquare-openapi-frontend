import styled from "@emotion/styled";
import Link from "next/link";

export const EndpointPage = styled.main`
  margin: 0 auto;
  max-width: 1480px;
  min-height: 100%;
  padding: 32px 32px 64px;
  width: 100%;

  @media (max-width: 720px) {
    padding: 24px 18px 48px;
  }
`;

export const ListHeader = styled.header`
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  gap: 24px;
`;

export const WelcomeCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const WelcomeHeading = styled.h1`
  color: #111111;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.3;
  margin: 0;

  @media (max-width: 520px) {
    font-size: 22px;
  }
`;

export const WelcomeLead = styled.p`
  color: #111111;
  font-size: 15px;
  line-height: 1.5;
  margin: 0;
`;

export const LogoutButton = styled.button`
  background: #fff;
  border: 1px solid #d2d2d2;
  border-radius: 999px;
  color: #b8b8b8;
  cursor: pointer;
  flex: 0 0 auto;
  font-size: 14px;
  height: 38px;
  padding: 0 26px;

  &:hover,
  &:focus-visible {
    border-color: #9650fa;
    color: #7331d2;
    outline: none;
  }
`;

export const PageDivider = styled.hr`
  border: 0;
  border-top: 1px solid #dedede;
  margin: 18px 0 26px;
`;

export const EndpointList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

export const EndpointGroupSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
  scroll-margin-top: 24px;

  h2 {
    color: #111;
    font-size: 21px;
    font-weight: 700;
    line-height: 1.35;
    margin: 0;
  }

  > div {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
`;

export const EndpointCard = styled.article`
  align-items: center;
  background: #f5efff;
  border: 1px solid #a45aff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgb(105 54 166 / 16%);
  display: flex;
  gap: 14px;
  min-height: 46px;
  padding: 6px 8px;

  @media (max-width: 520px) {
    align-items: flex-start;
    gap: 10px;
  }
`;

export const EndpointCardLink = styled(Link)`
  border-radius: 4px;
  display: block;
`;

export const EndpointMethod = styled.span`
  align-items: center;
  background: #9650fa;
  border-radius: 4px;
  color: #fff;
  display: inline-flex;
  flex: 0 0 82px;
  font-size: 14px;
  height: 32px;
  justify-content: center;
`;

export const EndpointDescription = styled.span`
  color: #17131d;
  font-size: 14px;
  line-height: 1.5;
  word-break: keep-all;
`;
