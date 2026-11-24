"use client";

import { useState, type FormEvent } from "react";
import { TOTAL_COUNT, USAGE_LOGS } from "./usage-log-content";
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
// 지금은 퍼블리싱만 하므로 필터와 페이지 이동은 화면 모양만 잡고 목업을 그대로 보여 줍니다.
export default function UsageLogPage() {
  const [keyword, setKeyword] = useState("");

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <UsagePage>
      <PageHead>
        <PageTitle>사용 기록</PageTitle>
        <PageDescription>
          API를 호출할 때마다 기록이 남습니다. 어느 프로젝트의 키로 어떤 API를 언제
          불렀고 응답이 어땠는지 볼 수 있습니다. 키가 새거나 이상한 호출이 보이면
          신청자에게 재발급을 안내하세요.
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
        <FilterSelect aria-label="분야 필터" defaultValue="all">
          <option value="all">분야 전체</option>
          <option value="학생">학생</option>
          <option value="급식">급식</option>
          <option value="일정">일정</option>
          <option value="동아리">동아리</option>
          <option value="자습 감독">자습 감독</option>
        </FilterSelect>
        <FilterSelect aria-label="응답 코드 필터" defaultValue="all">
          <option value="all">응답 코드 전체</option>
          <option value="2xx">200번대</option>
          <option value="4xx">400번대</option>
          <option value="5xx">500번대</option>
        </FilterSelect>
        <FilterSelect aria-label="기간 필터" defaultValue="7d">
          <option value="7d">최근 7일</option>
          <option value="1d">최근 1일</option>
          <option value="30d">최근 30일</option>
        </FilterSelect>
        <FilterSelect aria-label="단계 필터" defaultValue="all">
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
            <th scope="col" aria-label="상세" />
          </tr>
        </thead>
        <tbody>
          {USAGE_LOGS.map((log) => (
            <tr key={log.id}>
              <td title={log.api}>{log.api}</td>
              <td>{log.field}</td>
              <td>
                <Status ok={log.ok}>{log.status}</Status>
              </td>
              <td>{log.applicant}</td>
              <td>{log.calledAt}</td>
              <td title={log.project}>{log.project}</td>
              <td>
                <DetailButton type="button">상세</DetailButton>
              </td>
            </tr>
          ))}
          {USAGE_LOGS.length === 0 && (
            <tr>
              <EmptyCell colSpan={7}>사용 기록이 없습니다.</EmptyCell>
            </tr>
          )}
        </tbody>
      </UsageTable>

      <Pager>
        <Total role="status">전체 {TOTAL_COUNT}건</Total>
        <PageList aria-label="페이지">
          <PageButton type="button" disabled>
            이전
          </PageButton>
          <PageButton type="button" aria-label="1페이지" aria-current="page">
            1
          </PageButton>
          <PageButton type="button" aria-label="2페이지">
            2
          </PageButton>
          <PageButton type="button" aria-label="3페이지">
            3
          </PageButton>
          <PageButton type="button">다음</PageButton>
        </PageList>
      </Pager>
    </UsagePage>
  );
}
