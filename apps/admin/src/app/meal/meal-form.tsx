"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import {
  FormError,
  LoadStatus,
} from "@/components/request-status/request-status-style";
import { api } from "@/lib/api";
import { errorMessage, isAbortError } from "@/lib/api-error";
import {
  MEAL_MENU_MAX_COUNT,
  MEAL_MENU_MAX_LENGTH,
  createMeal,
  fetchMeals,
  updateMeal,
  type MealRequest,
  type MealResponse,
} from "@/lib/meals-api";
import { MEAL_TIMES, getWeekday, type MealTime } from "../meal-content";
import {
  ActionGroup,
  FieldLabel,
  FormCard,
  FormField,
  NoticePage as MealPage,
  PageDescription,
  PageHead,
  PageHeading,
  PageTitle,
  PrimaryButton,
  PrimaryLink,
  RequiredMark,
  SecondaryButton,
} from "../notice/page-style";
import {
  DateInput,
  ErrorText,
  Hint,
  MealFormActions,
  MealFormBox,
  MenuTextarea,
  SecondaryLink,
} from "./page-style";

type MenuText = Record<MealTime, string>;

const toMenuText = (meal?: MealResponse): MenuText => ({
  breakfast: meal?.breakfast.join("\n") ?? "",
  lunch: meal?.lunch.join("\n") ?? "",
  dinner: meal?.dinner.join("\n") ?? "",
});

// 빈 줄과 앞뒤 공백은 메뉴로 보지 않음.
// 붙여 넣은 탭 같은 제어 문자는 서버가 받지 않아 연속 공백과 함께 한 칸으로 바꿈
const toLines = (text: string) =>
  text
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

const sameMenu = (a: string, b: string) =>
  toLines(a).join("\n") === toLines(b).join("\n");

// 서버가 끼니마다 메뉴 20개, 메뉴 하나는 50자까지만 받아서 저장 전에 막음
const getMenuError = (text: string, label: string) => {
  const lines = toLines(text);
  if (lines.length > MEAL_MENU_MAX_COUNT) {
    return `${label} 메뉴는 ${MEAL_MENU_MAX_COUNT}개까지 입력할 수 있습니다.`;
  }
  if (lines.some((line) => line.length > MEAL_MENU_MAX_LENGTH)) {
    return `${label} 메뉴 하나는 ${MEAL_MENU_MAX_LENGTH}자까지 입력할 수 있습니다.`;
  }
  return "";
};

// 그 날짜의 급식. 하루에 한 건이라 없으면 null
async function fetchMealOn(date: string, signal?: AbortSignal) {
  const response = await fetchMeals({ startDate: date, finishDate: date }, signal);
  return response.meals.find((meal) => meal.date === date) ?? null;
}

