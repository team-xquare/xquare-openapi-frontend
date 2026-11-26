"use client";

import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FormError } from "@/components/request-status/request-status-style";
import { errorMessage, isAbortError } from "@/lib/api-error";
import {
  TEACHER_NAME_MAX_LENGTH,
  TEACHER_OFFICE_MAX_LENGTH,
  TEACHER_POSITIONS,
  TEACHER_SUBJECTS,
  createTeacher,
  updateTeacher,
  type TeacherPosition,
  type TeacherRequest,
  type TeacherResponse,
  type TeacherSubject,
} from "@/lib/teachers-api";
import { DeleteTeacherModal } from "./delete-teacher-modal";
import {
  TEACHER_CLASS_NUMBERS,
  TEACHER_GRADES,
  TEACHER_POSITION_LABELS,
  TEACHER_POSITION_NOTE,
  TEACHER_SUBJECT_LABELS,
  TEACHER_SUBJECT_NOTE,
  formatHomeroom,
} from "./teacher-content";
import {
  CancelLink,
  ClubRow,
  DeleteButton,
  Field,
  FieldLabel,
  Note,
  PageDescription,
  PageHead,
  PageTitle,
  ReadonlyInput,
  RegisterForm,
  RegisterPage,
  Required,
  SaveButton,
  SmallLink,
} from "../student/new/page-style";
import {
  BottomActions,
  Checkbox,
  CheckboxGroup,
  CheckboxLabel,
  EditActionGroup,
  EditBottomActions,
  SelectionNote,
  TwoFields,
} from "./new/page-style";

