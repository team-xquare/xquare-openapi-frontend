"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  errorMessage,
  fetchAllNotices,
  isAbortError,
  type NoticeSummary,
} from "../notice-content";
import { DeleteNoticeModal } from "./delete-notice-modal";
import {
  CellStatus,
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
  const router = useRouter();
  // 처음 불러오기 전에는 null
  const [notices, setNotices] = useState<NoticeSummary[] | null>(null);
  const [loadError, setLoadError] = useState("");
  // 바뀌면 목록을 다시 불러옴 (다시 시도 · 삭제 후)
  const [reloadKey, setReloadKey] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<NoticeSummary | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 다른 화면에서 돌아와 다시 보일 때도 effect가 다시 돌아 최신 목록을 받음
  useEffect(() => {
    // 로그인 여부는 저장소를 읽어야 해서 렌더 중이 아니라 effect에서 확인
    if (!api.auth.isLoggedIn()) {
      router.replace("/login");
      return;
    }
    const request = new AbortController();
    fetchAllNotices(request.signal)
      .then((list) => {
        setNotices(list);
        setLoadError("");
      })
      .catch((error: unknown) => {
        if (isAbortError(error) || request.signal.aborted) return;
        setLoadError(errorMessage(error, "공지 목록을 불러오지 못했습니다."));
      });
    return () => request.abort();
  }, [router, reloadKey]);

  // 다른 페이지로 이동해도 화면이 숨겨진 채 상태가 남으므로,
  // 열려 있던 삭제 모달이 돌아왔을 때 배경 없이 남지 않도록 숨겨질 때 닫음
  useLayoutEffect(() => {
    return () => setDeleteTarget(null);
  }, []);

  const filtered = (notices ?? []).filter((notice) => notice.title.includes(query));
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

      {/* 목록이 이미 보이는데 다시 불러오기(삭제 뒤 · 다시 들어올 때)가 실패하면
          빈 행 자리가 없어 알 수 없으므로 표 위에 알림 */}
      {loadError && rows.length > 0 && (
        <CellStatus role="alert">
          {loadError} 지금 보이는 목록은 최신이 아닐 수 있습니다.
          <SecondaryButton
            type="button"
            onClick={() => {
              setLoadError("");
              setReloadKey((key) => key + 1);
            }}
          >
            다시 시도
          </SecondaryButton>
        </CellStatus>
      )}

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
                {loadError ? (
                  <CellStatus role="alert">
                    {loadError}
                    <SecondaryButton
                      type="button"
                      onClick={() => {
                        setLoadError("");
                        setReloadKey((key) => key + 1);
                      }}
                    >
                      다시 시도
                    </SecondaryButton>
                  </CellStatus>
                ) : notices === null ? (
                  "공지 목록을 불러오는 중입니다."
                ) : query ? (
                  "검색 결과가 없습니다."
                ) : (
                  "등록된 공지가 없습니다."
                )}
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
          notice={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => {
            // 지운 행은 바로 빼고, 그 사이 바뀐 내용까지 맞추도록 목록을 다시 받음
            setNotices((prev) =>
              prev && prev.filter((notice) => notice.id !== deleteTarget.id),
            );
            setReloadKey((key) => key + 1);
            // 지운 행의 삭제 버튼이 사라져 포커스가 갈 곳이 없으므로 검색창으로 옮김
            searchInputRef.current?.focus();
          }}
        />
      )}
    </NoticePage>
  );
}
