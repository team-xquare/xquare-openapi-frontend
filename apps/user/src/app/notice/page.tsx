"use client";

import { useEffect, useState } from "react";
import { PageWelcome } from "../endpoint-listing";
import { ErrorView } from "../error-view";
import type { ErrorStatus } from "../error-content";
import {
  fetchNoticePage,
  isAbortError,
  toErrorStatus,
  type NoticePage as NoticePageData,
} from "../notice-content";
import {
  EndpointPage,
  PageDivider,
} from "../all/page-style";
import {
  NoticeDescription,
  NoticeHeading,
  NoticePageCount,
  NoticePager,
  NoticePagerButton,
  NoticePagerButtons,
  NoticeTable,
  NoticeTableBody,
  NoticeTableHeader,
  NoticeTableMessage,
  NoticeTableRow,
  NoticeTitleLink,
} from "./page-style";

const PAGE_SIZE = 10;

export default function NoticePage() {
  // 0부터 셈
  const [page, setPage] = useState(0);
  // 처음 불러오기 전에는 null. 페이지를 넘기는 동안에는 이전 페이지를 그대로 보여 줌
  const [data, setData] = useState<NoticePageData | null>(null);
  const [errorStatus, setErrorStatus] = useState<ErrorStatus | null>(null);
  // 바뀌면 목록을 다시 불러옴 (다시 시도)
  const [reloadKey, setReloadKey] = useState(0);

  // 로그인 토큰이 필요한 API라 렌더 중이 아니라 effect에서 불러옴.
  // 다른 화면에서 돌아와 다시 보일 때도 다시 돌아 최신 목록을 받음
  useEffect(() => {
    const request = new AbortController();
    fetchNoticePage(page, PAGE_SIZE, request.signal)
      .then((loaded) => {
        // 그 사이 공지가 지워져 지금 페이지가 비면 마지막 페이지로 옮김
        if (loaded.notices.length === 0 && page > 0 && loaded.totalPage > 0) {
          setPage(loaded.totalPage - 1);
          return;
        }
        setData(loaded);
      })
      .catch((error: unknown) => {
        if (isAbortError(error) || request.signal.aborted) return;
        setErrorStatus(toErrorStatus(error));
      });
    return () => request.abort();
  }, [page, reloadKey]);

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

  const totalPage = Math.max(1, data?.totalPage ?? 1);

  return (
    <EndpointPage>
      <PageWelcome />
      <PageDivider />

      <NoticeHeading>공지사항</NoticeHeading>
      <NoticeDescription>
        XQUARE Open API 운영과 학교 소식을 안내합니다.
      </NoticeDescription>

      <NoticeTable role="table" aria-label="공지사항 목록">
        <NoticeTableHeader role="row">
          <span role="columnheader">제목</span>
          <span role="columnheader">작성자</span>
          <span role="columnheader">작성일</span>
        </NoticeTableHeader>
        <NoticeTableBody>
          {data?.notices.map((notice) => (
            <NoticeTableRow key={notice.id} role="row">
              <span role="cell">
                <NoticeTitleLink href={`/notice/${notice.id}`}>
                  {notice.title}
                </NoticeTitleLink>
              </span>
              <span role="cell">{notice.author}</span>
              {/* 목록에는 작성 시각을 빼고 날짜만 표시 */}
              <span role="cell">{notice.createdAt.slice(0, 10)}</span>
            </NoticeTableRow>
          ))}
        </NoticeTableBody>
      </NoticeTable>
      {!data && (
        <NoticeTableMessage role="status">
          공지사항을 불러오는 중입니다.
        </NoticeTableMessage>
      )}
      {data?.notices.length === 0 && (
        <NoticeTableMessage>등록된 공지사항이 없습니다.</NoticeTableMessage>
      )}

      {data && (
        <NoticePager>
          <NoticePageCount>
            전체 {data.totalCount}건 · {data.page + 1} / {totalPage} 페이지
          </NoticePageCount>
          <NoticePagerButtons role="group" aria-label="페이지">
            <NoticePagerButton
              type="button"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              이전
            </NoticePagerButton>
            <NoticePagerButton
              type="button"
              disabled={page + 1 >= totalPage}
              onClick={() => setPage(page + 1)}
            >
              다음
            </NoticePagerButton>
          </NoticePagerButtons>
        </NoticePager>
      )}
    </EndpointPage>
  );
}
