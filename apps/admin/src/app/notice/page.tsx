"use client";

import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { NOTICES, type Notice } from "../notice-content";
import { DeleteNoticeModal } from "./delete-notice-modal";
import {
  EmptyCell,
  NoticePage,
  NoticeTable,
  PageButton,
  PageDescription,
  PageHead,
  PageHeading,
  PageList,
  PageTitle,
  Pager,
  PagerTotal,
  PrimaryLink,
  RowActions,
  RowDeleteButton,
  RowEditLink,
  SearchBar,
  SearchInput,
  SecondaryButton,
  VisuallyHidden,
} from "./page-style";

const PAGE_SIZE = 10;

export default function NoticeListPage() {
  // API 연동 전이라 삭제는 화면의 더미 목록에서만 빠짐
  const [notices, setNotices] = useState(NOTICES);
  const [keyword, setKeyword] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Notice | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 다른 페이지로 이동해도 화면이 숨겨진 채 상태가 남으므로,
  // 열려 있던 삭제 모달이 돌아왔을 때 배경 없이 남지 않도록 숨겨질 때 닫음
  useLayoutEffect(() => {
    return () => setDeleteTarget(null);
  }, []);

  const filtered = notices.filter((notice) => notice.title.includes(query));
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // 삭제로 마지막 페이지가 비면 그 앞 페이지를 보여줌
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // 입력할 때마다가 아니라 검색 버튼(또는 Enter)을 눌렀을 때 거름
  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuery(keyword.trim());
    setPage(1);
  };

  return (
    <NoticePage>
      <PageHead>
        <PageHeading>
          <PageTitle>공지 관리</PageTitle>
          <PageDescription>
            공지사항을 최신순으로 관리합니다. 목록에는 본문이 표시되지 않습니다.
          </PageDescription>
        </PageHeading>
        <PrimaryLink href="/notice/new">공지 등록</PrimaryLink>
      </PageHead>

      <SearchBar role="search" onSubmit={handleSearch}>
        <SearchInput
          ref={searchInputRef}
          type="search"
          value={keyword}
          placeholder="제목으로 검색"
          aria-label="공지 제목 검색"
          onChange={(event) => setKeyword(event.target.value)}
        />
        <SecondaryButton type="submit">검색</SecondaryButton>
      </SearchBar>

      <NoticeTable aria-label="공지 목록">
        <thead>
          <tr>
            <th scope="col">제목</th>
            <th scope="col">작성자</th>
            <th scope="col">작성일시</th>
            <th scope="col">최종 수정</th>
            <th scope="col">
              <VisuallyHidden>관리</VisuallyHidden>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((notice) => (
            <tr key={notice.id}>
              <td title={notice.title}>{notice.title}</td>
              <td>{notice.author}</td>
              <td>{notice.createdAt}</td>
              <td>{notice.updatedAt ?? "—"}</td>
              <td>
                <RowActions>
                  <RowEditLink
                    href={`/notice/${notice.id}/edit`}
                    aria-label={`${notice.title} 수정`}
                  >
                    수정
                  </RowEditLink>
                  <RowDeleteButton
                    type="button"
                    aria-label={`${notice.title} 삭제`}
                    onClick={() => setDeleteTarget(notice)}
                  >
                    삭제
                  </RowDeleteButton>
                </RowActions>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <EmptyCell colSpan={5}>
                {query ? "검색 결과가 없습니다." : "등록된 공지가 없습니다."}
              </EmptyCell>
            </tr>
          )}
        </tbody>
      </NoticeTable>

      <Pager>
        <PagerTotal role="status">전체 {filtered.length}건</PagerTotal>
        <PageList aria-label="페이지">
          <SecondaryButton
            type="button"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            이전
          </SecondaryButton>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map(
            (pageNumber) => (
              <PageButton
                key={pageNumber}
                type="button"
                aria-label={`${pageNumber}페이지`}
                aria-current={pageNumber === currentPage ? "page" : undefined}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </PageButton>
            ),
          )}
          <SecondaryButton
            type="button"
            disabled={currentPage === pageCount}
            onClick={() => setPage(currentPage + 1)}
          >
            다음
          </SecondaryButton>
        </PageList>
      </Pager>

      {deleteTarget && (
        <DeleteNoticeModal
          title={deleteTarget.title}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            setNotices((prev) =>
              prev.filter((notice) => notice.id !== deleteTarget.id),
            );
            // 지운 행의 삭제 버튼이 사라져 포커스가 갈 곳이 없으므로 검색창으로 옮김
            searchInputRef.current?.focus();
          }}
        />
      )}
    </NoticePage>
  );
}
