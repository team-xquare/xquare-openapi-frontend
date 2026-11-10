export type Teacher = {
  id: string;
  name: string;
  grade: number | null;
  classNumber: number | null;
  subject: string;
  office: string;
  position: string;
  club: string;
  isClubLeader: boolean;
};

export const TEACHERS: Teacher[] = [
  {
    id: "teacher-1",
    name: "홍길동",
    grade: 1,
    classNumber: 2,
    subject: "수학",
    office: "3층 교무실",
    position: "교무부",
    club: "DMS",
    isClubLeader: true,
  },
  {
    id: "teacher-2",
    name: "이진경",
    grade: 2,
    classNumber: 3,
    subject: "자바",
    office: "2층 교무실",
    position: "마이스터부",
    club: "PiCK",
    isClubLeader: false,
  },
  {
    id: "teacher-3",
    name: "정은진",
    grade: null,
    classNumber: null,
    subject: "영어",
    office: "3층 교무실",
    position: "산학협력부",
    club: "XQUARE",
    isClubLeader: false,
  },
  {
    id: "teacher-4",
    name: "김선생",
    grade: 3,
    classNumber: 1,
    subject: "대수",
    office: "4층 교무실",
    position: "교무부",
    club: "B1ND",
    isClubLeader: false,
  },
  {
    id: "teacher-5",
    name: "박선생",
    grade: null,
    classNumber: null,
    subject: "음악",
    office: "2층 교무실",
    position: "마이스터부",
    club: "없음",
    isClubLeader: true,
  },
];
