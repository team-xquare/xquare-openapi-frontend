"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { errorMessage, isAbortError, isNotFoundError } from "@/lib/api-error";
import {
  fetchStudent,
  STUDENT_NAME_MAX_LENGTH,
  updateStudent,
  type StudentResponse,
} from "@/lib/students-api";
import {
  FormError,
  LoadStatus,
} from "@/components/request-status/request-status-style";
import { DeleteStudentModal } from "../../delete-student-modal";
import {
  parseStudentNumber,
  STUDENT_EMAIL_INPUT_PATTERN,
  toStudentRequest,
} from "../../student-content";
import {
  Actions,
  ActionGroup,
  Calculated,
  CancelLink,
  ClubRow,
  DeleteButton,
  Field,
  FieldLabel,
  HelpText,
  ListLink,
  Note,
  NumberFields,
  PageDescription,
  PageHead,
  PageTitle,
  ReadonlyInput,
  RegisterForm,
  RegisterPage,
  Required,
  RetryButton,
  SaveButton,
  SmallLink,
} from "../../new/page-style";

function StudentForm({ student }: { student: StudentResponse }) {
  const router = useRouter();
  const initialStudentNumber = String(student.studentNumber);
  const initialName = student.name;
  const initialBirthday = student.birthDate;
  const initialEmail = student.email;
  const [studentNumber, setStudentNumber] = useState(initialStudentNumber);
  const [name, setName] = useState(initialName);
  const [birthday, setBirthday] = useState(initialBirthday);
  const [email, setEmail] = useState(initialEmail);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  // 진행 중인 저장 요청. 화면을 떠나면 취소해서 다른 화면을 목록으로 덮어쓰지 않게 함
  const requestRef = useRef<AbortController | null>(null);

  const parsedNumber = parseStudentNumber(studentNumber);

  // 다른 페이지로 이동해도 화면이 숨겨진 채 상태가 남으므로,
  // 다시 들어오면 처음 값으로 보이도록 숨겨질 때 초기화
  useLayoutEffect(() => {
    return () => {
      requestRef.current?.abort();
      requestRef.current = null;
      setStudentNumber(initialStudentNumber);
      setName(initialName);
      setBirthday(initialBirthday);
      setEmail(initialEmail);
      setDeleteOpen(false);
      setSubmitting(false);
      setError("");
    };
  }, [initialStudentNumber, initialName, initialBirthday, initialEmail]);

  const goToList = () => router.push("/student");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const body = toStudentRequest({ studentNumber, name, birthday, email });
    if (!body) return;

    const request = new AbortController();
    requestRef.current = request;
    setSubmitting(true);
    setError("");
    try {
      await updateStudent(student.id, body, request.signal);
      if (!request.signal.aborted) {
        // 목록으로 가는 동안 저장을 한 번 더 누르지 않도록 잠금을 풀지 않음
        requestRef.current = null;
        goToList();
      }
    } catch (saveError) {
      if (isAbortError(saveError) || request.signal.aborted) return;
      setError(errorMessage(saveError, "학생 정보를 저장하지 못했습니다."));
    } finally {
      if (requestRef.current === request) {
        requestRef.current = null;
        setSubmitting(false);
      }
    }
  };

  return (
    <RegisterPage>
      <PageHead>
        <PageTitle>학생 수정</PageTitle>
        <PageDescription>
          {student.name} · {student.grade}학년 {student.classNum}반{" "}
          {student.number}번
        </PageDescription>
      </PageHead>

      <RegisterForm onSubmit={handleSubmit}>
        <NumberFields>
          <Field>
            <FieldLabel>
              학번<Required>*</Required>
            </FieldLabel>
            <input
              required
              inputMode="numeric"
              maxLength={4}
              pattern="[0-9]{4}"
              value={studentNumber}
              disabled={submitting}
              onChange={(event) =>
                setStudentNumber(
                  event.target.value.replace(/\D/g, "").slice(0, 4),
                )
              }
            />
          </Field>
          <Field>
            <FieldLabel>자동 계산</FieldLabel>
            <Calculated>
              {parsedNumber
                ? `${parsedNumber.grade}학년 ${parsedNumber.classNumber}반 ${parsedNumber.number}번`
                : "학번을 입력하면 표시됩니다"}
            </Calculated>
          </Field>
        </NumberFields>
        <HelpText>
          1000 ~ 3999 범위의 4자리입니다. 앞 1자리가 학년 · 다음 1자리가 반 ·
          마지막 2자리가 번호입니다. 같은 학번이 이미 있으면 저장할 때 막힙니다.
        </HelpText>

        <Field>
          <FieldLabel>
            이름<Required>*</Required>
          </FieldLabel>
          <input
            required
            maxLength={STUDENT_NAME_MAX_LENGTH}
            value={name}
            disabled={submitting}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel>
            생일<Required>*</Required>
          </FieldLabel>
          <input
            required
            type="text"
            inputMode="numeric"
            maxLength={10}
            pattern="\d{4}-\d{2}-\d{2}"
            value={birthday}
            disabled={submitting}
            onChange={(event) =>
              setBirthday(
                event.target.value.replace(/[^\d-]/g, "").slice(0, 10),
              )
            }
          />
        </Field>
        <Field>
          <FieldLabel>
            학교 이메일<Required>*</Required>
          </FieldLabel>
          <input
            required
            type="email"
            pattern={STUDENT_EMAIL_INPUT_PATTERN}
            value={email}
            disabled={submitting}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Note>@dsm.hs.kr 형식만 등록됩니다.</Note>
        </Field>
        <Field>
          <FieldLabel>소속 동아리</FieldLabel>
          <ClubRow>
            <ReadonlyInput
              readOnly
              value={student.club?.name ?? "아직 소속 동아리가 없습니다"}
            />
            <SmallLink href="/club">동아리에서 관리</SmallLink>
          </ClubRow>
          <Note>
            읽기 전용입니다. 동아리 관리에서 구성원을 추가·제거하면 여기에
            반영됩니다.
          </Note>
        </Field>

        {error && <FormError role="alert">{error}</FormError>}

        <Actions>
          <DeleteButton
            type="button"
            disabled={submitting}
            onClick={() => setDeleteOpen(true)}
          >
            삭제
          </DeleteButton>
          <ActionGroup>
            <CancelLink
              href="/student"
              aria-disabled={submitting}
              // 링크라 disabled가 없어 저장 중에는 이동을 막음
              onClick={(event) => {
                if (submitting) event.preventDefault();
              }}
            >
              취소
            </CancelLink>
            <SaveButton type="submit" disabled={submitting}>
              {submitting ? "저장 중…" : "저장"}
            </SaveButton>
          </ActionGroup>
        </Actions>
      </RegisterForm>
      {deleteOpen && (
        <DeleteStudentModal
          student={student}
          onClose={() => setDeleteOpen(false)}
          onDeleted={goToList}
        />
      )}
    </RegisterPage>
  );
}

