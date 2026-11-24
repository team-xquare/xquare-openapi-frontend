"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { CellStatus } from "@/components/request-status/request-status-style";
import { api } from "@/lib/api";
import { errorMessage, isAbortError } from "@/lib/api-error";
import { fetchSchedules } from "@/lib/schedules-api";
import { fetchSupervisions } from "@/lib/study-supervisors-api";
import { useToday } from "@/lib/use-today";
import {
  getMonthRange,
  isSchoolSchedule,
  monthOf,
  toMonthKey,
  toSchedule,
  toSupervisions,
  type Month,
  type Schedule,
  type Supervision,
} from "../schedule-content";
import {
  EmptyCell,
  NoticePage as SchedulePage,
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
import { DeleteScheduleModal } from "./delete-schedule-modal";
import {
  Card,
  CardHead,
  CardHeading,
  CardList,
  CardMeta,
  CardTitle,
  FilterBar,
  FilterHint,
  ScheduleTable,
  Select,
  SelectBox,
  SmallLink,
  SupervisionTable,
  Unassigned,
} from "./page-style";
import { TimetableCard } from "./timetable-card";

const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

// 불러온 달과 함께 둬서, 달을 바꾼 직후 이전 달 목록이 잠깐 보이지 않게 함
interface Loaded<T> {
  monthKey: string;
  items: T;
}

interface LoadError {
  monthKey: string;
  message: string;
}

export default function ScheduleListPage() {
  const id = useId();
  const router = useRouter();
  const today = useToday();
  // 조회 버튼을 눌러 고른 달. 고르기 전에는 오늘이 있는 달을 보여 줌
  const [picked, setPicked] = useState<Month | null>(null);
  // 고르는 중인 값. 조회 버튼을 눌러야 적용됨
  const [draft, setDraft] = useState<Month | null>(null);
  const [schedules, setSchedules] = useState<Loaded<Schedule[]> | null>(null);
  const [scheduleError, setScheduleError] = useState<LoadError | null>(null);
  const [supervisions, setSupervisions] = useState<Loaded<
    Supervision[]
  > | null>(null);
  const [supervisionError, setSupervisionError] = useState<LoadError | null>(
    null,
  );
  // 바뀌면 그 표를 다시 불러옴 (다시 시도 · 삭제 후)
  const [scheduleReloadKey, setScheduleReloadKey] = useState(0);
  const [supervisionReloadKey, setSupervisionReloadKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Schedule | null>(null);
  const yearSelectRef = useRef<HTMLSelectElement>(null);

  // 오늘은 브라우저에서만 알 수 있어서 미리 그릴 때는 조회할 달이 없음
  const filter = picked ?? (today ? monthOf(today) : null);
  const shown = draft ?? filter;
  const monthKey = filter ? toMonthKey(filter) : null;
  const years = filter ? [filter.year - 1, filter.year, filter.year + 1] : [];

  // 다른 화면에서 돌아와 다시 보일 때도 effect가 다시 돌아 최신 목록을 받음
  useEffect(() => {
    if (!monthKey) return;
    // 로그인 여부는 저장소를 읽어야 해서 렌더 중이 아니라 effect에서 확인
    if (!api.auth.isLoggedIn()) {
      router.replace("/login");
      return;
    }
    const request = new AbortController();
    fetchSchedules(getMonthRange(monthOf(monthKey)), request.signal)
      .then((list) => {
        setSchedules({
          monthKey,
          items: list
            .filter(isSchoolSchedule)
            .map(toSchedule)
            .sort((a, b) => a.date.localeCompare(b.date)),
        });
        setScheduleError(null);
      })
      .catch((error: unknown) => {
        if (isAbortError(error) || request.signal.aborted) return;
        setScheduleError({
          monthKey,
          message: errorMessage(error, "학사 일정을 불러오지 못했습니다."),
        });
      });
    return () => request.abort();
  }, [monthKey, router, scheduleReloadKey]);

  useEffect(() => {
    // 로그인하지 않았으면 위 effect가 로그인 화면으로 보냄
    if (!monthKey || !api.auth.isLoggedIn()) return;
    const request = new AbortController();
    fetchSupervisions(getMonthRange(monthOf(monthKey)), request.signal)
      .then((response) => {
        setSupervisions({
          monthKey,
          items: toSupervisions(response.supervisions),
        });
        setSupervisionError(null);
      })
      .catch((error: unknown) => {
        if (isAbortError(error) || request.signal.aborted) return;
        setSupervisionError({
          monthKey,
          message: errorMessage(error, "자습 감독을 불러오지 못했습니다."),
        });
      });
    return () => request.abort();
  }, [monthKey, supervisionReloadKey]);

  // 다른 페이지로 이동해도 화면이 숨겨진 채 상태가 남으므로,
  // 열려 있던 삭제 모달이 돌아왔을 때 배경 없이 남지 않도록 숨겨질 때 닫음
  useLayoutEffect(() => {
    return () => setDeleteTarget(null);
  }, []);

  // 지금 고른 달의 결과만 씀
  const scheduleRows =
    schedules?.monthKey === monthKey ? schedules.items : null;
  const scheduleLoadError =
    scheduleError?.monthKey === monthKey ? scheduleError.message : "";
  const supervisionRows =
    supervisions?.monthKey === monthKey ? supervisions.items : null;
  const supervisionLoadError =
    supervisionError?.monthKey === monthKey ? supervisionError.message : "";

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (shown) setPicked(shown);
  };

  return (
    <SchedulePage>
      <PageHead>
        <PageHeading>
          <PageTitle>일정 관리</PageTitle>
          <PageDescription>
            학사 일정을 관리하고, 자습 감독과 시간표는 여기서 함께 확인합니다.
          </PageDescription>
        </PageHeading>
        <PrimaryLink href="/schedule/new">학사 일정 등록</PrimaryLink>
      </PageHead>

      <FilterBar
        role="search"
        aria-label="일정 조회 조건"
        onSubmit={handleSearch}
      >
        <SelectBox width={140}>
          <Select
            ref={yearSelectRef}
            aria-label="연도"
            value={shown?.year ?? ""}
            disabled={!shown}
            onChange={(event) =>
              shown && setDraft({ ...shown, year: Number(event.target.value) })
            }
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}년
              </option>
            ))}
          </Select>
        </SelectBox>
        <SelectBox width={120}>
          <Select
            aria-label="월"
            value={shown?.month ?? ""}
            disabled={!shown}
            onChange={(event) =>
              shown && setDraft({ ...shown, month: Number(event.target.value) })
            }
          >
            {MONTHS.map((month) => (
              <option key={month} value={month}>
                {month}월
              </option>
            ))}
          </Select>
        </SelectBox>
        <SecondaryButton type="submit" disabled={!shown}>
          조회
        </SecondaryButton>
      </FilterBar>

      <FilterHint>등록한 일정은 이 화면에서 수정·삭제할 수 있습니다.</FilterHint>

      <CardList>
        <Card aria-labelledby={`${id}-schedule`}>
          <CardHead>
            <CardHeading>
              <CardTitle id={`${id}-schedule`}>학사 일정</CardTitle>
              <CardMeta>학교 입력</CardMeta>
            </CardHeading>
          </CardHead>

          <ScheduleTable aria-labelledby={`${id}-schedule`}>
            <thead>
              <tr>
                <th scope="col">날짜</th>
                <th scope="col">제목</th>
                <th scope="col">설명</th>
                <th scope="col">
                  <VisuallyHidden>관리</VisuallyHidden>
                </th>
              </tr>
            </thead>
            <tbody>
              {scheduleRows?.map((schedule) => (
                <tr key={schedule.id}>
                  <td>{schedule.date}</td>
                  <td title={schedule.title}>{schedule.title}</td>
                  <td title={schedule.description}>{schedule.description}</td>
                  <td>
                    <RowActions>
                      <RowEditLink
                        href={`/schedule/${schedule.id}/edit`}
                        aria-label={`${schedule.title} 수정`}
                      >
                        수정
                      </RowEditLink>
                      <RowDeleteButton
                        type="button"
                        aria-label={`${schedule.title} 삭제`}
                        onClick={() => setDeleteTarget(schedule)}
                      >
                        삭제
                      </RowDeleteButton>
                    </RowActions>
                  </td>
                </tr>
              ))}
              {(scheduleRows === null || scheduleRows.length === 0) && (
                <tr>
                  <EmptyCell colSpan={4}>
                    {scheduleLoadError ? (
                      <CellStatus role="alert">
                        {scheduleLoadError}
                        <SecondaryButton
                          type="button"
                          onClick={() => {
                            setScheduleError(null);
                            setScheduleReloadKey((key) => key + 1);
                          }}
                        >
                          다시 시도
                        </SecondaryButton>
                      </CellStatus>
                    ) : scheduleRows === null ? (
                      "학사 일정을 불러오는 중입니다."
                    ) : (
                      `${filter?.month}월에 등록된 학사 일정이 없습니다.`
                    )}
                  </EmptyCell>
                </tr>
              )}
            </tbody>
          </ScheduleTable>
        </Card>

        <Card aria-labelledby={`${id}-supervision`}>
          <CardHead>
            <CardHeading>
              <CardTitle id={`${id}-supervision`}>자습 감독</CardTitle>
              <CardMeta>학교 입력 · 읽기 전용</CardMeta>
            </CardHeading>
            <SmallLink href="/supervisor">자습감독에서 관리</SmallLink>
          </CardHead>

          <SupervisionTable aria-labelledby={`${id}-supervision`}>
            <thead>
              <tr>
                <th scope="col">날짜</th>
                <th scope="col">2층</th>
                <th scope="col">3층</th>
                <th scope="col">4층</th>
              </tr>
            </thead>
            <tbody>
              {supervisionRows?.map((supervision) => (
                <tr key={supervision.date}>
                  <td>{supervision.date}</td>
                  {[supervision.floor2, supervision.floor3, supervision.floor4].map(
                    (teacher, index) => (
                      <td key={index}>
                        {teacher ?? <Unassigned>미배정</Unassigned>}
                      </td>
                    ),
                  )}
                </tr>
              ))}
              {(supervisionRows === null || supervisionRows.length === 0) && (
                <tr>
                  <EmptyCell colSpan={4}>
                    {supervisionLoadError ? (
                      <CellStatus role="alert">
                        {supervisionLoadError}
                        <SecondaryButton
                          type="button"
                          onClick={() => {
                            setSupervisionError(null);
                            setSupervisionReloadKey((key) => key + 1);
                          }}
                        >
                          다시 시도
                        </SecondaryButton>
                      </CellStatus>
                    ) : supervisionRows === null ? (
                      "자습 감독을 불러오는 중입니다."
                    ) : (
                      `${filter?.month}월에 배정된 자습 감독이 없습니다.`
                    )}
                  </EmptyCell>
                </tr>
              )}
            </tbody>
          </SupervisionTable>
        </Card>

        <TimetableCard />
      </CardList>

      {deleteTarget && (
        <DeleteScheduleModal
          schedule={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => {
            // 지운 행은 바로 빼고, 그 사이 바뀐 내용까지 맞추도록 목록을 다시 받음
            setSchedules(
              (prev) =>
                prev && {
                  ...prev,
                  items: prev.items.filter(
                    (schedule) => schedule.id !== deleteTarget.id,
                  ),
                },
            );
            setScheduleReloadKey((key) => key + 1);
            // 지운 행의 삭제 버튼이 사라져 포커스가 갈 곳이 없으므로 조회 조건으로 옮김
            yearSelectRef.current?.focus();
          }}
        />
      )}
    </SchedulePage>
  );
}