// 등록과 수정이 같은 폼을 씀. meal이 있으면 수정 화면
// 등록 화면은 목록·홈의 `입력`에서 넘어온 날짜(initialDate)를 미리 채움
export function MealForm({
  meal,
  initialDate = "",
}: {
  meal?: MealResponse;
  initialDate?: string;
}) {
  const router = useRouter();
  const id = useId();
  const startDate = meal?.date ?? initialDate;
  const initialMenu = toMenuText(meal);
  const [date, setDate] = useState(startDate);
  const [menu, setMenu] = useState(initialMenu);
  const [dateError, setDateError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const dateInputRef = useRef<HTMLInputElement>(null);
  // 진행 중인 저장 요청. 화면을 떠나면 취소해서 다른 화면을 목록으로 덮어쓰지 않게 함
  const requestRef = useRef<AbortController | null>(null);

  // 다른 페이지로 이동해도 화면이 숨겨진 채 상태가 남으므로,
  // 다시 들어오면 처음 값으로 보이도록 숨겨질 때 초기화
  useLayoutEffect(() => {
    return () => {
      requestRef.current?.abort();
      requestRef.current = null;
      setDate(meal?.date ?? initialDate);
      setMenu(toMenuText(meal));
      setDateError("");
      setSubmitting(false);
      setError("");
    };
  }, [meal, initialDate]);

  const menuErrors = Object.fromEntries(
    MEAL_TIMES.map(({ key, label }) => [key, getMenuError(menu[key], label)]),
  ) as Record<MealTime, string>;
  const hasMenu = MEAL_TIMES.some(({ key }) => toLines(menu[key]).length > 0);
  const isChanged =
    date !== startDate ||
    MEAL_TIMES.some(({ key }) => !sameMenu(menu[key], initialMenu[key]));
  const canSave =
    date !== "" &&
    hasMenu &&
    isChanged &&
    !MEAL_TIMES.some(({ key }) => menuErrors[key]) &&
    !submitting;

  const goToList = () => router.push("/meal");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;

    const request = new AbortController();
    requestRef.current = request;
    setSubmitting(true);
    setError("");
    setDateError("");
    try {
      // 하루에 급식은 한 건이라 고른 날짜에 이미 급식이 있으면 막음.
      // 수정 화면에서 날짜를 그대로 두면 그 급식 자신이라 확인하지 않음
      if (date !== meal?.date) {
        const existing = await fetchMealOn(date, request.signal);
        if (request.signal.aborted) return;
        if (existing) {
          // 저장 중이라 막혀 있던 날짜 칸을 먼저 풀어야 포커스가 감
          requestRef.current = null;
          flushSync(() => {
            setSubmitting(false);
            setDateError(`${date}에는 이미 등록된 급식이 있습니다.`);
          });
          dateInputRef.current?.focus();
          return;
        }
      }

      // 한 줄에 하나씩 적은 메뉴를 끼니마다 배열로 보냄
      const body: MealRequest = {
        date,
        breakfast: toLines(menu.breakfast),
        lunch: toLines(menu.lunch),
        dinner: toLines(menu.dinner),
      };
      if (meal) {
        await updateMeal(meal.id, body, request.signal);
      } else {
        await createMeal(body, request.signal);
      }
      if (!request.signal.aborted) {
        // 목록으로 가는 동안 저장을 한 번 더 누르지 않도록 잠금을 풀지 않음
        requestRef.current = null;
        goToList();
      }
    } catch (saveError) {
      if (isAbortError(saveError) || request.signal.aborted) return;
      setError(errorMessage(saveError, "급식을 저장하지 못했습니다."));
    } finally {
      if (requestRef.current === request) {
        requestRef.current = null;
        setSubmitting(false);
      }
    }
  };

  return (
    <MealPage>
      <PageHead>
        <PageHeading>
          <PageTitle>{meal ? "급식 수정" : "급식 등록"}</PageTitle>
          <PageDescription>
            {meal
              ? `${meal.date} · ${getWeekday(meal.date)}요일`
              : "날짜를 골라 급식 메뉴를 등록합니다."}
          </PageDescription>
        </PageHeading>
      </PageHead>

      <MealFormBox onSubmit={handleSubmit}>
        <FormCard>
          <FormField>
            <FieldLabel htmlFor={`${id}-date`}>
              날짜<RequiredMark aria-hidden="true">*</RequiredMark>
            </FieldLabel>
            <DateInput
              ref={dateInputRef}
              id={`${id}-date`}
              type="date"
              value={date}
              required
              disabled={submitting}
              aria-invalid={dateError ? true : undefined}
              aria-describedby={
                dateError ? `${id}-date-hint ${id}-date-error` : `${id}-date-hint`
              }
              onChange={(event) => {
                setDate(event.target.value);
                setDateError("");
              }}
            />
            <Hint id={`${id}-date-hint`}>
              같은 날짜가 이미 있으면 저장할 때 막힙니다.
            </Hint>
            {dateError && (
              <ErrorText id={`${id}-date-error`} role="alert">
                {dateError}
              </ErrorText>
            )}
          </FormField>

          {MEAL_TIMES.map(({ key, label }, index) => (
            <FormField key={key}>
              <FieldLabel htmlFor={`${id}-${key}`}>{label}</FieldLabel>
              <MenuTextarea
                id={`${id}-${key}`}
                rows={7}
                value={menu[key]}
                placeholder="한 줄에 메뉴 하나씩 입력하세요"
                disabled={submitting}
                aria-invalid={menuErrors[key] ? true : undefined}
                aria-describedby={
                  menuErrors[key]
                    ? `${id}-menu-hint ${id}-${key}-error`
                    : `${id}-menu-hint`
                }
                onChange={(event) =>
                  setMenu((prev) => ({ ...prev, [key]: event.target.value }))
                }
              />
              {/* Figma처럼 안내는 첫 칸(조식) 아래에만 두고 세 칸이 같이 가리킴 */}
              {index === 0 && (
                <Hint id={`${id}-menu-hint`}>
                  한 줄에 하나씩 입력하면 메뉴 하나로 저장됩니다(끼니마다{" "}
                  {MEAL_MENU_MAX_COUNT}개, 메뉴 하나는 {MEAL_MENU_MAX_LENGTH}자까지).
                  없는 끼니는 비워 두세요.
                </Hint>
              )}
              {menuErrors[key] && (
                <ErrorText id={`${id}-${key}-error`} role="alert">
                  {menuErrors[key]}
                </ErrorText>
              )}
            </FormField>
          ))}
        </FormCard>

        {error && <FormError role="alert">{error}</FormError>}

        {/* 급식 삭제 API가 아직 없어 수정 화면에도 삭제 버튼을 두지 않음 */}
        <MealFormActions>
          <ActionGroup>
            <SecondaryButton
              type="button"
              disabled={submitting}
              onClick={goToList}
            >
              취소
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={!canSave}>
              {submitting ? "저장 중…" : "저장"}
            </PrimaryButton>
          </ActionGroup>
        </MealFormActions>
      </MealFormBox>
    </MealPage>
  );
}

