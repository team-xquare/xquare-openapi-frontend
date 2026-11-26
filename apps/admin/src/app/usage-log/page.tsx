"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { isAbortError } from "../notice-content";
import {
  API_SEARCH_MAX_LENGTH,
  MAX_PAGE_INDEX,
  USAGE_FIELD_LABELS,
  createUsageLogRange,
  fetchUsageLogs,
  usageLogErrorMessage,
  type UsageLogPage,
  type UsageLogQuery,
} from "./usage-log-content";
import {
  AlertBar,
  CellStatus,
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

// 페이지 번호 버튼은 현재 페이지 앞뒤로 이만큼만 보여줌
const PAGE_BUTTON_RANGE = 2;

export default function UsageLogPage() {
  const router = useRouter();
  const [periodFilter, setPeriodFilter] = useState("1d");
  const [methodFilter, setMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [apiSearch, setApiSearch] = useState("");
  const [fieldFilter, setFieldFilter] = useState("all");
  // 검색 버튼을 눌러야 적용되는 조건 + 서버 페이지 (0부터)
  const [query, setQuery] = useState<UsageLogQuery>(() => ({
    ...createUsageLogRange("1d"),
    method: "all",
    status: "all",
    api: "",
    field: "all",
    page: 0,
  }));
  // 마지막으로 받아 온 결과와 그때의 조건. 조건(객체)이 바뀌면 새로 받을 때까지 불러오는 중
  const [loaded, setLoaded] = useState<{
    query: UsageLogQuery;
    data: UsageLogPage;
  } | null>(null);
  // 오류도 어느 조건에서 난 것인지 함께 둠
  const [loadError, setLoadError] = useState<{
    query: UsageLogQuery;
    message: string;
  } | null>(null);
  // 바뀌면 다시 불러옴 (다시 시도)
  const [reloadKey, setReloadKey] = useState(0);

  // 다른 화면에서 돌아와 다시 보일 때도 effect가 다시 돌아 받음 (조건은 그대로)
  useEffect(() => {
    // 로그인 여부는 저장소를 읽어야 해서 렌더 중이 아니라 effect에서 확인
    if (!api.auth.isLoggedIn()) {
      router.replace("/login");
      return;
    }
    const request = new AbortController();
    fetchUsageLogs(query, request.signal)
      .then((data) => {
        setLoaded({ query, data });
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (isAbortError(error) || request.signal.aborted) return;
        setLoadError({
          query,
          message: usageLogErrorMessage(error, "사용 기록을 불러오지 못했습니다."),
        });
      });
    return () => request.abort();
  }, [router, query, reloadKey]);

  // 지금 조건의 결과일 때만 표에 보여줌
  const isCurrent = loaded?.query === query;
  const rows = isCurrent ? loaded.data.logs : [];
  const errorText = loadError?.query === query ? loadError.message : "";
  // 페이지만 넘긴 경우(같은 검색)에는 마지막 건수·페이지 수를 유지해 버튼이 흔들리지 않게 함
  const sameSearch =
    loaded !== null &&
    loaded.query.from === query.from &&
    loaded.query.to === query.to &&
    loaded.query.method === query.method &&
    loaded.query.status === query.status &&
    loaded.query.api === query.api &&
    loaded.query.field === query.field;
  const data = sameSearch ? loaded.data : undefined;
  const currentPage = query.page;
  // 서버가 page를 1000까지만 받음
  const lastPage = Math.min(
    Math.max(0, (data?.totalPage ?? 1) - 1),
    MAX_PAGE_INDEX,
  );
  const firstButton = Math.max(0, currentPage - PAGE_BUTTON_RANGE);
  const lastButton = Math.min(lastPage, currentPage + PAGE_BUTTON_RANGE);

  const retry = () => {
    setLoadError(null);
    setReloadKey((key) => key + 1);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // 필터가 그대로여도 새 객체라 항상 새 기준 시각으로 다시 받음
    setQuery({
      ...createUsageLogRange(periodFilter),
      method: methodFilter,
      status: statusFilter,
      api: apiSearch.trim(),
      field: fieldFilter,
      page: 0,
    });
  };

  const goPage = (page: number) => setQuery((prev) => ({ ...prev, page }));

  return (
    <UsagePage>
      <PageHead>
        <PageTitle>사용 기록</PageTitle>
        <PageDescription>
          API를 호출할 때마다 남는 기록입니다. 호출 시각, 메서드, 경로, 응답 코드,
          응답 시간을 최신순으로 보고, API 경로와 분야로 찾을 수 있습니다.
        </PageDescription>
      </PageHead>

      <FilterBar role="search" onSubmit={handleSearch}>
        <SearchInput
          type="search"
          placeholder="API 경로로 검색 (예: /notices)"
          aria-label="API 경로 검색"
          maxLength={API_SEARCH_MAX_LENGTH}
          value={apiSearch}
          onChange={(event) => setApiSearch(event.target.value)}
        />
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
          aria-label="분야 필터"
          title="분야를 고르면 공개 급식처럼 분야가 없는 기록은 빠집니다"
          value={fieldFilter}
          onChange={(event) => setFieldFilter(event.target.value)}
        >
          <option value="all">분야 전체</option>
          {Object.entries(USAGE_FIELD_LABELS).map(([field, label]) => (
            <option key={field} value={field}>
              {label}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          aria-label="메서드 필터"
          value={methodFilter}
          onChange={(event) => setMethodFilter(event.target.value)}
        >
          <option value="all">메서드 전체</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
          <option value="HEAD">HEAD</option>
          <option value="OPTIONS">OPTIONS</option>
          <option value="OTHER">기타</option>
        </FilterSelect>
        <FilterSelect
          aria-label="응답 코드 필터"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">응답 코드 전체</option>
          {[200, 201, 400, 401, 403, 404, 429, 500].map((code) => (
            <option key={code} value={String(code)}>
              {code}
            </option>
          ))}
        </FilterSelect>
        <SearchButton type="submit">검색</SearchButton>
      </FilterBar>

      {/* 목록이 이미 보이는데 다시 불러오기가 실패하면 빈 행 자리가 없어 표 위에 알림 */}
      {errorText && rows.length > 0 && (
        <AlertBar role="alert">
          {errorText} 지금 보이는 목록은 최신이 아닐 수 있습니다.
          <SearchButton type="button" onClick={retry}>
            다시 시도
          </SearchButton>
        </AlertBar>
      )}

      <UsageTable aria-label="사용 기록 목록">
        <thead>
          <tr>
            <th scope="col">호출 시각</th>
            <th scope="col">메서드</th>
            <th scope="col">경로</th>
            <th scope="col">응답 코드</th>
            <th scope="col">응답 시간</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((log) => (
            <tr key={log.id}>
              <td>{log.calledAt}</td>
              <td>{log.method}</td>
              <td title={log.route}>{log.route}</td>
              <td>
                <Status ok={log.status < 400}>{log.status}</Status>
              </td>
              <td>{log.durationMs}ms</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <EmptyCell colSpan={5}>
                {errorText ? (
                  <CellStatus role="alert">
                    {errorText}
                    <SearchButton type="button" onClick={retry}>
                      다시 시도
                    </SearchButton>
                  </CellStatus>
                ) : isCurrent ? (
                  query.api ||
                  query.field !== "all" ||
                  query.method !== "all" ||
                  query.status !== "all" ? (
                    "조건에 맞는 사용 기록이 없습니다."
                  ) : (
                    "기간 안에 사용 기록이 없습니다."
                  )
                ) : (
                  "사용 기록을 불러오는 중입니다."
                )}
              </EmptyCell>
            </tr>
          )}
        </tbody>
      </UsageTable>

      <Pager>
        <Total role="status">
          {data ? `전체 ${data.totalCount}건` : "불러오는 중"}
        </Total>
        <PageList aria-label="페이지">
          <PageButton
            type="button"
            disabled={currentPage === 0}
            onClick={() => goPage(currentPage - 1)}
          >
            이전
          </PageButton>
          {Array.from(
            { length: lastButton - firstButton + 1 },
            (_, index) => firstButton + index,
          ).map((pageIndex) => (
            <PageButton
              key={pageIndex}
              type="button"
              aria-label={`${pageIndex + 1}페이지`}
              aria-current={pageIndex === currentPage ? "page" : undefined}
              onClick={() => goPage(pageIndex)}
            >
              {pageIndex + 1}
            </PageButton>
          ))}
          <PageButton
            type="button"
            disabled={currentPage >= lastPage}
            onClick={() => goPage(currentPage + 1)}
          >
            다음
          </PageButton>
        </PageList>
      </Pager>
    </UsagePage>
  );
}
