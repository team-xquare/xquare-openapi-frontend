"use client";

import { PageWelcome } from "../endpoint-listing";
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

const NOTICES = [
  { title: "9월 급식 변경 안내", author: "김영희", date: "2026-09-03" },
  { title: "2학기 동아리 모집 안내", author: "홍길동", date: "2026-09-01" },
  { title: "체육대회 일정 공지", author: "이진경", date: "2026-08-28" },
  { title: "기숙사 점호 시간 변경", author: "정은진", date: "2026-08-25" },
  { title: "9월 자습 감독 배정", author: "홍길동", date: "2026-08-20" },
];

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
            <NoticeTableRow key={notice.title} role="row">
              <span role="cell">{notice.title}</span>
              <span role="cell">{notice.author}</span>
              <span role="cell">{notice.date}</span>
            </NoticeTableRow>
          ))}
        </NoticeTableBody>
      </NoticeTable>
      <NoticePageCount>전체 42건 · 1 / 9 페이지</NoticePageCount>
    </EndpointPage>
  );
}
