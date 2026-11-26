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
  createSupervision,
  fetchSupervisionDay,
  updateSupervision,
} from "@/lib/study-supervisors-api";
import {
  FLOORS,
  fetchSupervision,
  getWeekday,
  isValidDate,
  mergeTeachers,
  supervisionKey,
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
  PrimaryLink,
  RequiredMark,
  SecondaryButton,
} from "../notice/page-style";
import { DeleteSupervisionModal } from "./delete-supervision-modal";
import {
  ChoiceError,
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
import { useTeacherChoices } from "./use-teacher-choices";

// 선택 칸은 교직원 id를 글자로 다루고, 미배정은 빈 문자열로 둠
type FloorTeachers = Record<Floor, string>;

const teacherIdOf = (supervision: Supervision | undefined, floor: Floor) => {
  const teacher = supervision?.teachers[floor];
  return teacher ? String(teacher.id) : "";
};

const toFloorTeachers = (supervision?: Supervision): FloorTeachers => ({
  2: teacherIdOf(supervision, 2),
  3: teacherIdOf(supervision, 3),
  4: teacherIdOf(supervision, 4),
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const dateInputRef = useRef<HTMLInputElement>(null);
  // 진행 중인 저장 요청. 화면을 떠나면 취소해서 다른 화면을 목록으로 덮어쓰지 않게 함
  const requestRef = useRef<AbortController | null>(null);
  const {
    teachers: teacherChoices,
    error: teacherError,
    retry: retryTeachers,
  } = useTeacherChoices();

  // 다른 페이지로 이동해도 화면이 숨겨진 채 상태가 남으므로,
  // 다시 들어오면 처음 값으로 보이도록 숨겨질 때 초기화
  useLayoutEffect(() => {
    return () => {
      requestRef.current?.abort();
      requestRef.current = null;
      setDate(supervision?.date ?? "");
      setTeachers(toFloorTeachers(supervision));
      setDateError("");
      setIsDeleteOpen(false);
      setSubmitting(false);
      setError("");
    };
  }, [supervision]);

  // 같은 날짜 문구가 뜨면 날짜 칸으로 포커스를 옮김.
  // 확인하는 동안은 칸이 막혀 있어서 저장 중 상태가 풀린 뒤에 옮김
  useEffect(() => {
    if (dateError) dateInputRef.current?.focus();
  }, [dateError]);

  // 교직원 목록을 못 불러왔거나 목록에 없는 교직원도 이미 배정된 값은 이름으로 보이도록 합침
  const choices = mergeTeachers(
    teacherChoices ?? [],
    FLOORS.flatMap((floor) => supervision?.teachers[floor] ?? []),
  );

  // 비워 둔 층은 미배정으로 저장되지만, 서버가 배정을 한 층 이상 요구해서 모두 비우면 저장하지 않음
  const isChanged =
    date !== initialDate ||
    FLOORS.some((floor) => teachers[floor] !== initialTeachers[floor]);
  const hasTeacher = FLOORS.some((floor) => teachers[floor] !== "");
  const canSave = date !== "" && hasTeacher && isChanged && !submitting;

  const goToList = () => router.push("/supervisor");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;

    const request = new AbortController();
    requestRef.current = request;
    setSubmitting(true);
    setError("");
    setDateError("");
    const body = {
      date,
      // 비워 둔 층은 보내지 않아 미배정으로 저장됨
      supervisors: FLOORS.filter((floor) => teachers[floor] !== "").map(
        (floor) => ({ floor, teacherId: Number(teachers[floor]) }),
      ),
    };
    try {
      // 하루에 배정은 한 건이라 같은 날짜가 있으면 막음.
      // 날짜를 그대로 둔 수정은 자기 자신이라 확인하지 않음
      if (date !== supervision?.date) {
        const existing = await fetchSupervisionDay(date, request.signal);
        if (existing.id !== null && existing.id !== supervision?.id) {
          if (!request.signal.aborted) {
            setDateError(`${date}에는 이미 등록된 배정이 있습니다.`);
          }
          return;
        }
      }
      if (supervision) {
        await updateSupervision(supervision.id, body, request.signal);
      } else {
        await createSupervision(body, request.signal);
      }
      if (!request.signal.aborted) {
        // 목록으로 가는 동안 저장을 한 번 더 누르지 않도록 잠금을 풀지 않음
        requestRef.current = null;
        goToList();
      }
    } catch (saveError) {
      if (isAbortError(saveError) || request.signal.aborted) return;
      setError(errorMessage(saveError, "자습감독 배정을 저장하지 못했습니다."));
    } finally {
      if (requestRef.current === request) {
        requestRef.current = null;
        setSubmitting(false);
      }
    }
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
                const options = choices.filter(
                  (teacher) =>
                    !FLOORS.some(
                      (other) =>
                        other !== floor && teachers[other] === String(teacher.id),
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
                        disabled={submitting}
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
                          <option key={teacher.id} value={String(teacher.id)}>
                            {teacher.name}
                          </option>
                        ))}
                      </Select>
                    </SelectBox>
                  </FloorRow>
                );
              })}
            </FloorList>
            <Hint id={`${id}-floors-hint`}>
              비워두면 해당 층은 미배정으로 저장됩니다. 한 층 이상은 배정해야
              하며, 모두 비우려면 배정을 삭제하세요.
            </Hint>
            {/* 교직원 목록을 못 불러와도 날짜와 이미 배정된 교직원은 그대로 저장할 수 있음 */}
            {teacherError ? (
              <ChoiceError role="alert">
                <ErrorText>{teacherError}</ErrorText>
                <SecondaryButton type="button" onClick={retryTeachers}>
                  다시 시도
                </SecondaryButton>
              </ChoiceError>
            ) : (
              teacherChoices === null && (
                <Hint role="status">교직원 목록을 불러오는 중입니다.</Hint>
              )
            )}
          </FormField>
        </FormCard>

        {error && <FormError role="alert">{error}</FormError>}

        <SupervisionFormActions>
          {supervision && (
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
        </SupervisionFormActions>
      </SupervisionFormBox>

      {supervision && isDeleteOpen && (
        <DeleteSupervisionModal
          supervision={supervision}
          onClose={() => setIsDeleteOpen(false)}
          onDeleted={goToList}
        />
      )}
    </SupervisionPage>
  );
}