// 수정 화면. 학생을 불러온 뒤 폼을 띄움
export function StudentEditForm({ id }: { id: string }) {
  const router = useRouter();
  const [student, setStudent] = useState<StudentResponse | null>(null);
  const [loadError, setLoadError] = useState<{
    message: string;
    notFound: boolean;
  } | null>(null);
  // 바뀌면 학생을 다시 불러옴 (다시 시도)
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // 로그인 여부는 저장소를 읽어야 해서 렌더 중이 아니라 effect에서 확인
    if (!api.auth.isLoggedIn()) {
      router.replace("/login");
      return;
    }
    const request = new AbortController();
    fetchStudent(id, request.signal)
      .then((loaded) => {
        setStudent(loaded);
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (isAbortError(error) || request.signal.aborted) return;
        setLoadError({
          message: errorMessage(error, "학생 정보를 불러오지 못했습니다."),
          notFound: isNotFoundError(error),
        });
      });
    return () => request.abort();
  }, [id, router, reloadKey]);

  // 같은 학생을 다시 불러와도 입력 중인 폼이 초기화되지 않도록 저장된 값으로 폼을 구분
  // (학생 응답에 수정일시가 없음). 소속 동아리는 폼 상태가 아니라 새 값이 바로 보임
  if (student && !loadError) {
    return (
      <StudentForm
        key={`${student.id}-${student.studentNumber}-${student.name}-${student.birthDate}-${student.email}`}
        student={student}
      />
    );
  }

  return (
    <RegisterPage>
      <PageHead>
        <PageTitle>학생 수정</PageTitle>
      </PageHead>
      {loadError ? (
        <LoadStatus role="alert">
          <p>{loadError.message}</p>
          <ActionGroup>
            {/* 없는 학생(404)은 다시 불러와도 같으므로 목록으로만 보냄 */}
            {!loadError.notFound && (
              <RetryButton
                type="button"
                onClick={() => {
                  setLoadError(null);
                  setReloadKey((key) => key + 1);
                }}
              >
                다시 시도
              </RetryButton>
            )}
            <ListLink href="/student">목록으로</ListLink>
          </ActionGroup>
        </LoadStatus>
      ) : (
        <LoadStatus role="status">
          <p>학생 정보를 불러오는 중입니다.</p>
        </LoadStatus>
      )}
    </RegisterPage>
  );
}
