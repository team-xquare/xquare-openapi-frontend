"use client";

import { useId, useLayoutEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  SCHEDULE_SOURCE_LABEL,
  SCHEDULE_TITLE_MAX_LENGTH,
  type Schedule,
} from "../schedule-content";
import {
  ActionGroup,
  DangerOutlineButton,
  FieldLabel,
  FormActions,
  FormCard,
  FormField,
  NoticePage as SchedulePage,
  PageDescription,
  PageHead,
  PageHeading,
  PageTitle,
  PrimaryButton,
  RequiredMark,
  SecondaryButton,
  TitleInput,
} from "../notice/page-style";
import { DeleteScheduleModal } from "./delete-schedule-modal";
import {
  DateInput,
  FieldHint,
  ReadonlyInput,
  ScheduleFormBox,
} from "./page-style";

// 등록과 수정이 같은 폼을 씀. schedule이 있으면 수정 화면
export function ScheduleForm({ schedule }: { schedule?: Schedule }) {
  const router = useRouter();
  const id = useId();
  const initialDate = schedule?.date ?? "";
  const initialTitle = schedule?.title ?? "";
  const initialDescription = schedule?.description ?? "";
  const [date, setDate] = useState(initialDate);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // 앞뒤 공백만 바꾼 것은 바뀐 내용으로 보지 않음
  const isChanged =
    date !== initialDate ||
    title.trim() !== initialTitle.trim() ||
    description.trim() !== initialDescription.trim();
  const canSave = date !== "" && title.trim() !== "" && isChanged;

  // 다른 페이지로 이동해도 화면이 숨겨진 채 상태가 남으므로,
  // 다시 들어오면 처음 값으로 보이도록 숨겨질 때 초기화
  useLayoutEffect(() => {
    return () => {
      setDate(initialDate);
      setTitle(initialTitle);
      setDescription(initialDescription);
      setIsDeleteOpen(false);
    };
  }, [initialDate, initialTitle, initialDescription]);

  const goToList = () => router.push("/schedule");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;

    // 일정 저장 API 연동 전이라 목록으로만 이동
    goToList();
  };

  return (
    <SchedulePage>
      <PageHead>
        <PageHeading>
          <PageTitle>{schedule ? "학사 일정 수정" : "학사 일정 등록"}</PageTitle>
          <PageDescription>
            {schedule
              ? `${schedule.date} · ${schedule.title}`
              : "학교에서 직접 정하는 학사 일정을 등록합니다. 나이스 일정은 일정 관리에서 불러옵니다."}
          </PageDescription>
        </PageHeading>
      </PageHead>

      <ScheduleFormBox onSubmit={handleSubmit}>
        <FormCard>
          <FormField>
            <FieldLabel htmlFor={`${id}-date`}>
              날짜<RequiredMark aria-hidden="true">*</RequiredMark>
            </FieldLabel>
            <DateInput
              id={`${id}-date`}
              type="date"
              value={date}
              data-empty={date === "" || undefined}
              required
              onChange={(event) => setDate(event.target.value)}
            />
          </FormField>

          <FormField>
            <FieldLabel htmlFor={`${id}-title`}>
              제목<RequiredMark aria-hidden="true">*</RequiredMark>
            </FieldLabel>
            <TitleInput
              id={`${id}-title`}
              aria-describedby={`${id}-title-hint`}
              value={title}
              placeholder="제목을 입력하세요"
              maxLength={SCHEDULE_TITLE_MAX_LENGTH}
              required
              onChange={(event) => setTitle(event.target.value)}
            />
            <FieldHint id={`${id}-title-hint`}>
              1~{SCHEDULE_TITLE_MAX_LENGTH}자입니다.
            </FieldHint>
          </FormField>

          <FormField>
            <FieldLabel htmlFor={`${id}-description`}>설명</FieldLabel>
            <TitleInput
              id={`${id}-description`}
              value={description}
              placeholder="설명을 입력하세요 (선택)"
              onChange={(event) => setDescription(event.target.value)}
            />
          </FormField>

          <FormField>
            <FieldLabel htmlFor={`${id}-source`}>출처</FieldLabel>
            {/* 등록은 항상 학교 입력, 수정은 원래 출처를 그대로 둠 */}
            <ReadonlyInput
              id={`${id}-source`}
              aria-describedby={`${id}-source-hint`}
              value={SCHEDULE_SOURCE_LABEL[schedule?.source ?? "school"]}
              readOnly
            />
            <FieldHint id={`${id}-source-hint`}>
              {schedule
                ? "나이스에서 불러온 일정도 이 화면에서 수정·삭제할 수 있습니다."
                : "여기서 등록한 일정은 학교 입력으로 저장됩니다."}
            </FieldHint>
          </FormField>
        </FormCard>

        <FormActions>
          {schedule && (
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
        </FormActions>
      </ScheduleFormBox>

      {schedule && isDeleteOpen && (
        <DeleteScheduleModal
          title={schedule.title}
          onClose={() => setIsDeleteOpen(false)}
          // 일정 삭제 API 연동 전이라 목록으로만 이동
          onConfirm={goToList}
        />
      )}
    </SchedulePage>
  );
}
