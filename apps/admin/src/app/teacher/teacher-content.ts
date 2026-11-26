import {
  TEACHER_POSITIONS,
  TEACHER_SUBJECTS,
  type TeacherPosition,
  type TeacherResponse,
  type TeacherSubject,
} from "@/lib/teachers-api";

// 과목 · 부서 enum을 화면에 보일 이름. 서버는 enum 이름만 주므로 기존 화면 문구에 맞춤
export const TEACHER_SUBJECT_LABELS: Record<TeacherSubject, string> = {
  MATH: "수학",
  ALGEBRA: "대수",
  ENGLISH: "영어",
  JAVA: "자바",
  MUSIC: "음악",
};

export const TEACHER_POSITION_LABELS: Record<TeacherPosition, string> = {
  ACADEMIC_AFFAIRS: "교무부",
  INDUSTRY_COOPERATION: "산학협력부",
  MEISTER: "마이스터부",
};

// 선택지 아래 안내 문구 ("수학 · 대수 · …"). 이름이 바뀌어도 같이 바뀌도록 위 이름으로 만듦
export const TEACHER_SUBJECT_NOTE = TEACHER_SUBJECTS.map(
  (subject) => TEACHER_SUBJECT_LABELS[subject],
).join(" · ");
export const TEACHER_POSITION_NOTE = TEACHER_POSITIONS.map(
  (position) => TEACHER_POSITION_LABELS[position],
).join(" · ");

// 담임 학년 · 반 선택지. 서버는 반을 9반까지 받지만 기존 화면처럼 4반까지만 보여 줌
export const TEACHER_GRADES = [1, 2, 3];
export const TEACHER_CLASS_NUMBERS = [1, 2, 3, 4];

// 담임이면 "1학년 2반", 아니면 null
export const formatHomeroom = ({
  grade,
  classNum,
}: Pick<TeacherResponse, "grade" | "classNum">) =>
  grade !== null && classNum !== null ? `${grade}학년 ${classNum}반` : null;
