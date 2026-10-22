"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { Notice } from "../../notice-content";
import { PageWelcome } from "../../endpoint-listing";
import { EndpointPage, PageDivider } from "../../all/page-style";
import {
  NoticeBackLink,
  NoticeBody,
  NoticeDetailContainer,
  NoticeMeta,
  NoticeNav,
  NoticeNavItem,
  NoticeTitle,
} from "./page-style";

export function NoticeDetailFrame({ children }: { children: ReactNode }) {
  return (
    <EndpointPage>
      <PageWelcome />
      <PageDivider />
      {children}
    </EndpointPage>
  );
}

export function NoticeArticle({
  notice,
  prev,
  next,
}: {
  notice: Notice;
  prev?: Notice;
  next?: Notice;
}) {
  return (
    <NoticeDetailContainer>
      <NoticeBackLink href="/notice">← 공지사항 목록</NoticeBackLink>
      <NoticeTitle>{notice.title}</NoticeTitle>
      <NoticeMeta>
        {notice.author} · {notice.createdAt} 작성
        {notice.updatedAt && ` · ${notice.updatedAt} 수정`}
      </NoticeMeta>
      <NoticeBody>{notice.content}</NoticeBody>

      <NoticeNav aria-label="이전글, 다음글">
        {prev && (
          <NoticeNavItem>
            <span>이전글</span>
            <Link href={`/notice/${prev.id}`}>{prev.title}</Link>
          </NoticeNavItem>
        )}
        {next && (
          <NoticeNavItem>
            <span>다음글</span>
            <Link href={`/notice/${next.id}`}>{next.title}</Link>
          </NoticeNavItem>
        )}
      </NoticeNav>
    </NoticeDetailContainer>
  );
}
