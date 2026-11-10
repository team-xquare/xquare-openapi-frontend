"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Teacher } from "../../teacher-content";
import { DeleteModal } from "@/components/delete-modal";
import {
  CancelLink,
  ClubRow,
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
} from "../../../student/new/page-style";
import {
  Checkbox,
  CheckboxGroup,
  CheckboxLabel,
  SelectionNote,
  TwoFields,
  EditBottomActions,
  EditActionGroup,
} from "../../new/page-style";
import { DeleteButton } from "../../../student/new/page-style";

export function TeacherEditForm({ teacher }: { teacher: Teacher }) {
  const router = useRouter();
  const [name, setName] = useState(teacher.name);
  const [subject, setSubject] = useState(teacher.subject);
  const [office, setOffice] = useState(teacher.office);
  const [position, setPosition] = useState(teacher.position);
  const [isLeader, setIsLeader] = useState(teacher.isClubLeader);
  const [isHomeroom, setIsHomeroom] = useState(teacher.grade !== null);
  const [grade, setGrade] = useState(String(teacher.grade ?? ""));
  const [classNumber, setClassNumber] = useState(
    String(teacher.classNumber ?? ""),
  );
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !subject || !office.trim() || !position) return;
    if (isHomeroom && (!grade || !classNumber)) return;
    router.push("/teacher");
  };

  const handleHomeroomChange = (checked: boolean) => {
    setIsHomeroom(checked);
    if (!checked) {
      setGrade("");
      setClassNumber("");
    }
  };

  const confirmDelete = () => {
    router.push("/teacher");
  };

  return (
    <RegisterPage>
      <PageHead>
        <PageTitle>교직원 수정</PageTitle>
        <PageDescription>
          {teacher.name} · {teacher.subject} · {teacher.office} ·{" "}
          {teacher.grade
            ? `${teacher.grade}학년 ${teacher.classNumber}반 담임`
            : "담임 아님"}
        </PageDescription>
      </PageHead>

      <RegisterForm id="teacher-edit-form" onSubmit={handleSubmit}>
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
            담당 과목<Required>*</Required>
          </FieldLabel>
          <select
            required
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          >
            <option value="">과목을 선택하세요</option>
            <option value="수학">수학</option>
            <option value="대수">대수</option>
            <option value="영어">영어</option>
            <option value="자바">자바</option>
            <option value="음악">음악</option>
          </select>
          <SelectionNote>수학 · 대수 · 영어 · 자바 · 음악</SelectionNote>
        </Field>

        <Field>
          <FieldLabel>
            교무실<Required>*</Required>
          </FieldLabel>
          <input
            required
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
            value={position}
            onChange={(event) => setPosition(event.target.value)}
          >
            <option value="">직책을 선택하세요</option>
            <option value="교무부">교무부</option>
            <option value="산학협력부">산학협력부</option>
            <option value="마이스터부">마이스터부</option>
          </select>
          <SelectionNote>교무부 · 산학협력부 · 마이스터부</SelectionNote>
        </Field>

        <CheckboxGroup>
          <CheckboxLabel>
            <Checkbox
              type="checkbox"
              checked={isLeader}
              onChange={(event) => setIsLeader(event.target.checked)}
            />
            부장
          </CheckboxLabel>
          <CheckboxLabel>
            <Checkbox
              type="checkbox"
              checked={isHomeroom}
              onChange={(event) => handleHomeroomChange(event.target.checked)}
            />
            담임을 맡습니다
          </CheckboxLabel>
        </CheckboxGroup>

        <TwoFields>
          <Field>
            <FieldLabel>담당 학년</FieldLabel>
            <select
              disabled={!isHomeroom}
              value={grade}
              onChange={(event) => setGrade(event.target.value)}
            >
              <option value="">선택</option>
              <option value="1">1학년</option>
              <option value="2">2학년</option>
              <option value="3">3학년</option>
            </select>
          </Field>
          <Field>
            <FieldLabel>담당 반</FieldLabel>
            <select
              disabled={!isHomeroom}
              value={classNumber}
              onChange={(event) => setClassNumber(event.target.value)}
            >
              <option value="">선택</option>
              <option value="1">1반</option>
              <option value="2">2반</option>
              <option value="3">3반</option>
              <option value="4">4반</option>
            </select>
          </Field>
        </TwoFields>
        <Note>담임 체크를 끄면 두 칸이 빈 값으로 저장됩니다.</Note>

        <Field>
          <FieldLabel>담당 동아리</FieldLabel>
          <ClubRow>
            <ReadonlyInput readOnly value={teacher.club} />
            <SmallLink href="/club">동아리에서 관리</SmallLink>
          </ClubRow>
          <Note>
            읽기 전용입니다. 동아리 관리에서 담당 선생님으로 지정하면 여기에
            나타납니다.
          </Note>
        </Field>
      </RegisterForm>

      <EditBottomActions>
        <DeleteButton type="button" onClick={() => setDeleteOpen(true)}>
          삭제
        </DeleteButton>
        <EditActionGroup>
          <CancelLink href="/teacher">취소</CancelLink>
          <SaveButton type="submit" form="teacher-edit-form">
            저장
          </SaveButton>
        </EditActionGroup>
      </EditBottomActions>
      {deleteOpen && (
        <DeleteModal
          title={`${teacher.name} 교직원을 삭제할까요?`}
          relations={[
            {
              title: `담당 동아리 ${teacher.club}`,
              description: `${teacher.club}의 담당 선생님이 미지정으로 바뀝니다`,
            },
            {
              title: "자습 감독 배정",
              description: "해당 교직원의 자습 감독 배정이 함께 정리됩니다",
            },
            ...(teacher.grade
              ? [
                  {
                    title: `${teacher.grade}학년 ${teacher.classNumber}반 담임`,
                    description: "담임 정보가 함께 지워집니다",
                  },
                ]
              : []),
          ]}
          onCancel={() => setDeleteOpen(false)}
          onConfirm={confirmDelete}
        />
      )}
    </RegisterPage>
  );
}
