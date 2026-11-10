"use client";

import { useId, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import {
  SCHEDULE_BASE_MONTH,
  SCHEDULE_BASE_YEAR,
  SCHEDULES,
  SUPERVISIONS,
  type Schedule,
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

const YEARS = [
  SCHEDULE_BASE_YEAR - 1,
  SCHEDULE_BASE_YEAR,
  SCHEDULE_BASE_YEAR + 1,
];
const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

interface Filter {
  year: number;
  month: number;
}

const INITIAL_FILTER: Filter = {
  year: SCHEDULE_BASE_YEAR,
  month: SCHEDULE_BASE_MONTH,
};

const toMonthPrefix = ({ year, month }: Filter) =>
  `${year}-${String(month).padStart(2, "0")}`;

export default function ScheduleListPage() {
  const id = useId();
  // API 연동 전이라 삭제는 화면의 더미 목록에서만 빠짐
  const [schedules, setSchedules] = useState(SCHEDULES);
  // 고르는 중인 값과 조회 버튼을 눌러 적용된 값을 따로 둠
  const [draft, setDraft] = useState(INITIAL_FILTER);
  const [filter, setFilter] = useState(INITIAL_FILTER);
  const [deleteTarget, setDeleteTarget] = useState<Schedule | null>(null);
  const yearSelectRef = useRef<HTMLSelectElement>(null);

  // 다른 페이지로 이동해도 화면이 숨겨진 채 상태가 남으므로,
  // 열려 있던 삭제 모달이 돌아왔을 때 배경 없이 남지 않도록 숨겨질 때 닫음
  useLayoutEffect(() => {
    return () => setDeleteTarget(null);
  }, []);

  const monthPrefix = toMonthPrefix(filter);
  const scheduleRows = schedules
    .filter((schedule) => schedule.date.startsWith(monthPrefix))
    .sort((a, b) => a.date.localeCompare(b.date));
  const supervisionRows = SUPERVISIONS.filter((supervision) =>
    supervision.date.startsWith(monthPrefix),
  );

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFilter(draft);
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
            value={draft.year}
            onChange={(event) =>
              setDraft({ ...draft, year: Number(event.target.value) })
            }
          >
            {YEARS.map((year) => (
              <option key={year} value={year}>
                {year}년
              </option>
            ))}
          </Select>
        </SelectBox>
        <SelectBox width={120}>
          <Select
            aria-label="월"
            value={draft.month}
            onChange={(event) =>
              setDraft({ ...draft, month: Number(event.target.value) })
            }
          >
            {MONTHS.map((month) => (
              <option key={month} value={month}>
                {month}월
              </option>
            ))}
          </Select>
        </SelectBox>
        <SecondaryButton type="submit">조회</SecondaryButton>
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
              {scheduleRows.map((schedule) => (
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
              {scheduleRows.length === 0 && (
                <tr>
                  <EmptyCell colSpan={4}>
                    {filter.month}월에 등록된 학사 일정이 없습니다.
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
              {supervisionRows.map((supervision) => (
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
              {supervisionRows.length === 0 && (
                <tr>
                  <EmptyCell colSpan={4}>
                    {filter.month}월에 배정된 자습 감독이 없습니다.
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
          title={deleteTarget.title}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            setSchedules((prev) =>
              prev.filter((schedule) => schedule.id !== deleteTarget.id),
            );
            // 지운 행의 삭제 버튼이 사라져 포커스가 갈 곳이 없으므로 조회 조건으로 옮김
            yearSelectRef.current?.focus();
          }}
        />
      )}
    </SchedulePage>
  );
}
