"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoadStatus } from "@/components/request-status/request-status-style";
import { api } from "@/lib/api";
import { errorMessage, isAbortError } from "@/lib/api-error";
import { fetchMeals, type MealResponse } from "@/lib/meals-api";
import { useToday } from "@/lib/use-today";
import {
  MEAL_TIMES,
  getMonthDates,
  getWeekday,
  isWeekend,
} from "../meal-content";
import {
  NoticePage as MealPage,
  PageDescription,
  PageHead,
  PageHeading,
  PageTitle,
  PrimaryLink,
  RowActions,
  RowEditLink,
  SecondaryButton,
} from "../notice/page-style";
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

const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

export default function MealListPage() {
  // 처음 보여 줄 달은 오늘이 있는 달. 미리 그릴 때와 hydration 때는 오늘을 몰라(null) 불러오는 중으로 둠
  const today = useToday();

  return (
    <MealPage>
      <PageHead>
        <PageHeading>
          <PageTitle>급식 관리</PageTitle>
          <PageDescription>날짜별 급식을 직접 등록하고 고칩니다.</PageDescription>
        </PageHeading>
        <PrimaryLink href="/meal/new">급식 등록</PrimaryLink>
      </PageHead>

      {today ? (
        <MealMonthList today={today} />
      ) : (
        <LoadStatus role="status">
          <p>급식 목록을 불러오는 중입니다.</p>
        </LoadStatus>
      )}
    </MealPage>
  );
}

// 조회 조건과 그 달의 급식. 오늘(today, YYYY-MM-DD)이 있는 달부터 보여 줌
function MealMonthList({ today }: { today: string }) {
  const router = useRouter();
  const [baseYear, baseMonth] = today.split("-").map(Number);
  const [year, setYear] = useState(baseYear);
  const [month, setMonth] = useState(baseMonth);
  const [period, setPeriod] = useState({ year: baseYear, month: baseMonth });
  // 불러온 급식과 실패 문구는 어느 달 것인지 같이 둬서, 달을 바꾼 직후 지난 달 것을 보이지 않게 함
  const [loaded, setLoaded] = useState<{
    period: string;
    meals: MealResponse[];
  } | null>(null);
  const [loadError, setLoadError] = useState<{
    period: string;
    message: string;
  } | null>(null);
  // 바뀌면 급식을 다시 불러옴 (다시 시도)
  const [reloadKey, setReloadKey] = useState(0);

  const years = [baseYear - 1, baseYear, baseYear + 1];
  const periodKey = `${period.year}-${period.month}`;

  // 다른 화면에서 돌아와 다시 보일 때와 조회를 누를 때도 effect가 다시 돌아 최신 급식을 받음
  useEffect(() => {
    // 로그인 여부는 저장소를 읽어야 해서 렌더 중이 아니라 effect에서 확인
    if (!api.auth.isLoggedIn()) {
      router.replace("/login");
      return;
    }
    const key = `${period.year}-${period.month}`;
    const dates = getMonthDates(period.year, period.month);
    const request = new AbortController();
    fetchMeals(
      { startDate: dates[0], finishDate: dates[dates.length - 1] },
      request.signal,
    )
      .then((response) => {
        setLoaded({ period: key, meals: response.meals });
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (isAbortError(error) || request.signal.aborted) return;
        setLoadError({
          period: key,
          message: errorMessage(error, "급식 목록을 불러오지 못했습니다."),
        });
      });
    return () => request.abort();
  }, [router, period, reloadKey]);

  // 처음 불러오기 전이거나 다른 달을 불러오는 중이면 null
  const meals = loaded?.period === periodKey ? loaded.meals : null;
  const error = loadError?.period === periodKey ? loadError.message : "";

  const days = getMonthDates(period.year, period.month).map((date) => ({
    date,
    weekday: getWeekday(date),
    weekend: isWeekend(date),
    meal: meals?.find((meal) => meal.date === date),
  }));

  // 연·월을 바꾼 뒤 조회 버튼(또는 Enter)을 눌렀을 때 바꿈
  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPeriod({ year, month });
  };

  return (
    <>
      <FilterBar role="search" aria-label="조회할 달" onSubmit={handleSearch}>
        <SelectBox width={150}>
          <Select
            value={year}
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

      {/* 불러오기 전에는 모든 날이 미등록으로 보이지 않도록 날짜 카드 대신 상태 문구를 둠 */}
      {meals ? (
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
                  {/* 급식 삭제 API가 아직 없어 수정만 둠 */}
                  {meal && (
                    <RowActions>
                      <RowEditLink
                        href={`/meal/${date}/edit`}
                        aria-label={`${date} 급식 수정`}
                      >
                        수정
                      </RowEditLink>
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
      ) : error ? (
        <LoadStatus role="alert">
          <p>{error}</p>
          <SecondaryButton
            type="button"
            onClick={() => {
              setLoadError(null);
              setReloadKey((key) => key + 1);
            }}
          >
            다시 시도
          </SecondaryButton>
        </LoadStatus>
      ) : (
        <LoadStatus role="status">
          <p>
            {period.year}년 {period.month}월 급식을 불러오는 중입니다.
          </p>
        </LoadStatus>
      )}
    </>
  );
}
