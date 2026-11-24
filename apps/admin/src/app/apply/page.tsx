"use client";

import { useState, type FormEvent } from "react";
import { APPLICATIONS, canReview } from "./apply-content";
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
  StatusText,
  TierText,
  Total,
} from "./page-style";

const PAGE_SIZE = 5;

export default function ApplyListPage() {
  const [keyword, setKeyword] = useState("");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [kindFilter, setKindFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [query, setQuery] = useState({
    keyword: "",
    field: "all",
    kind: "all",
    status: "all",
    tier: "all",
  });
  const [page, setPage] = useState(1);

  const filtered = APPLICATIONS.filter(
    (application) =>
      (!query.keyword ||
        application.applicant.includes(query.keyword) ||
        application.project.includes(query.keyword)) &&
      (query.field === "all" || application.field === query.field) &&
      // 구분은 "첫 신청 (키 발급)"처럼 뒤에 설명이 붙어 앞부분만 비교
      (query.kind === "all" || application.kind.startsWith(query.kind)) &&
      (query.status === "all" || application.status === query.status) &&
      (query.tier === "all" || application.tier === query.tier),
  );
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
      field: fieldFilter,
      kind: kindFilter,
      status: statusFilter,
      tier: tierFilter,
    });
    setPage(1);
  };

  return (
    <ApplyPage>
      <PageHead>
        <PageTitle>활용신청 내역</PageTitle>
        <PageDescription>
          교내 분야는 신청하면 자동 승인되고, 제한 분야(학생 · 교직원 · 자습
          감독처럼 개인정보가 들어간 데이터)는 관리자가 사용 목적을 보고
          승인하거나 반려합니다. API 키는 프로젝트마다 하나이며, 프로젝트의 첫
          승인 때 발급됩니다.
        </PageDescription>
      </PageHead>

      <FilterBar role="search" onSubmit={handleSearch}>
        <SearchInput
          type="search"
          value={keyword}
          placeholder="신청자 또는 프로젝트명으로 검색"
          aria-label="신청자 또는 프로젝트명 검색"
          onChange={(event) => setKeyword(event.target.value)}
        />
        <FilterSelect
          aria-label="분야 필터"
          value={fieldFilter}
          onChange={(event) => setFieldFilter(event.target.value)}
        >
          <option value="all">분야 전체</option>
          <option value="학생">학생</option>
          <option value="교직원">교직원</option>
          <option value="자습 감독">자습 감독</option>
          <option value="일정">일정</option>
          <option value="동아리">동아리</option>
        </FilterSelect>
        <FilterSelect
          aria-label="구분 필터"
          value={kindFilter}
          onChange={(event) => setKindFilter(event.target.value)}
        >
          <option value="all">구분 전체</option>
          <option value="첫 신청">첫 신청 (키 발급)</option>
          <option value="분야 추가">분야 추가</option>
        </FilterSelect>
        <FilterSelect
          aria-label="상태 필터"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">상태 전체</option>
          <option value="승인 대기">승인 대기</option>
          <option value="승인 완료">승인 완료</option>
          <option value="반려">반려</option>
        </FilterSelect>
        <FilterSelect
          aria-label="단계 필터"
          value={tierFilter}
          onChange={(event) => setTierFilter(event.target.value)}
        >
          <option value="all">단계 전체</option>
          <option value="제한">제한</option>
          <option value="교내">교내</option>
        </FilterSelect>
        <SearchButton type="submit">검색</SearchButton>
      </FilterBar>

      <ApplicationTable aria-label="활용신청 목록">
        <thead>
          <tr>
            <th scope="col">프로젝트 · 분야</th>
            <th scope="col">단계</th>
            <th scope="col">상태</th>
            <th scope="col">신청자</th>
            <th scope="col">신청일시</th>
            <th scope="col">구분</th>
            <th scope="col">상세</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((application) => (
            <tr key={application.id}>
              <td title={`${application.project} · ${application.field}`}>
                {application.project} · {application.field}
              </td>
              <td>
                <TierText $tier={application.tier}>{application.tier}</TierText>
              </td>
              <td>
                <StatusText $status={application.status}>
                  {application.status}
                </StatusText>
              </td>
              <td>{application.applicant}</td>
              <td>{application.appliedAt}</td>
              <td>{application.kind}</td>
              <td>
                <DetailLink href={`/apply/${application.id}`}>
                  {canReview(application) ? "검토하기" : "상세"}
                </DetailLink>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <EmptyCell colSpan={7}>검색 결과가 없습니다.</EmptyCell>
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
