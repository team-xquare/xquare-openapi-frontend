"use client";

import { useId, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  FLOORS,
  SUPERVISIONS,
  TEACHERS,
  getWeekday,
  type Floor,
  type Supervision,
} from "../supervisor-content";
import {
  ActionGroup,
  DangerOutlineButton,
  FieldLabel,
  FormCard,
  FormField,
  NoticePage as SupervisionPage,
  PageDescription,
  PageHead,
  PageHeading,
  PageTitle,
  PrimaryButton,
  RequiredMark,
  SecondaryButton,
} from "../notice/page-style";
import { DeleteSupervisionModal } from "./delete-supervision-modal";
import {
  DateInput,
  ErrorText,
  FloorLabel,
  FloorList,
  FloorRow,
  Hint,
  Select,
  SelectBox,
  SupervisionFormActions,
  SupervisionFormBox,
} from "./page-style";

// 선택 칸은 미배정을 빈 문자열로 다룸
type FloorTeachers = Record<Floor, string>;

const toFloorTeachers = (supervision?: Supervision): FloorTeachers => ({
  2: supervision?.teachers[2] ?? "",
  3: supervision?.teachers[3] ?? "",
  4: supervision?.teachers[4] ?? "",
});

// 등록과 수정이 같은 폼을 씀. supervision이 있으면 수정 화면
export function SupervisionForm({ supervision }: { supervision?: Supervision }) {
  const router = useRouter();
  const id = useId();
  const initialDate = supervision?.date ?? "";
  const initialTeachers = toFloorTeachers(supervision);
  const [date, setDate] = useState(initialDate);
  const [teachers, setTeachers] = useState(initialTeachers);
  const [dateError, setDateError] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // 다른 페이지로 이동해도 화면이 숨겨진 채 상태가 남으므로,
  // 다시 들어오면 처음 값으로 보이도록 숨겨질 때 초기화
  useLayoutEffect(() => {
    return () => {
      setDate(supervision?.date ?? "");
      setTeachers(toFloorTeachers(supervision));
      setDateError("");
      setIsDeleteOpen(false);
    };
  }, [supervision]);

  // 비워 둔 층은 미배정으로 저장되므로 날짜만 있으면 저장할 수 있음
  const isChanged =
    date !== initialDate ||
    FLOORS.some((floor) => teachers[floor] !== initialTeachers[floor]);
  const canSave = date !== "" && isChanged;

  const goToList = () => router.push("/supervisor");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;

    // 하루에 배정은 한 건이라 같은 날짜가 있으면 막음
    const isDuplicate = SUPERVISIONS.some(
      (item) => item.date === date && item.date !== supervision?.date,
    );
    if (isDuplicate) {
      setDateError(`${date}에는 이미 등록된 배정이 있습니다.`);
      dateInputRef.current?.focus();
      return;
    }

    // 자습감독 저장 API 연동 전이라 목록으로만 이동
    goToList();
  };

  return (
    <SupervisionPage>
      <PageHead>
        <PageHeading>
          <PageTitle>{supervision ? "자습감독 수정" : "자습감독 등록"}</PageTitle>
          <PageDescription>
            {supervision
              ? `${supervision.date} · ${getWeekday(supervision.date)}요일`
              : "날짜를 정하고 층별 감독 교직원을 배정합니다."}
          </PageDescription>
        </PageHeading>
      </PageHead>

      <SupervisionFormBox onSubmit={handleSubmit}>
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
              같은 날짜가 이미 등록돼 있으면 저장할 때 막힙니다.
            </Hint>
            {dateError && (
              <ErrorText id={`${id}-date-error`} role="alert">
                {dateError}
              </ErrorText>
            )}
          </FormField>

          <FormField role="group" aria-labelledby={`${id}-floors-label`}>
            <FieldLabel as="span" id={`${id}-floors-label`}>
              층별 감독 교직원<RequiredMark aria-hidden="true">*</RequiredMark>
            </FieldLabel>
            <FloorList>
              {FLOORS.map((floor) => {
                // 한 사람이 같은 날 두 층을 맡지 않도록 다른 층에서 고른 교직원은 뺌
                const options = TEACHERS.filter(
                  (teacher) =>
                    !FLOORS.some(
                      (other) => other !== floor && teachers[other] === teacher,
                    ),
                );

                return (
                  <FloorRow key={floor}>
                    <FloorLabel htmlFor={`${id}-floor-${floor}`}>
                      {floor}층
                    </FloorLabel>
                    <SelectBox>
                      <Select
                        id={`${id}-floor-${floor}`}
                        value={teachers[floor]}
                        aria-describedby={`${id}-floors-hint`}
                        data-empty={teachers[floor] === "" ? "" : undefined}
                        onChange={(event) =>
                          setTeachers((prev) => ({
                            ...prev,
                            [floor]: event.target.value,
                          }))
                        }
                      >
                        {/* 안내 문구를 고르면 다시 미배정으로 돌아감 */}
                        <option value="">교직원을 검색해 선택하세요</option>
                        {options.map((teacher) => (
                          <option key={teacher} value={teacher}>
                            {teacher}
                          </option>
                        ))}
                      </Select>
                    </SelectBox>
                  </FloorRow>
                );
              })}
            </FloorList>
            <Hint id={`${id}-floors-hint`}>
              비워두면 해당 층은 미배정으로 저장됩니다.
            </Hint>
          </FormField>
        </FormCard>

        <SupervisionFormActions>
          {supervision && (
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
        </SupervisionFormActions>
      </SupervisionFormBox>

      {supervision && isDeleteOpen && (
        <DeleteSupervisionModal
          date={supervision.date}
          onClose={() => setIsDeleteOpen(false)}
          // 자습감독 삭제 API 연동 전이라 목록으로만 이동
          onConfirm={goToList}
        />
      )}
    </SupervisionPage>
  );
}