// 등록과 수정이 같은 폼을 씀. teacher가 있으면 수정 화면
export function TeacherForm({ teacher }: { teacher?: TeacherResponse }) {
  const router = useRouter();
  const initialName = teacher?.name ?? "";
  const initialSubject: TeacherSubject | "" = teacher?.subject ?? "";
  const initialOffice = teacher?.office ?? "";
  const initialPosition: TeacherPosition | "" = teacher?.position ?? "";
  const initialLeader = teacher?.isManager ?? false;
  const initialGrade = teacher?.grade ? String(teacher.grade) : "";
  const initialClassNumber = teacher?.classNum ? String(teacher.classNum) : "";
  const initialHomeroom = initialGrade !== "" || initialClassNumber !== "";
  const [name, setName] = useState(initialName);
  const [subject, setSubject] = useState(initialSubject);
  const [office, setOffice] = useState(initialOffice);
  const [position, setPosition] = useState(initialPosition);
  const [isLeader, setIsLeader] = useState(initialLeader);
  const [isHomeroom, setIsHomeroom] = useState(initialHomeroom);
  const [grade, setGrade] = useState(initialGrade);
  const [classNumber, setClassNumber] = useState(initialClassNumber);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  // 진행 중인 저장 요청. 화면을 떠나면 취소해서 다른 화면을 목록으로 덮어쓰지 않게 함
  const requestRef = useRef<AbortController | null>(null);

  const formId = teacher ? "teacher-edit-form" : "teacher-register-form";
  const homeroom = teacher ? formatHomeroom(teacher) : null;
  // 서버는 반을 9반까지 받아서, 불러온 반이 선택지에 없으면 덧붙여 그대로 보이게 함
  const classNumbers =
    teacher?.classNum && !TEACHER_CLASS_NUMBERS.includes(teacher.classNum)
      ? [...TEACHER_CLASS_NUMBERS, teacher.classNum]
      : TEACHER_CLASS_NUMBERS;

  // 다른 페이지로 이동해도 화면이 숨겨진 채 상태가 남으므로,
  // 다시 들어오면 처음 값으로 보이도록 숨겨질 때 초기화
  useLayoutEffect(() => {
    return () => {
      requestRef.current?.abort();
      requestRef.current = null;
      setName(initialName);
      setSubject(initialSubject);
      setOffice(initialOffice);
      setPosition(initialPosition);
      setIsLeader(initialLeader);
      setIsHomeroom(initialHomeroom);
      setGrade(initialGrade);
      setClassNumber(initialClassNumber);
      setIsDeleteOpen(false);
      setSubmitting(false);
      setError("");
    };
  }, [
    initialName,
    initialSubject,
    initialOffice,
    initialPosition,
    initialLeader,
    initialHomeroom,
    initialGrade,
    initialClassNumber,
  ]);

  const goToList = () => router.push("/teacher");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    if (!name.trim() || !subject || !office.trim() || !position) return;
    // 서버는 학년 · 반이 둘 다 있거나 둘 다 없어야 받음
    if (isHomeroom && (!grade || !classNumber)) return;

    const request = new AbortController();
    requestRef.current = request;
    setSubmitting(true);
    setError("");
    // 담임이 아니면 학년 · 반을 비워 보내고, 앞뒤 공백은 빼고 보냄
    const body: TeacherRequest = {
      name: name.trim(),
      grade: isHomeroom ? Number(grade) : null,
      classNum: isHomeroom ? Number(classNumber) : null,
      subject,
      office: office.trim(),
      position,
      isManager: isLeader,
    };
    try {
      if (teacher) {
        await updateTeacher(teacher.id, body, request.signal);
      } else {
        await createTeacher(body, request.signal);
      }
      if (!request.signal.aborted) {
        // 목록으로 가는 동안 저장을 한 번 더 누르지 않도록 잠금을 풀지 않음
        requestRef.current = null;
        goToList();
      }
    } catch (saveError) {
      if (isAbortError(saveError) || request.signal.aborted) return;
      setError(errorMessage(saveError, "교직원을 저장하지 못했습니다."));
    } finally {
      if (requestRef.current === request) {
        requestRef.current = null;
        setSubmitting(false);
      }
    }
  };

  const handleHomeroomChange = (checked: boolean) => {
    setIsHomeroom(checked);
    if (!checked) {
      setGrade("");
      setClassNumber("");
    }
  };

  const saveActions = (
    <>
      <CancelLink
        href="/teacher"
        aria-disabled={submitting}
        // 링크라 disabled가 없어서, 저장 중에는 눌러도 이동하지 않게 막음
        onClick={(event) => {
          if (submitting) event.preventDefault();
        }}
      >
        취소
      </CancelLink>
      <SaveButton type="submit" form={formId} disabled={submitting}>
        {submitting ? "저장 중…" : "저장"}
      </SaveButton>
    </>
  );

  return (
    <RegisterPage>
      <PageHead>
        <PageTitle>{teacher ? "교직원 수정" : "교직원 등록"}</PageTitle>
        <PageDescription>
          {teacher
            ? [
                teacher.name,
                teacher.subject && TEACHER_SUBJECT_LABELS[teacher.subject],
                teacher.office,
                homeroom ? `${homeroom} 담임` : "담임 아님",
              ]
                .filter(Boolean)
                .join(" · ")
            : "새 교직원을 등록합니다. 동아리는 등록 후 동아리 관리에서 연결합니다."}
        </PageDescription>
      </PageHead>

      <RegisterForm id={formId} onSubmit={handleSubmit}>
        <Field>
          <FieldLabel>
            이름<Required>*</Required>
          </FieldLabel>
          <input
            required
            placeholder={teacher ? undefined : "홍길동"}
            maxLength={TEACHER_NAME_MAX_LENGTH}
            disabled={submitting}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel>
            담당 과목<Required>*</Required>
          </FieldLabel>
          <select
            required
            disabled={submitting}
            value={subject}
            onChange={(event) =>
              setSubject(event.target.value as TeacherSubject | "")
            }
          >
            <option value="">과목을 선택하세요</option>
            {TEACHER_SUBJECTS.map((option) => (
              <option key={option} value={option}>
                {TEACHER_SUBJECT_LABELS[option]}
              </option>
            ))}
          </select>
          <SelectionNote>{TEACHER_SUBJECT_NOTE}</SelectionNote>
        </Field>

        <Field>
          <FieldLabel>
            교무실<Required>*</Required>
          </FieldLabel>
          <input
            required
            placeholder={teacher ? undefined : "3층 교무실"}
            maxLength={TEACHER_OFFICE_MAX_LENGTH}
            disabled={submitting}
            value={office}
            onChange={(event) => setOffice(event.target.value)}
          />
          <SelectionNote>
            교직원 검색에서 교무실로도 찾을 수 있습니다.
          </SelectionNote>
        </Field>

        <Field>
          <FieldLabel>
            직책<Required>*</Required>
          </FieldLabel>
          <select
            required
            disabled={submitting}
            value={position}
            onChange={(event) =>
              setPosition(event.target.value as TeacherPosition | "")
            }
          >
            <option value="">직책을 선택하세요</option>
            {TEACHER_POSITIONS.map((option) => (
              <option key={option} value={option}>
                {TEACHER_POSITION_LABELS[option]}
              </option>
            ))}
          </select>
          <SelectionNote>{TEACHER_POSITION_NOTE}</SelectionNote>
        </Field>

        <CheckboxGroup>
          <CheckboxLabel>
            <Checkbox
              type="checkbox"
              disabled={submitting}
              checked={isLeader}
              onChange={(event) => setIsLeader(event.target.checked)}
            />
            부장
          </CheckboxLabel>
          <CheckboxLabel>
            <Checkbox
              type="checkbox"
              disabled={submitting}
              checked={isHomeroom}
              onChange={(event) => handleHomeroomChange(event.target.checked)}
            />
            담임을 맡습니다
          </CheckboxLabel>
        </CheckboxGroup>

        <TwoFields>
          <Field>
            <FieldLabel>담당 학년</FieldLabel>
            {/* 담임이면 학년 · 반을 둘 다 골라야 저장됨 */}
            <select
              required={isHomeroom}
              disabled={!isHomeroom || submitting}
              value={grade}
              onChange={(event) => setGrade(event.target.value)}
            >
              <option value="">선택</option>
              {TEACHER_GRADES.map((option) => (
                <option key={option} value={option}>
                  {option}학년
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel>담당 반</FieldLabel>
            <select
              required={isHomeroom}
              disabled={!isHomeroom || submitting}
              value={classNumber}
              onChange={(event) => setClassNumber(event.target.value)}
            >
              <option value="">선택</option>
              {classNumbers.map((option) => (
                <option key={option} value={option}>
                  {option}반
                </option>
              ))}
            </select>
          </Field>
        </TwoFields>
        <Note>담임 체크를 끄면 두 칸이 빈 값으로 저장됩니다.</Note>

        <Field>
          <FieldLabel>담당 동아리</FieldLabel>
          <ClubRow>
            {/* 담당 동아리는 동아리 관리에서만 바꿀 수 있어 이름만 보여 줌 */}
            <ReadonlyInput
              readOnly
              value={teacher?.club?.name ?? "담당 동아리 없음"}
            />
            <SmallLink href="/club">동아리에서 관리</SmallLink>
          </ClubRow>
          <Note>
            읽기 전용입니다. 동아리 관리에서 담당 선생님으로 지정하면 여기에
            나타납니다.
          </Note>
        </Field>
      </RegisterForm>

      {error && <FormError role="alert">{error}</FormError>}

      {teacher ? (
        <EditBottomActions>
          <DeleteButton
            type="button"
            disabled={submitting}
            onClick={() => setIsDeleteOpen(true)}
          >
            삭제
          </DeleteButton>
          <EditActionGroup>{saveActions}</EditActionGroup>
        </EditBottomActions>
      ) : (
        <BottomActions>{saveActions}</BottomActions>
      )}

      {teacher && isDeleteOpen && (
        <DeleteTeacherModal
          teacher={teacher}
          onClose={() => setIsDeleteOpen(false)}
          onDeleted={goToList}
        />
      )}
    </RegisterPage>
  );
}
