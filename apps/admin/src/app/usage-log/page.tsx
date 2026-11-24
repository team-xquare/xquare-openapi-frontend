"use client";

import { useState, type FormEvent } from "react";
import { REFERENCE_TIME, USAGE_LOGS } from "./usage-log-content";
import {
  DetailButton,
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
  Status,
  Total,
  UsagePage,
  UsageTable,
} from "./page-style";

// API 연동은 backend 사용 기록 조회 API 이후 (OPN-109 연동 / OPN-106).
// 지금은 목업 데이터에 검색·필터·페이지 이동을 직접 걸어 두었고, API가 나오면 서버 조회로 바꿉니다.
// 활용신청 내역(apply/page.tsx)과 같은 방식입니다.
const PAGE_SIZE = 5;
const DAY = 24 * 60 * 60 * 1000;
const PERIOD_DAYS: Record<string, number> = { "1d": 1, "7d": 7, "30d": 30 };

// "2026-11-20 13:05:12" 형태를 시각(ms)으로 바꿉니다.
const toTime = (value: string) => new Date(value.replace(" ", "T")).getTime();

export default function UsageLogPage() {
  const [keyword, setKeyword] = useState("");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [codeFilter, setCodeFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("7d");
  const [stageFilter, setStageFilter] = useState("all");
  const [query, setQuery] = useState({
    keyword: "",
    field: "all",
    code: "all",
    period: "7d",
    stage: "all",
  });
  const [page, setPage] = useState(1);

  const since = toTime(REFERENCE_TIME) - PERIOD_DAYS[query.period] * DAY;
  const filtered = USAGE_LOGS.filter((log) => {
    const matchesKeyword =
      !query.keyword ||
      log.project.includes(query.keyword) ||
      log.applicant.includes(query.keyword) ||
      log.api.includes(query.keyword);
    const matchesField = query.field === "all" || log.field === query.field;
    // 응답 문자열 앞자리(2xx, 4xx, 5xx)로 묶습니다.
    const matchesCode =
      query.code === "all" || log.status.startsWith(query.code[0]);
    const matchesPeriod = toTime(log.calledAt) >= since;
    const matchesStage = query.stage === "all" || log.stage === query.stage;
    return (
      matchesKeyword &&
      matchesField &&
      matchesCode &&
      matchesPeriod &&
      matchesStage
    );
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
      field: fieldFilter,
      code: codeFilter,
      period: periodFilter,
      stage: stageFilter,
    });
    setPage(1);
  };

  return (
    <UsagePage>
      <PageHead>
        <PageTitle>사용 기록</PageTitle>
        <PageDescription>
          API를 호출할 때마다 기록이 남습니다. 어느 프로젝트의 키로 어떤 API를
          언제 불렀고 응답이 어땠는지 볼 수 있습니다. 키가 새거나 이상한 호출이
          보이면 신청자에게 재발급을 안내하세요.
        </PageDescription>
      </PageHead>

      <FilterBar role="search" onSubmit={handleSearch}>
        <SearchInput
          type="search"
          value={keyword}
          placeholder="프로젝트, 신청자 또는 API로 검색"
          aria-label="프로젝트, 신청자 또는 API 검색"
          onChange={(event) => setKeyword(event.target.value)}
        />
        <FilterSelect
          aria-label="분야 필터"
          value={fieldFilter}
          onChange={(event) => setFieldFilter(event.target.value)}
        >
          <option value="all">분야 전체</option>
          <option value="학생">학생</option>
          <option value="급식">급식</option>
          <option value="일정">일정</option>
          <option value="동아리">동아리</option>
          <option value="자습 감독">자습 감독</option>
        </FilterSelect>
        <FilterSelect
          aria-label="응답 코드 필터"
          value={codeFilter}
          onChange={(event) => setCodeFilter(event.target.value)}
        >
          <option value="all">응답 코드 전체</option>
          <option value="2xx">200번대</option>
          <option value="4xx">400번대</option>
          <option value="5xx">500번대</option>
        </FilterSelect>
        <FilterSelect
          aria-label="기간 필터"
          value={periodFilter}
          onChange={(event) => setPeriodFilter(event.target.value)}
        >
          <option value="1d">최근 1일</option>
          <option value="7d">최근 7일</option>
          <option value="30d">최근 30일</option>
        </FilterSelect>
        <FilterSelect
          aria-label="단계 필터"
          value={stageFilter}
          onChange={(event) => setStageFilter(event.target.value)}
        >
          <option value="all">단계 전체</option>
          <option value="test">테스트</option>
          <option value="prod">운영</option>
        </FilterSelect>
        <SearchButton type="submit">검색</SearchButton>
      </FilterBar>

      <UsageTable aria-label="사용 기록 목록">
        <thead>
          <tr>
            <th scope="col">호출한 API</th>
            <th scope="col">분야</th>
            <th scope="col">응답</th>
            <th scope="col">신청자</th>
            <th scope="col">호출 시각</th>
            <th scope="col">프로젝트 · 키</th>
            <th scope="col">상세</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((log) => (
            <tr key={log.id}>
              <td title={log.api}>{log.api}</td>
              <td>{log.field}</td>
              <td title={log.status}>
                {/* 긴 오류 코드가 단어 중간이 아니라 _ 뒤에서 줄이 바뀌도록 폭 없는 공백을 넣음 */}
                <Status ok={log.ok}>{log.status.replaceAll("_", "_​")}</Status>
              </td>
              <td>{log.applicant}</td>
              <td>{log.calledAt}</td>
              <td title={log.project}>{log.project}</td>
              <td>
                {/* 상세 화면이 아직 없어 누를 수 없게 막아 둡니다. */}
                <DetailButton
                  type="button"
                  disabled
                  aria-label="상세"
                  title="준비 중입니다"
                >
                  상세
                </DetailButton>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <EmptyCell colSpan={7}>검색 결과가 없습니다.</EmptyCell>
            </tr>
          )}
        </tbody>
      </UsageTable>

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
    </UsagePage>
  );
}
