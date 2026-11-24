"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { CellStatus } from "@/components/request-status/request-status-style";
import { api } from "@/lib/api";
import { errorMessage, isAbortError } from "@/lib/api-error";
import { useToday } from "@/lib/use-today";
import {
  FLOORS,
  fetchMonthSupervisions,
  getWeekday,
  toMonthPrefix,
  type Supervision,
} from "../supervisor-content";
import {
  EmptyCell,
  NoticePage as SupervisionPage,
  PageDescription,
  PageHead,
  PageHeading,
  PageTitle,
  PrimaryLink,
  RowActions,
  RowDeleteButton,
  RowEditLink,
  SecondaryButton,
  VisuallyHidden,
} from "../notice/page-style";
import { DeleteSupervisionModal } from "./delete-supervision-modal";
import {
  ErrorText,
  FilterBar,
  FilterChoiceError,
  ListHint,
  Muted,
  Select,
  SelectBox,
  SupervisionTable,
} from "./page-style";
import { useTeacherChoices } from "./use-teacher-choices";

const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

interface Filter {
  year: number;
  month: number;
  // 교직원 id. 빈 문자열이면 전체
  teacher: string;
}

export default function SupervisorListPage() {
  const router = useRouter();
  // 미리 그릴 때와 첫 화면 연결 때는 null이라 그동안은 기간을 정하지 않음
  const today = useToday();
  const {
    teachers: teacherChoices,
    error: teacherError,
    retry: retryTeachers,
  } = useTeacherChoices();
  // 불러온 달(YYYY-MM)과 그 달 배정. 다른 달을 조회하면 새로 받을 때까지 불러오는 중으로 보임
  const [loaded, setLoaded] = useState<{
    month: string;
    supervisions: Supervision[];
  } | null>(null);
  const [loadError, setLoadError] = useState("");
  // 바뀌면 목록을 다시 불러옴 (조회 · 다시 시도 · 삭제 후)
  const [reloadKey, setReloadKey] = useState(0);
  // 조회 조건에서 고른 연 · 월. 고르기 전(null)에는 이번 달
  const [year, setYear] = useState<number | null>(null);
  const [month, setMonth] = useState<number | null>(null);
  const [teacher, setTeacher] = useState("");
  // 조회한 조건. 조회하기 전(null)에는 이번 달 전체
  const [filter, setFilter] = useState<Filter | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Supervision | null>(null);
  const yearSelectRef = useRef<HTMLSelectElement>(null);

  const currentYear = today ? Number(today.slice(0, 4)) : null;
  const currentMonth = today ? Number(today.slice(5, 7)) : null;
  const pickedYear = year ?? currentYear;
  const pickedMonth = month ?? currentMonth;
  const years =
    currentYear === null ? [] : [currentYear - 1, currentYear, currentYear + 1];
  const applied: Filter | null =
    filter ??
    (currentYear !== null && currentMonth !== null
      ? { year: currentYear, month: currentMonth, teacher: "" }
      : null);
  // 불러올 달. 오늘 날짜를 읽기 전에는 null
  const period = applied ? toMonthPrefix(applied.year, applied.month) : null;

  // 다른 화면에서 돌아와 다시 보일 때도 effect가 다시 돌아 최신 목록을 받음
  useEffect(() => {
    // 로그인 여부는 저장소를 읽어야 해서 렌더 중이 아니라 effect에서 확인
    if (!api.auth.isLoggedIn()) {
      router.replace("/login");
      return;
    }
    if (period === null) return;
    const request = new AbortController();
    fetchMonthSupervisions(period, request.signal)
      .then((supervisions) => {
        setLoaded({ month: period, supervisions });
        setLoadError("");
      })
      .catch((error: unknown) => {
        if (isAbortError(error) || request.signal.aborted) return;
        setLoadError(
          errorMessage(error, "자습감독 배정 목록을 불러오지 못했습니다."),
        );
      });
    return () => request.abort();
  }, [router, period, reloadKey]);

  // 다른 페이지로 이동해도 화면이 숨겨진 채 상태가 남으므로,
  // 열려 있던 삭제 모달이 돌아왔을 때 배경 없이 남지 않도록 숨겨질 때 닫음
  useLayoutEffect(() => {
    return () => setDeleteTarget(null);
  }, []);

  // 아직 조회한 달을 받지 못했으면 null
  const supervisions =
    loaded && loaded.month === period ? loaded.supervisions : null;
  const teacherFilter = applied?.teacher ?? "";
  const rows = (supervisions ?? []).filter(
    (supervision) =>
      !teacherFilter ||
      FLOORS.some(
        (floor) => String(supervision.teachers[floor]?.id) === teacherFilter,
      ),
  );

  // 조건을 바꾼 뒤 조회 버튼(또는 Enter)을 눌렀을 때 거르고, 같은 달이어도 다시 받음
  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pickedYear === null || pickedMonth === null) return;
    setFilter({ year: pickedYear, month: pickedMonth, teacher });
    setLoadError("");
    setReloadKey((key) => key + 1);
  };

  return (
    <SupervisionPage>
      <PageHead>
        <PageHeading>
          <PageTitle>자습감독 관리</PageTitle>
          <PageDescription>
            날짜 한 건에 층별 감독 교직원을 함께 배정합니다.
          </PageDescription>
        </PageHeading>
        <PrimaryLink href="/supervisor/new">배정 등록</PrimaryLink>
      </PageHead>

      <FilterBar role="search" aria-label="자습감독 배정 조회" onSubmit={handleSearch}>
        <SelectBox width={140}>
          <Select
            ref={yearSelectRef}
            value={pickedYear ?? ""}
            aria-label="연도"
            onChange={(event) => setYear(Number(event.target.value))}
          >
            {years.map((option) => (
              <option key={option} value={option}>
                {option}년
              </option>
            ))}
          </Select>
        </SelectBox>
        <SelectBox width={120}>
          <Select
            value={pickedMonth ?? ""}
            aria-label="월"
            onChange={(event) => setMonth(Number(event.target.value))}
          >
            {MONTHS.map((option) => (
              <option key={option} value={option}>
                {option}월
              </option>
            ))}
          </Select>
        </SelectBox>
        <SelectBox width={220}>
          <Select
            value={teacher}
            aria-label="담당 선생님"
            data-empty={teacher === "" ? "" : undefined}
            onChange={(event) => setTeacher(event.target.value)}
          >
            <option value="">담당 선생님 전체</option>
            {(teacherChoices ?? []).map((option) => (
              <option key={option.id} value={String(option.id)}>
                {option.name}
              </option>
            ))}
          </Select>
        </SelectBox>
        <SecondaryButton type="submit">조회</SecondaryButton>
      </FilterBar>
      {/* 교직원 목록을 못 불러와도 연 · 월 조회와 목록은 그대로 쓸 수 있음 */}
      {teacherError && (
        <FilterChoiceError role="alert">
          <ErrorText>{teacherError}</ErrorText>
          <SecondaryButton type="button" onClick={retryTeachers}>
            다시 시도
          </SecondaryButton>
        </FilterChoiceError>
      )}
      <ListHint>
        한 날짜에 층별 배정을 묶어서 관리합니다. 배정하지 않은 층은 미배정으로
        저장되고, 여기서 등록한 내용이 일정 관리의 자습 감독에 그대로
        나타납니다.
      </ListHint>

      <SupervisionTable aria-label="자습감독 배정 목록">
        <thead>
          <tr>
            <th scope="col">날짜</th>
            <th scope="col">요일</th>
            {FLOORS.map((floor) => (
              <th key={floor} scope="col">
                {floor}층
              </th>
            ))}
            <th scope="col">
              <VisuallyHidden>관리</VisuallyHidden>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((supervision) => (
            <tr key={supervision.id}>
              <td>{supervision.date}</td>
              <td>{getWeekday(supervision.date)}</td>
              {FLOORS.map((floor) => (
                <td key={floor}>
                  {supervision.teachers[floor]?.name ?? <Muted>미배정</Muted>}
                </td>
              ))}
              <td>
                <RowActions>
                  <RowEditLink
                    href={`/supervisor/${supervision.date}/edit`}
                    aria-label={`${supervision.date} 자습감독 수정`}
                  >
                    수정
                  </RowEditLink>
                  <RowDeleteButton
                    type="button"
                    aria-label={`${supervision.date} 자습감독 삭제`}
                    onClick={() => setDeleteTarget(supervision)}
                  >
                    삭제
                  </RowDeleteButton>
                </RowActions>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <EmptyCell colSpan={6}>
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
                ) : supervisions === null ? (
                  "자습감독 배정 목록을 불러오는 중입니다."
                ) : teacherFilter ? (
                  "조건에 맞는 배정이 없습니다."
                ) : (
                  "이 달에 등록된 배정이 없습니다."
                )}
              </EmptyCell>
            </tr>
          )}
        </tbody>
      </SupervisionTable>

      {deleteTarget && (
        <DeleteSupervisionModal
          supervision={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => {
            // 지운 행은 바로 빼고, 그 사이 바뀐 내용까지 맞추도록 목록을 다시 받음
            setLoaded(
              (prev) =>
                prev && {
                  ...prev,
                  supervisions: prev.supervisions.filter(
                    (item) => item.id !== deleteTarget.id,
                  ),
                },
            );
            setReloadKey((key) => key + 1);
            // 지운 행의 삭제 버튼이 사라져 포커스가 갈 곳이 없으므로 조회 조건으로 옮김
            yearSelectRef.current?.focus();
          }}
        />
      )}
    </SupervisionPage>
  );
}
