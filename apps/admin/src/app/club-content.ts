export interface Club {
  // 홈의 `지정` 링크(/club/daus/edit)와 같이 영문 소문자 id
  id: string;
  name: string;
  room: string;
  leaderId: string;
  teacher?: string;
  logoFileName?: string;
}

export interface Student {
  // 학번 (학년 + 반 + 두 자리 번호, 예: 2학년 3반 15번 → 2315)
  id: string;
  name: string;
  grade: number;
  classNumber: number;
  number: number;
  clubId?: string;
}

export const CLUB_NAME_MAX_LENGTH = 30;

// 동아리 API 연동 전까지 쓰는 더미 데이터 (Figma 기준)
export const CLUBS: Club[] = [
  {
    id: "dms",
    name: "DMS",
    room: "소프트웨어개발실",
    leaderId: "2315",
    teacher: "홍길동",
    logoFileName: "logo_dms_2026.png",
  },
  {
    id: "pick",
    name: "PiCK",
    room: "세미나 1-2",
    leaderId: "2207",
    teacher: "이진경",
  },
  {
    id: "xquare",
    name: "XQUARE",
    room: "세미나 2-3",
    leaderId: "3203",
    teacher: "정은진",
  },
  {
    id: "b1nd",
    name: "B1ND",
    room: "임베디드실",
    leaderId: "3104",
    teacher: "김선생",
  },
  { id: "daus", name: "DAUS", room: "세미나 1-1", leaderId: "2101" },
];

// 교실 · 교직원 API 연동 전이라 선택 목록도 더미로 둠
export const ROOMS = [
  "소프트웨어개발실",
  "임베디드실",
  "세미나 1-1",
  "세미나 1-2",
  "세미나 1-3",
  "세미나 2-1",
  "세미나 2-2",
  "세미나 2-3",
  "세미나 3-1",
  "세미나 3-2",
];

export const TEACHERS = [
  "홍길동",
  "이진경",
  "정은진",
  "김선생",
  "박지현",
  "박선생",
  "김영희",
];

const student = (
  name: string,
  grade: number,
  classNumber: number,
  number: number,
  clubId?: string,
): Student => ({
  id: `${grade}${classNumber}${String(number).padStart(2, "0")}`,
  name,
  grade,
  classNumber,
  number,
  clubId,
});

export const STUDENTS: Student[] = [
  // DMS (팀장이 먼저)
  student("장윤호", 2, 3, 15, "dms"),
  student("이서연", 2, 3, 2, "dms"),
  student("정하준", 2, 1, 9, "dms"),
  student("윤지우", 1, 2, 11, "dms"),
  student("오민재", 3, 4, 5, "dms"),
  // PiCK
  student("김민수", 2, 2, 7, "pick"),
  student("장윤서", 1, 1, 8, "pick"),
  student("한지민", 3, 1, 12, "pick"),
  // XQUARE
  student("강도윤", 3, 2, 3, "xquare"),
  student("서하은", 3, 2, 14, "xquare"),
  student("문준혁", 2, 4, 6, "xquare"),
  student("배수아", 2, 1, 17, "xquare"),
  student("신우진", 1, 4, 2, "xquare"),
  student("권나연", 1, 3, 19, "xquare"),
  student("황민호", 3, 3, 8, "xquare"),
  student("송예린", 2, 2, 20, "xquare"),
  // B1ND
  student("박서준", 3, 1, 4, "b1nd"),
  student("조은우", 3, 4, 16, "b1nd"),
  student("임채원", 2, 3, 10, "b1nd"),
  student("안시후", 2, 4, 13, "b1nd"),
  student("홍유나", 1, 1, 15, "b1nd"),
  student("류건우", 1, 2, 3, "b1nd"),
  // DAUS
  student("최유진", 2, 1, 1, "daus"),
  student("노하람", 2, 2, 11, "daus"),
  student("남도현", 1, 4, 9, "daus"),
  student("유서진", 1, 3, 7, "daus"),
  // 소속 없음
  student("장윤재", 3, 2, 21),
  student("정서윤", 1, 3, 4),
  student("김하늘", 1, 1, 1),
  student("이도윤", 2, 4, 18),
];

export const formatStudentClass = (student: Student) =>
  `${student.grade}학년 ${student.classNumber}반 ${student.number}번`;

export const findStudent = (id: string) =>
  STUDENTS.find((student) => student.id === id);

export const findClub = (id: string) => CLUBS.find((club) => club.id === id);

// 팀장을 맨 앞에 둠
export const getClubMembers = (club: Club) =>
  STUDENTS.filter((student) => student.clubId === club.id).sort(
    (a, b) => Number(b.id === club.leaderId) - Number(a.id === club.leaderId),
  );

const MAX_SEARCH_RESULTS = 8;

// 이름 일부 또는 학번 앞자리로 찾음
export const searchStudents = (query: string) => {
  const keyword = query.trim();
  if (!keyword) return [];

  return STUDENTS.filter((student) =>
    /^\d+$/.test(keyword)
      ? student.id.startsWith(keyword)
      : student.name.includes(keyword),
  ).slice(0, MAX_SEARCH_RESULTS);
};
