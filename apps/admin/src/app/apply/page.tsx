"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { errorMessage, isAbortError } from "../notice-content";
import {
  FIELD_LABELS,
  TYPE_LABELS,
  fetchApplications,
  tierOf,
  type ApplicationField,
  type ApplicationPage,
} from "./apply-content";
import {
  ApplicationTable,
  ApplyPage,
  CellStatus,
  DetailLink,
  EmptyCell,
  FilterBar,
  FilterNote,
  FilterSelect,
  PageButton,
  PageDescription,
  PageHead,
  PageList,
  PageTitle,
  Pager,
  PendingValue,
  RetryButton,
  SearchButton,
  SearchInput,
  TierText,
  Total,
} from "./page-style";

export default function ApplyListPage() {
  const router = useRouter();
  const [fieldFilter, setFieldFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  // 서버 page는 0부터. 화면에는 1부터 보여 줌
  const [page, setPage] = useState(0);
  // 바뀌면 목록을 다시 불러옴 (다시 시도)
  const [reloadKey, setReloadKey] = useState(0);
  // 어떤 조건으로 받은 목록인지 key로 구분해, 조건이 바뀐 직후에 이전 목록이 보이지 않게 함
  const [loaded, setLoaded] = useState<{
    key: string;
    data: ApplicationPage;
  } | null>(null);
  const [loadError, setLoadError] = useState<{
    key: string;
    message: string;
  } | null>(null);

  const key = `${fieldFilter}|${typeFilter}|${page}|${reloadKey}`;

  // 다른 화면에서 돌아와 다시 보일 때도 effect가 다시 돌아 최신 목록을 받음
  useEffect(() => {
    // 로그인 여부는 저장소를 읽어야 해서 렌더 중이 아니라 effect에서 확인
    if (!api.auth.isLoggedIn()) {
      router.replace("/login");
      return;
    }
    const request = new AbortController();
    fetchApplications(
      { field: fieldFilter, type: typeFilter, page },
      request.signal,
    )
      .then((data) => {
        setLoaded({ key, data });
        // 다시 불러왔더니 목록이 줄어 지금 페이지가 없어졌으면 마지막 페이지로 옮김
        if (data.totalPage > 0 && page >= data.totalPage) {
          setPage(data.totalPage - 1);
        }
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (isAbortError(error) || request.signal.aborted) return;
        setLoadError({
          key,
          message: errorMessage(error, "활용신청 목록을 불러오지 못했습니다."),
        });
      });
    return () => request.abort();
  }, [router, key, fieldFilter, typeFilter, page]);

  const current = loaded?.key === key ? loaded.data : null;
  const rows = current?.applications ?? [];
  const errorHere = loadError?.key === key ? loadError.message : "";
  // 페이지를 바꿔 불러오는 동안에도 페이저가 깜빡이지 않도록 마지막으로 받은 값을 씀
  const pageCount = Math.max(1, loaded?.data.totalPage ?? 1);
  const currentPage = Math.min(page, pageCount - 1);

  const retry = () => {
    setLoadError(null);
    setReloadKey((value) => value + 1);
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

      <FilterBar role="search">
        <SearchInput
          type="search"
          placeholder="신청자 또는 프로젝트명으로 검색"
          aria-label="신청자 또는 프로젝트명 검색"
          aria-describedby="filter-pending-note"
          disabled
        />
        <FilterSelect
          aria-label="분야 필터"
          value={fieldFilter}
          onChange={(event) => {
            setFieldFilter(event.target.value);
            setPage(0);
          }}
        >
          <option value="">분야 전체</option>
          {(Object.keys(FIELD_LABELS) as ApplicationField[]).map((field) => (
            <option key={field} value={field}>
              {FIELD_LABELS[field]}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          aria-label="구분 필터"
          value={typeFilter}
          onChange={(event) => {
            setTypeFilter(event.target.value);
            setPage(0);
          }}
        >
          <option value="">구분 전체</option>
          <option value="FIRST">{TYPE_LABELS.FIRST}</option>
          <option value="ADD_FIELD">{TYPE_LABELS.ADD_FIELD}</option>
        </FilterSelect>
        {/* 서버에 상태 · 단계 · 검색 조건이 아직 없어서 쓸 수 없음.
            단계는 분야로 정해지는 값이고 서버는 분야 하나만 받으므로 화면에서 거르지 않음 */}
        <FilterSelect
          aria-label="상태 필터"
          aria-describedby="filter-pending-note"
          title="서버 연동 준비 중"
          disabled
        >
          <option>상태 전체</option>
        </FilterSelect>
        <FilterSelect
          aria-label="단계 필터"
          aria-describedby="filter-pending-note"
          title="서버 연동 준비 중"
          disabled
        >
          <option>단계 전체</option>
        </FilterSelect>
        <SearchButton
          type="button"
          aria-describedby="filter-pending-note"
          title="서버 연동 준비 중"
          disabled
        >
          검색
        </SearchButton>
      </FilterBar>
      <FilterNote id="filter-pending-note">
        검색과 상태 · 단계 필터는 서버 API가 준비되면 사용할 수 있습니다.
      </FilterNote>

      {/* 목록이 이미 보이는데 다시 불러오기가 실패하면 빈 행 자리가 없으므로 표 위에 알림 */}
      {errorHere && rows.length > 0 && (
        <CellStatus role="alert">
          {errorHere} 지금 보이는 목록은 최신이 아닐 수 있습니다.
          <RetryButton type="button" onClick={retry}>
            다시 시도
          </RetryButton>
        </CellStatus>
      )}

      <ApplicationTable aria-label="활용신청 목록">
        <thead>
          <tr>
            <th scope="col">서비스 · 분야</th>
            <th scope="col">단계</th>
            <th scope="col" title="서버 연동 준비 중">
              상태
            </th>
            <th scope="col" title="서버 연동 준비 중">
              신청자
            </th>
            <th scope="col">신청일시</th>
            <th scope="col">구분</th>
            <th scope="col">상세</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((application) => {
            const tier = tierOf(application.field);
            const title = `${application.serviceName} · ${FIELD_LABELS[application.field]}`;
            return (
              <tr key={application.id}>
                <td title={title}>{title}</td>
                <td>
                  <TierText $tier={tier}>{tier}</TierText>
                </td>
                <td>
                  <PendingValue title="서버 연동 준비 중">—</PendingValue>
                </td>
                <td>
                  <PendingValue title="서버 연동 준비 중">—</PendingValue>
                </td>
                <td>{application.appliedAt}</td>
                <td>{TYPE_LABELS[application.type]}</td>
                <td>
                  <DetailLink href={`/apply/${application.id}`}>
                    {/* 상태가 서버에 없어서 단계로 판단: 제한 분야는 관리자 검토 대상 */}
                    {tier === "제한" ? "검토하기" : "상세"}
                  </DetailLink>
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <EmptyCell colSpan={7}>
                {errorHere ? (
                  <CellStatus role="alert">
                    {errorHere}
                    <RetryButton type="button" onClick={retry}>
                      다시 시도
                    </RetryButton>
                  </CellStatus>
                ) : current === null ? (
                  "활용신청 목록을 불러오는 중입니다."
                ) : fieldFilter || typeFilter ? (
                  "검색 결과가 없습니다."
                ) : (
                  "활용신청 내역이 없습니다."
                )}
              </EmptyCell>
            </tr>
          )}
        </tbody>
      </ApplicationTable>

      <Pager>
        <Total role="status">
          {loaded ? `전체 ${loaded.data.totalCount}건` : ""}
        </Total>
        <PageList aria-label="페이지">
          <PageButton
            type="button"
            disabled={currentPage === 0}
            onClick={() => setPage(currentPage - 1)}
          >
            이전
          </PageButton>
          {Array.from({ length: pageCount }, (_, index) => index).map(
            (pageIndex) => (
              <PageButton
                key={pageIndex}
                type="button"
                aria-label={`${pageIndex + 1}페이지`}
                aria-current={pageIndex === currentPage ? "page" : undefined}
                onClick={() => setPage(pageIndex)}
              >
                {pageIndex + 1}
              </PageButton>
            ),
          )}
          <PageButton
            type="button"
            disabled={currentPage >= pageCount - 1}
            onClick={() => setPage(currentPage + 1)}
          >
            다음
          </PageButton>
        </PageList>
      </Pager>
    </ApplyPage>
  );
}
