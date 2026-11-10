"use client";

import { useId, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  MEAL_TIMES,
  MEALS,
  getWeekday,
  type Meal,
  type MealTime,
} from "../meal-content";
import {
  ActionGroup,
  DangerOutlineButton,
  FieldLabel,
  FormCard,
  FormField,
  NoticePage as MealPage,
  PageDescription,
  PageHead,
  PageHeading,
  PageTitle,
  PrimaryButton,
  RequiredMark,
  SecondaryButton,
} from "../notice/page-style";
import { DeleteMealModal } from "./delete-meal-modal";
import {
  DateInput,
  ErrorText,
  Hint,
  MealFormActions,
  MealFormBox,
  MenuTextarea,
} from "./page-style";

type MenuText = Record<MealTime, string>;

const toMenuText = (meal?: Meal): MenuText => ({
  breakfast: meal?.breakfast.join("\n") ?? "",
  lunch: meal?.lunch.join("\n") ?? "",
  dinner: meal?.dinner.join("\n") ?? "",
});

// 빈 줄과 앞뒤 공백은 메뉴로 보지 않음
const toLines = (text: string) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const sameMenu = (a: string, b: string) =>
  toLines(a).join("\n") === toLines(b).join("\n");

// 등록과 수정이 같은 폼을 씀. meal이 있으면 수정 화면
// 등록 화면은 목록·홈의 `입력`에서 넘어온 날짜(initialDate)를 미리 채움
export function MealForm({
  meal,
  initialDate = "",
}: {
  meal?: Meal;
  initialDate?: string;
}) {
  const router = useRouter();
  const id = useId();
  const startDate = meal?.date ?? initialDate;
  const initialMenu = toMenuText(meal);
  const [date, setDate] = useState(startDate);
  const [menu, setMenu] = useState(initialMenu);
  const [dateError, setDateError] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // 다른 페이지로 이동해도 화면이 숨겨진 채 상태가 남으므로,
  // 다시 들어오면 처음 값으로 보이도록 숨겨질 때 초기화
  useLayoutEffect(() => {
    return () => {
      setDate(meal?.date ?? initialDate);
      setMenu(toMenuText(meal));
      setDateError("");
      setIsDeleteOpen(false);
    };
  }, [meal, initialDate]);

  const hasMenu = MEAL_TIMES.some(({ key }) => toLines(menu[key]).length > 0);
  const isChanged =
    date !== startDate ||
    MEAL_TIMES.some(({ key }) => !sameMenu(menu[key], initialMenu[key]));
  const canSave = date !== "" && hasMenu && isChanged;

  const goToList = () => router.push("/meal");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;

    // 하루에 급식은 한 건이라 같은 날짜가 있으면 막음
    const isDuplicate = MEALS.some(
      (item) => item.date === date && item.date !== meal?.date,
    );
    if (isDuplicate) {
      setDateError(`${date}에는 이미 등록된 급식이 있습니다.`);
      dateInputRef.current?.focus();
      return;
    }

    // 급식 저장 API 연동 전이라 목록으로만 이동
    // (API에는 한 줄씩 적은 메뉴를 쉼표로 합쳐서 보냄)
    goToList();
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
                aria-describedby={`${id}-menu-hint`}
                onChange={(event) =>
                  setMenu((prev) => ({ ...prev, [key]: event.target.value }))
                }
              />
              {/* Figma처럼 안내는 첫 칸(조식) 아래에만 두고 세 칸이 같이 가리킴 */}
              {index === 0 && (
                <Hint id={`${id}-menu-hint`}>
                  한 줄에 하나씩 입력하면 저장할 때 쉼표로 합쳐집니다. 없는
                  끼니는 비워 두세요.
                </Hint>
              )}
            </FormField>
          ))}
        </FormCard>

        <MealFormActions>
          {meal && (
            <DangerOutlineButton
              type="button"
              onClick={() => setIsDeleteOpen(true)}
            >
              삭제
            </DangerOutlineButton>
          )}
          <ActionGroup>
            <SecondaryButton type="button" onClick={goToList}>
              취소
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={!canSave}>
              저장
            </PrimaryButton>
          </ActionGroup>
        </MealFormActions>
      </MealFormBox>

      {meal && isDeleteOpen && (
        <DeleteMealModal
          date={meal.date}
          onClose={() => setIsDeleteOpen(false)}
          // 급식 삭제 API 연동 전이라 목록으로만 이동
          onConfirm={goToList}
        />
      )}
    </MealPage>
  );
}
