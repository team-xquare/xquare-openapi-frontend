import styled from "@emotion/styled";
import Link from "next/link";
import { Xquare_colors } from "../../../index";

export const NoticeDetailContainer = styled.article`
  display: flex;
  flex-direction: column;
  word-break: keep-all;
`;

export const NoticeBackLink = styled(Link)`
  align-self: flex-start;
  color: ${Xquare_colors.purple[500]};
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;

  &:hover,
  &:focus-visible {
    text-decoration: underline;
  }
`;

export const NoticeTitle = styled.h2`
  color: ${Xquare_colors.black};
  font-size: 24px;
  font-weight: 600;
  line-height: normal;
  margin: 0 0 10px;
`;

export const NoticeMeta = styled.p`
  color: ${Xquare_colors.gray[600]};
  font-size: 14px;
  line-height: normal;
  margin: 0 0 20px;
`;

export const NoticeBody = styled.div`
  border-bottom: 1px solid ${Xquare_colors.slate[200]};
  border-top: 1px solid ${Xquare_colors.slate[200]};
  color: ${Xquare_colors.black};
  font-size: 16px;
  line-height: 1.7;
  padding: 24px 0 40px;
  white-space: pre-wrap;
`;

export const NoticeNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 16px;
`;

export const NoticeNavItem = styled.p`
  color: ${Xquare_colors.gray[600]};
  display: flex;
  font-size: 14px;
  gap: 8px;
  line-height: normal;
  margin: 0;

  a:hover,
  a:focus-visible {
    text-decoration: underline;
  }
`;
