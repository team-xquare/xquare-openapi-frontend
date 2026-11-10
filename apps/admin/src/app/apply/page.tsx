"use client";

import { useState, type FormEvent } from "react";
import { APPLICATIONS } from "./apply-content";
import {
  ApplicationTable,
  ApplyPage,
  DetailLink,
  EmptyCell,
  FilterBar,
  FilterSelect,
  PageButton,
  PageDescription,
  PageHead,
  PageList,
  PageTitle,
  Pager,
  SearchButton,
  SearchInput,
  Total,
} from "./page-style";

const PAGE_SIZE = 5;

export default function ApplyListPage() {
  const [keyword, setKeyword] = useState("");
  const [apiFilter, setApiFilter] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");
  const [query, setQuery] = useState({
    keyword: "",
    api: "all",
    account: "all",
  });
  const [page, setPage] = useState(1);

  const filtered = APPLICATIONS.filter((application) => {
    const matchesKeyword =
      !query.keyword ||
      application.applicant.includes(query.keyword) ||
      application.serviceName.includes(query.keyword);
    const matchesApi =
      query.api === "all" || application.api.includes(query.api);
    const matchesAccount =
      query.account === "all" || application.accountType === query.account;
    return matchesKeyword && matchesApi && matchesAccount;
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuery({
      keyword: keyword.trim(),
      api: apiFilter,
      account: accountFilter,
    });
    setPage(1);
  };

  return (
    <ApplyPage>
      <PageHead>
        <PageTitle>활용신청 내역</PageTitle>
        <PageDescription>
          활용신청은 자동승인되어 바로 키가 발급됩니다. 여기서는 신청한 내용을
          확인합니다.
        </PageDescription>
      </PageHead>

      <FilterBar role="search" onSubmit={handleSearch}>
        <SearchInput
          type="search"
          value={keyword}
          placeholder="신청자 또는 서비스명으로 검색"
          aria-label="신청자 또는 서비스명 검색"
          onChange={(event) => setKeyword(event.target.value)}
        />
        <FilterSelect
          aria-label="API 필터"
          value={apiFilter}
          onChange={(event) => setApiFilter(event.target.value)}
        >
          <option value="all">API 전체</option>
          <option value="학생 정보">학생 정보</option>
          <option value="급식">급식</option>
          <option value="일정">일정</option>
          <option value="동아리">동아리</option>
          <option value="자습">자습</option>
        </FilterSelect>
        <FilterSelect
          aria-label="계정 유형 필터"
          value={accountFilter}
          onChange={(event) => setAccountFilter(event.target.value)}
        >
          <option value="all">계정 유형 전체</option>
          <option value="개발계정">개발계정</option>
          <option value="운영계정">운영계정</option>
        </FilterSelect>
        <SearchButton type="submit">검색</SearchButton>
      </FilterBar>

      <ApplicationTable aria-label="활용신청 목록">
        <thead>
          <tr>
            <th scope="col">서비스 · API</th>
            <th scope="col">신청자</th>
            <th scope="col">신청일시</th>
            <th scope="col">계정 유형</th>
            <th scope="col">상세</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((application) => (
            <tr key={application.id}>
              <td title={application.api}>{application.api}</td>
              <td>{application.applicant}</td>
              <td>{application.appliedAt}</td>
              <td>{application.accountType}</td>
              <td>
                <DetailLink href={`/apply/${application.id}`}>상세</DetailLink>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <EmptyCell colSpan={5}>검색 결과가 없습니다.</EmptyCell>
            </tr>
          )}
        </tbody>
      </ApplicationTable>

      <Pager>
        <Total role="status">전체 {filtered.length}건</Total>
        <PageList aria-label="페이지">
          <PageButton
            type="button"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            이전
          </PageButton>
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
          <PageButton
            type="button"
            disabled={currentPage === pageCount}
            onClick={() => setPage(currentPage + 1)}
          >
            다음
          </PageButton>
        </PageList>
      </Pager>
    </ApplyPage>
  );
}