// 수정 화면. 그 날짜의 급식을 불러온 뒤 같은 폼을 띄움
export function MealEditForm({ date }: { date: string }) {
  const router = useRouter();
  // 처음 불러오기 전에는 undefined, 그 날짜에 등록된 급식이 없으면 null
  const [meal, setMeal] = useState<MealResponse | null>();
  const [loadError, setLoadError] = useState("");
  // 바뀌면 급식을 다시 불러옴 (다시 시도)
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // 로그인 여부는 저장소를 읽어야 해서 렌더 중이 아니라 effect에서 확인
    if (!api.auth.isLoggedIn()) {
      router.replace("/login");
      return;
    }
    const request = new AbortController();
    fetchMealOn(date, request.signal)
      .then((loaded) => {
        // 내용이 같으면 이전 객체를 그대로 둬서, 다시 불러와도 입력 중인 폼이 초기화되지 않게 함
        setMeal((prev) =>
          prev && JSON.stringify(prev) === JSON.stringify(loaded) ? prev : loaded,
        );
        setLoadError("");
      })
      .catch((error: unknown) => {
        if (isAbortError(error) || request.signal.aborted) return;
        setLoadError(errorMessage(error, "급식을 불러오지 못했습니다."));
      });
    return () => request.abort();
  }, [date, router, reloadKey]);

  if (meal && !loadError) {
    // 저장 뒤 다시 들어왔을 때 이전 내용이 남지 않도록 내용으로 폼을 구분
    return <MealForm key={JSON.stringify(meal)} meal={meal} />;
  }

  return (
    <MealPage>
      <PageHead>
        <PageHeading>
          <PageTitle>급식 수정</PageTitle>
          <PageDescription>
            {date} · {getWeekday(date)}요일
          </PageDescription>
        </PageHeading>
      </PageHead>
      {loadError ? (
        <LoadStatus role="alert">
          <p>{loadError}</p>
          <ActionGroup>
            <SecondaryButton
              type="button"
              onClick={() => {
                setLoadError("");
                setReloadKey((key) => key + 1);
              }}
            >
              다시 시도
            </SecondaryButton>
            <PrimaryLink href="/meal">목록으로</PrimaryLink>
          </ActionGroup>
        </LoadStatus>
      ) : meal === null ? (
        // 급식 조회는 없는 날짜도 빈 목록으로 줘서 404가 아니라 여기서 없음을 알림
        <LoadStatus role="alert">
          <p>{date}에 등록된 급식이 없습니다.</p>
          <ActionGroup>
            <SecondaryLink href={`/meal/new?date=${date}`}>급식 입력</SecondaryLink>
            <PrimaryLink href="/meal">목록으로</PrimaryLink>
          </ActionGroup>
        </LoadStatus>
      ) : (
        <LoadStatus role="status">
          <p>급식을 불러오는 중입니다.</p>
        </LoadStatus>
      )}
    </MealPage>
  );
}
