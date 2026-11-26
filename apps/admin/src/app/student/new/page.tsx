"use client";

import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { errorMessage, isAbortError } from "@/lib/api-error";
import { createStudent, STUDENT_NAME_MAX_LENGTH } from "@/lib/students-api";
import { FormError } from "@/components/request-status/request-status-style";
import {
  parseStudentNumber,
  STUDENT_EMAIL_INPUT_PATTERN,
  toStudentRequest,
} from "../student-content";
import {
  Actions,
  Calculated,
  CancelLink,
  ClubRow,
  Field,
  FieldLabel,
  HelpText,
  Note,
  NumberFields,
  PageDescription,
  PageHead,
  PageTitle,
  ReadonlyInput,
  RegisterForm,
  RegisterPage,
  Required,
  SaveButton,
  SmallLink,
} from "./page-style";

export default function StudentRegisterPage() {
  const router = useRouter();
  const [studentNumber, setStudentNumber] = useState("");
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  // 진행 중인 저장 요청. 화면을 떠나면 취소해서 다른 화면을 목록으로 덮어쓰지 않게 함
  const requestRef = useRef<AbortController | null>(null);

  const parsedNumber = parseStudentNumber(studentNumber);

  // 다른 페이지로 이동해도 화면이 숨겨진 채 상태가 남으므로,
  // 다시 들어오면 빈 폼으로 보이도록 숨겨질 때 초기화
  useLayoutEffect(() => {
    return () => {
      requestRef.current?.abort();
      requestRef.current = null;
      setStudentNumber("");
      setName("");
      setBirthday("");
      setEmail("");
      setSubmitting(false);
      setError("");
    };
  }, []);

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
      await createStudent(body, request.signal);
      if (!request.signal.aborted) {
        // 목록으로 가는 동안 저장을 한 번 더 누르지 않도록 잠금을 풀지 않음
        requestRef.current = null;
        router.push("/student");
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
        <PageTitle>학생 등록</PageTitle>
        <PageDescription>
          새 학생을 등록합니다. 동아리는 등록 후 동아리 관리에서 넣습니다.
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
              placeholder="1207"
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
            placeholder="김준서"
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
            placeholder="2009-07-28"
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
            placeholder="junseo@dsm.hs.kr"
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
            <ReadonlyInput readOnly value="아직 소속 동아리가 없습니다" />
            <SmallLink href="/club">동아리에서 관리</SmallLink>
          </ClubRow>
          <Note>
            읽기 전용입니다. 동아리 관리에서 구성원을 추가·제거하면 여기에
            반영됩니다.
          </Note>
        </Field>

        {error && <FormError role="alert">{error}</FormError>}

        <Actions>
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
        </Actions>
      </RegisterForm>
    </RegisterPage>
  );
}
