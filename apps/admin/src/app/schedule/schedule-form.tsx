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
import {
  FormError,
  LoadStatus,
} from "@/components/request-status/request-status-style";
import { api } from "@/lib/api";
import { errorMessage, isAbortError, isNotFoundError } from "@/lib/api-error";
import {
  createSchedule,
  fetchSchedule,
  updateSchedule,
} from "@/lib/schedules-api";
import {
  SCHEDULE_CONTENT_MAX_LENGTH,
  SCHEDULE_TITLE_MAX_LENGTH,
  toSchedule,
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
  PrimaryLink,
  RequiredMark,
  SecondaryButton,
  TitleInput,
} from "../notice/page-style";
import { DeleteScheduleModal } from "./delete-schedule-modal";
import { DateInput, FieldHint, ScheduleFormBox } from "./page-style";

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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  // 진행 중인 저장 요청. 화면을 떠나면 취소해서 다른 화면을 목록으로 덮어쓰지 않게 함
  const requestRef = useRef<AbortController | null>(null);

  // 앞뒤 공백만 바꾼 것은 바뀐 내용으로 보지 않음
  const isChanged =
    date !== initialDate ||
    title.trim() !== initialTitle.trim() ||
    description.trim() !== initialDescription.trim();
  const canSave = date !== "" && title.trim() !== "" && isChanged && !submitting;

  // 다른 페이지로 이동해도 화면이 숨겨진 채 상태가 남으므로,
  // 다시 들어오면 처음 값으로 보이도록 숨겨질 때 초기화
  useLayoutEffect(() => {
    return () => {
      requestRef.current?.abort();
      requestRef.current = null;
      setDate(initialDate);
      setTitle(initialTitle);
      setDescription(initialDescription);
      setIsDeleteOpen(false);
      setSubmitting(false);
      setError("");
    };
  }, [initialDate, initialTitle, initialDescription]);

  const goToList = () => router.push("/schedule");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;

    const request = new AbortController();
    requestRef.current = request;
    setSubmitting(true);
    setError("");
    // 앞뒤 공백은 바뀐 내용으로 보지 않으므로 빼고 보냄. 설명이 비면 null
    const body = {
      date,
      title: title.trim(),
      content: description.trim() || null,
    };
    try {
      if (schedule) {
        await updateSchedule(schedule.id, body, request.signal);
      } else {
        await createSchedule(body, request.signal);
      }
      if (!request.signal.aborted) {
        // 목록으로 가는 동안 저장을 한 번 더 누르지 않도록 잠금을 풀지 않음
        requestRef.current = null;
        goToList();
      }
    } catch (saveError) {
      if (isAbortError(saveError) || request.signal.aborted) return;
      setError(errorMessage(saveError, "일정을 저장하지 못했습니다."));
    } finally {
      if (requestRef.current === request) {
        requestRef.current = null;
        setSubmitting(false);
      }
    }
  };

  return (
    <SchedulePage>
      <PageHead>
        <PageHeading>
          <PageTitle>{schedule ? "학사 일정 수정" : "학사 일정 등록"}</PageTitle>
          <PageDescription>
            {schedule
              ? `${schedule.date} · ${schedule.title}`
              : "학교 학사 일정을 등록합니다. 등록한 일정은 일정 관리에서 수정·삭제할 수 있습니다."}
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
              disabled={submitting}
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
              disabled={submitting}
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
              maxLength={SCHEDULE_CONTENT_MAX_LENGTH}
              disabled={submitting}
              onChange={(event) => setDescription(event.target.value)}
            />
          </FormField>
        </FormCard>

        {error && <FormError role="alert">{error}</FormError>}

        <FormActions>
          {schedule && (
            <DangerOutlineButton
              type="button"
              disabled={submitting}
              onClick={() => setIsDeleteOpen(true)}
            >
              삭제
            </DangerOutlineButton>
          )}
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
        </FormActions>
      </ScheduleFormBox>

      {schedule && isDeleteOpen && (
        <DeleteScheduleModal
          schedule={schedule}
          onClose={() => setIsDeleteOpen(false)}
          onDeleted={goToList}
        />
      )}
    </SchedulePage>
  );
}

// 수정 화면. 일정을 불러온 뒤 같은 폼을 띄움
export function ScheduleEditForm({ id }: { id: string }) {
  const router = useRouter();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loadError, setLoadError] = useState<{
    message: string;
    notFound: boolean;
  } | null>(null);
  // 바뀌면 일정을 다시 불러옴 (다시 시도)
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // 로그인 여부는 저장소를 읽어야 해서 렌더 중이 아니라 effect에서 확인
    if (!api.auth.isLoggedIn()) {
      router.replace("/login");
      return;
    }
    const request = new AbortController();
    fetchSchedule(id, request.signal)
      .then((loaded) => {
        setSchedule(toSchedule(loaded));
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (isAbortError(error) || request.signal.aborted) return;
        setLoadError({
          message: errorMessage(error, "일정을 불러오지 못했습니다."),
          notFound: isNotFoundError(error),
        });
      });
    return () => request.abort();
  }, [id, router, reloadKey]);

  // 같은 일정을 다시 불러와도 입력 중인 폼이 초기화되지 않도록 불러온 내용으로 폼을 구분
  if (schedule && !loadError) {
    return (
      <ScheduleForm
        key={`${schedule.id}-${schedule.date}-${schedule.title}-${schedule.description ?? ""}`}
        schedule={schedule}
      />
    );
  }

  return (
    <SchedulePage>
      <PageHead>
        <PageHeading>
          <PageTitle>학사 일정 수정</PageTitle>
        </PageHeading>
      </PageHead>
      {loadError ? (
        <LoadStatus role="alert">
          <p>{loadError.message}</p>
          <ActionGroup>
            {/* 없는 일정(404)은 다시 불러와도 같으므로 목록으로만 보냄 */}
            {!loadError.notFound && (
              <SecondaryButton
                type="button"
                onClick={() => {
                  setLoadError(null);
                  setReloadKey((key) => key + 1);
                }}
              >
                다시 시도
              </SecondaryButton>
            )}
            <PrimaryLink href="/schedule">목록으로</PrimaryLink>
          </ActionGroup>
        </LoadStatus>
      ) : (
        <LoadStatus role="status">
          <p>일정을 불러오는 중입니다.</p>
        </LoadStatus>
      )}
    </SchedulePage>
  );
}
