import {
  STUDENT_EMAIL_PATTERN,
  STUDENT_NAME_MAX_LENGTH,
  type StudentRequest,
  type StudentResponse,
} from "@/lib/students-api";

// 입력 칸 pattern 속성용. pattern은 값 전체를 맞춰 보므로 ^ · $를 뺌
export const STUDENT_EMAIL_INPUT_PATTERN = STUDENT_EMAIL_PATTERN.source.slice(
  1,
  -1,
);

// 학번 4자리를 학년 · 반 · 번호로 나눔 (2315 → 2학년 3반 15번). 4자리가 아니면 null
export function parseStudentNumber(value: string) {
  if (!/^\d{4}$/.test(value)) return null;
  return {
    grade: Number(value[0]),
    classNumber: Number(value[1]),
    number: Number(value.slice(2)),
  };
}

export type StudentFormValues = {
  studentNumber: string;
  name: string;
  birthday: string;
  email: string;
};

// 입력값을 등록 · 수정 본문으로 바꿈. 서버 검증에 걸릴 값이면 null
export function toStudentRequest(
  values: StudentFormValues,
): StudentRequest | null {
  const name = values.name.trim();
  const email = values.email.trim();
  if (
    !/^[1-3]\d{3}$/.test(values.studentNumber) ||
    !name ||
    name.length > STUDENT_NAME_MAX_LENGTH ||
    !/^\d{4}-\d{2}-\d{2}$/.test(values.birthday) ||
    !STUDENT_EMAIL_PATTERN.test(email)
  ) {
    return null;
  }
  return {
    // 학년 · 반 · 번호는 서버가 학번으로 나눔
    studentNumber: Number(values.studentNumber),
    name,
    birthDate: values.birthday,
    email,
  };
}

// 학생 응답에는 팀장 여부 · 구성원 수가 없어 소속 동아리만 알림
export function getStudentDeleteRelations(
  student: Pick<StudentResponse, "club">,
) {
  if (!student.club) return [];
  return [
    {
      title: `소속 동아리 ${student.club.name}`,
      description: "학생이 동아리 구성원 목록에서 제외됩니다",
    },
  ];
}
