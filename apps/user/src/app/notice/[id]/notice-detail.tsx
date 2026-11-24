"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  fetchNotice,
  fetchNoticePage,
  isAbortError,
  toErrorStatus,
  type Notice,
  type NoticeSummary,
} from "../../notice-content";
import type { ErrorStatus } from "../../error-content";
import { ErrorView } from "../../error-view";
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

// API가 이전글 · 다음글을 주지 않아 최신 목록 한 페이지(서버 최대 100건) 안에서 찾음
const NEIGHBOR_LOOKUP_SIZE = 100;

interface NoticeDetailData {
  notice: Notice;
  prev?: NoticeSummary;
  next?: NoticeSummary;
}

export function NoticeDetail({ id }: { id: string }) {
  const [data, setData] = useState<NoticeDetailData | null>(null);
  const [errorStatus, setErrorStatus] = useState<ErrorStatus | null>(null);
  // 바뀌면 공지를 다시 불러옴 (다시 시도)
  const [reloadKey, setReloadKey] = useState(0);

  // 로그인 토큰이 필요한 API라 렌더 중이 아니라 effect에서 불러옴
  useEffect(() => {
    const request = new AbortController();
    Promise.all([
      fetchNotice(id, request.signal),
      // 이전글 · 다음글은 못 찾아도 본문은 보여 줌
      fetchNoticePage(0, NEIGHBOR_LOOKUP_SIZE, request.signal).catch(() => null),
    ])
      .then(([notice, list]) => {
        const notices = list?.notices ?? [];
        const index = notices.findIndex((item) => item.id === notice.id);
        // 목록이 최신순이라 이전글은 바로 뒤, 다음글은 바로 앞 항목
        setData({
          notice,
          prev: index === -1 ? undefined : notices[index + 1],
          next: index > 0 ? notices[index - 1] : undefined,
        });
      })
      .catch((error: unknown) => {
        if (isAbortError(error) || request.signal.aborted) return;
        setErrorStatus(toErrorStatus(error));
      });
    return () => request.abort();
  }, [id, reloadKey]);

  if (errorStatus) {
    return (
      <ErrorView
        status={errorStatus}
        onRetry={() => {
          setErrorStatus(null);
          setReloadKey((key) => key + 1);
        }}
      />
    );
  }

  return (
    <NoticeDetailFrame>
      {data ? (
        <NoticeArticle {...data} />
      ) : (
        <NoticeMeta role="status">공지사항을 불러오는 중입니다.</NoticeMeta>
      )}
    </NoticeDetailFrame>
  );
}

function NoticeDetailFrame({ children }: { children: ReactNode }) {
  return (
    <EndpointPage>
      <PageWelcome />
      <PageDivider />
      {children}
    </EndpointPage>
  );
}

function NoticeArticle({ notice, prev, next }: NoticeDetailData) {
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
