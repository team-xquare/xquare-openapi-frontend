"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
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
} from "../../student/new/page-style";
import {
  Checkbox,
  CheckboxGroup,
  CheckboxLabel,
  SelectionNote,
  TwoFields,
  BottomActions,
} from "./page-style";

export default function TeacherRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [office, setOffice] = useState("");
  const [position, setPosition] = useState("");
  const [isHomeroom, setIsHomeroom] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !subject || !office.trim() || !position) return;
    router.push("/teacher");
  };

  return (
    <RegisterPage>
      <PageHead>
        <PageTitle>교직원 등록</PageTitle>
        <PageDescription>
          새 교직원을 등록합니다. 동아리는 등록 후 동아리 관리에서 연결합니다.
        </PageDescription>
      </PageHead>

      <RegisterForm id="teacher-register-form" onSubmit={handleSubmit}>
        <Field>
          <FieldLabel>
            이름<Required>*</Required>
          </FieldLabel>
          <input
            required
            placeholder="홍길동"
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
            placeholder="3층 교무실"
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
            <Checkbox type="checkbox" />
            부장
          </CheckboxLabel>
          <CheckboxLabel>
            <Checkbox
              type="checkbox"
              checked={isHomeroom}
              onChange={(event) => setIsHomeroom(event.target.checked)}
            />
            담임을 맡습니다
          </CheckboxLabel>
        </CheckboxGroup>

        <TwoFields>
          <Field>
            <FieldLabel>담당 학년</FieldLabel>
            <select disabled={!isHomeroom}>
              <option>선택</option>
              <option>1학년</option>
              <option>2학년</option>
              <option>3학년</option>
            </select>
          </Field>
          <Field>
            <FieldLabel>담당 반</FieldLabel>
            <select disabled={!isHomeroom}>
              <option>선택</option>
              <option>1반</option>
              <option>2반</option>
              <option>3반</option>
              <option>4반</option>
            </select>
          </Field>
        </TwoFields>
        <Note>담임 체크를 끄면 두 칸이 빈 값으로 저장됩니다.</Note>

        <Field>
          <FieldLabel>담당 동아리</FieldLabel>
          <ClubRow>
            <ReadonlyInput readOnly value="담당 동아리 없음" />
            <SmallLink href="/club">동아리에서 관리</SmallLink>
          </ClubRow>
          <Note>
            읽기 전용입니다. 동아리 관리에서 담당 선생님으로 지정하면 여기에
            나타납니다.
          </Note>
        </Field>
      </RegisterForm>

      <BottomActions>
        <CancelLink href="/teacher">취소</CancelLink>
        <SaveButton type="submit" form="teacher-register-form">
          저장
        </SaveButton>
      </BottomActions>
    </RegisterPage>
  );
}
