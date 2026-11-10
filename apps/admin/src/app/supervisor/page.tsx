"use client";

import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import {
  FLOORS,
  SUPERVISION_BASE_MONTH,
  SUPERVISION_BASE_YEAR,
  SUPERVISIONS,
  TEACHERS,
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
  FilterBar,
  ListHint,
  Muted,
  Select,
  SelectBox,
  SupervisionTable,
} from "./page-style";

const YEARS = [
  SUPERVISION_BASE_YEAR - 1,
  SUPERVISION_BASE_YEAR,
  SUPERVISION_BASE_YEAR + 1,
];
const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

const BASE_FILTER = {
  year: SUPERVISION_BASE_YEAR,
  month: SUPERVISION_BASE_MONTH,
  teacher: "",
};

export default function SupervisorListPage() {
  // API 연동 전이라 삭제는 화면의 더미 목록에서만 빠짐
  const [supervisions, setSupervisions] = useState(SUPERVISIONS);
  const [year, setYear] = useState(BASE_FILTER.year);
  const [month, setMonth] = useState(BASE_FILTER.month);
  const [teacher, setTeacher] = useState(BASE_FILTER.teacher);
  const [filter, setFilter] = useState(BASE_FILTER);
  const [deleteTarget, setDeleteTarget] = useState<Supervision | null>(null);
  const yearSelectRef = useRef<HTMLSelectElement>(null);

  // 다른 페이지로 이동해도 화면이 숨겨진 채 상태가 남으므로,
  // 열려 있던 삭제 모달이 돌아왔을 때 배경 없이 남지 않도록 숨겨질 때 닫음
  useLayoutEffect(() => {
    return () => setDeleteTarget(null);
  }, []);

  const monthPrefix = toMonthPrefix(filter.year, filter.month);
  const rows = supervisions
    .filter(
      (supervision) =>
        supervision.date.startsWith(monthPrefix) &&
        (!filter.teacher ||
          FLOORS.some((floor) => supervision.teachers[floor] === filter.teacher)),
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  // 조건을 바꾼 뒤 조회 버튼(또는 Enter)을 눌렀을 때 거름
  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFilter({ year, month, teacher });
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
            value={year}
            aria-label="연도"
            onChange={(event) => setYear(Number(event.target.value))}
          >
            {YEARS.map((option) => (
              <option key={option} value={option}>
                {option}년
              </option>
            ))}
          </Select>
        </SelectBox>
        <SelectBox width={120}>
          <Select
            value={month}
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
            {TEACHERS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </SelectBox>
        <SecondaryButton type="submit">조회</SecondaryButton>
      </FilterBar>
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
            <tr key={supervision.date}>
              <td>{supervision.date}</td>
              <td>{getWeekday(supervision.date)}</td>
              {FLOORS.map((floor) => (
                <td key={floor}>
                  {supervision.teachers[floor] ?? <Muted>미배정</Muted>}
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
                {filter.teacher
                  ? "조건에 맞는 배정이 없습니다."
                  : "이 달에 등록된 배정이 없습니다."}
              </EmptyCell>
            </tr>
          )}
        </tbody>
      </SupervisionTable>

      {deleteTarget && (
        <DeleteSupervisionModal
          date={deleteTarget.date}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            setSupervisions((prev) =>
              prev.filter((item) => item.date !== deleteTarget.date),
            );
            // 지운 행의 삭제 버튼이 사라져 포커스가 갈 곳이 없으므로 조회 조건으로 옮김
            yearSelectRef.current?.focus();
          }}
        />
      )}
    </SupervisionPage>
  );
}