// 수정 화면. 그날 배정을 불러온 뒤 같은 폼을 띄움
export function SupervisionEditForm({ date }: { date: string }) {
  const router = useRouter();
  // 날짜 형식이 아닌 주소는 불러오지 않고 없는 배정으로 보여 줌
  const validDate = isValidDate(date);
  const [supervision, setSupervision] = useState<Supervision | null>(null);
  const [loadError, setLoadError] = useState<{
    message: string;
    notFound: boolean;
  } | null>(null);
  // 바뀌면 배정을 다시 불러옴 (다시 시도)
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // 로그인 여부는 저장소를 읽어야 해서 렌더 중이 아니라 effect에서 확인
    if (!api.auth.isLoggedIn()) {
      router.replace("/login");
      return;
    }
    if (!validDate) return;
    const request = new AbortController();
    fetchSupervision(date, request.signal)
      .then((loaded) => {
        // 하루 조회는 배정이 없어도 404가 아니라 id가 null로 옴
        if (!loaded) {
          setLoadError({
            message: `${date}에 등록된 배정이 없습니다.`,
            notFound: true,
          });
          return;
        }
        // 같은 내용을 다시 받으면 이전 값을 그대로 둬서 입력 중인 폼이 초기화되지 않게 함
        setSupervision((prev) =>
          prev && supervisionKey(prev) === supervisionKey(loaded) ? prev : loaded,
        );
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (isAbortError(error) || request.signal.aborted) return;
        setLoadError({
          message: errorMessage(error, "자습감독 배정을 불러오지 못했습니다."),
          notFound: isNotFoundError(error),
        });
      });
    return () => request.abort();
  }, [date, validDate, router, reloadKey]);

  const status = validDate
    ? loadError
    : { message: "주소의 날짜가 올바르지 않습니다.", notFound: true };

  // 다른 사람이 그사이 바꿨으면 새 값으로 폼을 다시 그리도록 배정 내용으로 폼을 구분
  if (supervision && !status) {
    return (
      <SupervisionForm
        key={supervisionKey(supervision)}
        supervision={supervision}
      />
    );
  }

  return (
    <SupervisionPage>
      <PageHead>
        <PageHeading>
          <PageTitle>자습감독 수정</PageTitle>
        </PageHeading>
      </PageHead>
      {status ? (
        <LoadStatus role="alert">
          <p>{status.message}</p>
          <ActionGroup>
            {/* 없는 배정은 다시 불러와도 같으므로 목록으로만 보냄 */}
            {!status.notFound && (
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
            <PrimaryLink href="/supervisor">목록으로</PrimaryLink>
          </ActionGroup>
        </LoadStatus>
      ) : (
        <LoadStatus role="status">
          <p>자습감독 배정을 불러오는 중입니다.</p>
        </LoadStatus>
      )}
    </SupervisionPage>
  );
}
