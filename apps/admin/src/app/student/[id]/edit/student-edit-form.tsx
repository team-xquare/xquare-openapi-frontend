"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Student } from "../../student-content";
import { DeleteStudentModal } from "../../delete-student-modal";
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
} from "../../new/page-style";

export function StudentEditForm({ student }: { student: Student }) {
  const router = useRouter();
  const [studentNumber, setStudentNumber] = useState(
    `${student.grade}${student.classNumber}${String(student.number).padStart(2, "0")}`,
  );
  const [name, setName] = useState(student.name);
  const [birthday, setBirthday] = useState(student.birthday ?? "2009-07-28");
  const [email, setEmail] = useState(student.email);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const parsedNumber = useMemo(() => {
    if (!/^\d{4}$/.test(studentNumber)) return null;
    return {
      grade: studentNumber[0],
      classNumber: studentNumber[1],
      number: studentNumber.slice(2),
    };
  }, [studentNumber]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !/^(1|2|3)\d{3}$/.test(studentNumber) ||
      !name.trim() ||
      !/^\d{4}-\d{2}-\d{2}$/.test(birthday) ||
      !/@dsm\.hs\.kr$/.test(email)
    ) {
      return;
    }
    router.push("/student");
  };

  const confirmDelete = () => {
    router.push("/student");
  };

  return (
    <RegisterPage>
      <PageHead>
        <PageTitle>학생 수정</PageTitle>
        <PageDescription>
          {student.name} · {student.grade}학년 {student.classNumber}반{" "}
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
                ? `${parsedNumber.grade}학년 ${parsedNumber.classNumber}반 ${parsedNumber.number}번 · ${student.department}`
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
            value={name}
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
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Note>@dsm.hs.kr 형식만 등록됩니다.</Note>
        </Field>
        <Field>
          <FieldLabel>소속 동아리</FieldLabel>
          <ClubRow>
            <ReadonlyInput readOnly value={student.club} />
            <SmallLink href="/club">동아리에서 관리</SmallLink>
          </ClubRow>
          <Note>
            읽기 전용입니다. 동아리 관리에서 구성원을 추가·제거하면 여기에
            반영됩니다.
          </Note>
        </Field>

        <Actions>
          <DeleteButton type="button" onClick={() => setDeleteOpen(true)}>
            삭제
          </DeleteButton>
          <ActionGroup>
            <CancelLink href="/student">취소</CancelLink>
            <SaveButton type="submit">저장</SaveButton>
          </ActionGroup>
        </Actions>
      </RegisterForm>
      {deleteOpen && (
        <DeleteStudentModal
          student={student}
          onCancel={() => setDeleteOpen(false)}
          onConfirm={confirmDelete}
        />
      )}
    </RegisterPage>
  );
}
