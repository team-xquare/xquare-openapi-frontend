"use client";

import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import {
  MEAL_BASE_MONTH,
  MEAL_BASE_YEAR,
  MEAL_TIMES,
  MEALS,
  getMonthDates,
  getWeekday,
  isWeekend,
  type Meal,
} from "../meal-content";
import {
  NoticePage as MealPage,
  PageDescription,
  PageHead,
  PageHeading,
  PageTitle,
  PrimaryLink,
  RowActions,
  RowDeleteButton,
  RowEditLink,
  SecondaryButton,
} from "../notice/page-style";
import { DeleteMealModal } from "./delete-meal-modal";
import {
  DayBadge,
  DayCard,
  DayHead,
  DayList,
  DayTitle,
  EmptyText,
  FilterBar,
  ListHint,
  MealColumn,
  MealColumns,
  MenuNone,
  Select,
  SelectBox,
  SmallLink,
  Weekday,
} from "./page-style";

const YEARS = [MEAL_BASE_YEAR - 1, MEAL_BASE_YEAR, MEAL_BASE_YEAR + 1];
const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

const BASE_PERIOD = { year: MEAL_BASE_YEAR, month: MEAL_BASE_MONTH };

export default function MealListPage() {
  // API 연동 전이라 삭제는 화면의 더미 목록에서만 빠짐
  const [meals, setMeals] = useState(MEALS);
  const [year, setYear] = useState(BASE_PERIOD.year);
  const [month, setMonth] = useState(BASE_PERIOD.month);
  const [period, setPeriod] = useState(BASE_PERIOD);
  const [deleteTarget, setDeleteTarget] = useState<Meal | null>(null);
  const yearSelectRef = useRef<HTMLSelectElement>(null);

  // 다른 페이지로 이동해도 화면이 숨겨진 채 상태가 남으므로,
  // 열려 있던 삭제 모달이 돌아왔을 때 배경 없이 남지 않도록 숨겨질 때 닫음
  useLayoutEffect(() => {
    return () => setDeleteTarget(null);
  }, []);

  const days = getMonthDates(period.year, period.month).map((date) => ({
    date,
    weekday: getWeekday(date),
    weekend: isWeekend(date),
    meal: meals.find((meal) => meal.date === date),
  }));

  // 연·월을 바꾼 뒤 조회 버튼(또는 Enter)을 눌렀을 때 바꿈
  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPeriod({ year, month });
  };

  return (
    <MealPage>
      <PageHead>
        <PageHeading>
          <PageTitle>급식 관리</PageTitle>
          <PageDescription>날짜별 급식을 직접 등록하고 고칩니다.</PageDescription>
        </PageHeading>
        <PrimaryLink href="/meal/new">급식 등록</PrimaryLink>
      </PageHead>

      <FilterBar role="search" aria-label="조회할 달" onSubmit={handleSearch}>
        <SelectBox width={150}>
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
        <SelectBox width={130}>
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
        <SecondaryButton type="submit">조회</SecondaryButton>
      </FilterBar>
      <ListHint>
        등록하지 않은 날짜는 미등록으로, 주말은 급식 없음으로 표시됩니다.
      </ListHint>

      <DayList aria-label={`${period.year}년 ${period.month}월 급식`}>
        {days.map(({ date, weekday, weekend, meal }) => {
          const state = meal ? "registered" : weekend ? "off" : "empty";

          return (
            <DayCard key={date} data-state={state}>
              <DayHead>
                <DayTitle>
                  {date}
                  <Weekday data-weekend={weekend ? "" : undefined}>
                    {weekday}
                  </Weekday>
                  {state === "empty" && (
                    <DayBadge data-tone="warning">미등록</DayBadge>
                  )}
                  {state === "off" && <DayBadge>급식 없음</DayBadge>}
                </DayTitle>
                {meal && (
                  <RowActions>
                    <RowEditLink
                      href={`/meal/${date}/edit`}
                      aria-label={`${date} 급식 수정`}
                    >
                      수정
                    </RowEditLink>
                    <RowDeleteButton
                      type="button"
                      aria-label={`${date} 급식 삭제`}
                      onClick={() => setDeleteTarget(meal)}
                    >
                      삭제
                    </RowDeleteButton>
                  </RowActions>
                )}
                {state === "empty" && (
                  <SmallLink
                    href={`/meal/new?date=${date}`}
                    aria-label={`${date} 급식 입력`}
                  >
                    입력
                  </SmallLink>
                )}
              </DayHead>

              {meal && (
                <MealColumns>
                  {MEAL_TIMES.map(({ key, label }) => (
                    <MealColumn key={key} aria-label={`${date} ${label}`}>
                      <h3>{label}</h3>
                      {meal[key].length > 0 ? (
                        <ul>
                          {meal[key].map((item, index) => (
                            <li key={`${item}-${index}`}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <MenuNone>없음</MenuNone>
                      )}
                    </MealColumn>
                  ))}
                </MealColumns>
              )}
              {state === "empty" && (
                <EmptyText>
                  아직 등록된 급식이 없습니다. 입력을 눌러 채우세요.
                </EmptyText>
              )}
            </DayCard>
          );
        })}
      </DayList>

      {deleteTarget && (
        <DeleteMealModal
          date={deleteTarget.date}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            setMeals((prev) =>
              prev.filter((meal) => meal.date !== deleteTarget.date),
            );
            // 지운 카드의 삭제 버튼이 사라져 포커스가 갈 곳이 없으므로 조회 조건으로 옮김
            yearSelectRef.current?.focus();
          }}
        />
      )}
    </MealPage>
  );
}
