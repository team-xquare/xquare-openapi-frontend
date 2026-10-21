"use client";

import { PageWelcome } from "../endpoint-listing";
import { NOTICES } from "../notice-content";
import {
  EndpointPage,
  PageDivider,
} from "../all/page-style";
import {
  NoticeDescription,
  NoticeHeading,
  NoticePageCount,
  NoticeTable,
  NoticeTableBody,
  NoticeTableHeader,
  NoticeTableRow,
} from "./page-style";

export default function NoticePage() {
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
          {NOTICES.map((notice) => (
            <NoticeTableRow key={notice.id} role="row">
              <span role="cell">{notice.title}</span>
              <span role="cell">{notice.author}</span>
              {/* 목록에는 작성 시각을 빼고 날짜만 표시 */}
              <span role="cell">{notice.createdAt.slice(0, 10)}</span>
            </NoticeTableRow>
          ))}
        </NoticeTableBody>
      </NoticeTable>
      <NoticePageCount>전체 42건 · 1 / 9 페이지</NoticePageCount>
    </EndpointPage>
  );
}
