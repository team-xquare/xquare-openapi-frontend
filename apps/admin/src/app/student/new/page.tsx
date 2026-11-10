"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
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

    const validNumber = /^(1|2|3)\d{3}$/.test(studentNumber);
    const validBirthday = /^\d{4}-\d{2}-\d{2}$/.test(birthday);
    const validEmail = /@dsm\.hs\.kr$/.test(email);
    if (!validNumber || !name.trim() || !validBirthday || !validEmail) return;

    router.push("/student");
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
            placeholder="2009-07-28"
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
            placeholder="junseo@dsm.hs.kr"
            pattern=".+@dsm\\.hs\\.kr"
            value={email}
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

        <Actions>
          <CancelLink href="/student">취소</CancelLink>
          <SaveButton type="submit">저장</SaveButton>
        </Actions>
      </RegisterForm>
    </RegisterPage>
  );
}
