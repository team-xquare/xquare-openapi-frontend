export type Student = {
  id: string;
  grade: number;
  classNumber: number;
  number: number;
  department: string;
  name: string;
  email: string;
  club: string;
  birthday?: string;
  isClubLeader?: boolean;
  clubMemberCount?: number;
};

export const STUDENTS: Student[] = [
  {
    id: "student-1",
    grade: 2,
    classNumber: 3,
    number: 15,
    department: "임베디드소프트웨어과",
    name: "장윤호",
    email: "example@dsm.hs.kr",
    club: "DMS",
    birthday: "2009-07-28",
    isClubLeader: true,
    clubMemberCount: 5,
  },
  {
    id: "student-2",
    grade: 2,
    classNumber: 3,
    number: 16,
    department: "임베디드소프트웨어과",
    name: "김민수",
    email: "minsu@dsm.hs.kr",
    club: "PiCK",
  },
  {
    id: "student-3",
    grade: 1,
    classNumber: 1,
    number: 3,
    department: "소프트웨어개발과",
    name: "강도윤",
    email: "doyun@dsm.hs.kr",
    club: "XQUARE",
  },
  {
    id: "student-4",
    grade: 3,
    classNumber: 2,
    number: 7,
    department: "소프트웨어개발과",
    name: "박서준",
    email: "seojun@dsm.hs.kr",
    club: "B1ND",
  },
  {
    id: "student-5",
    grade: 1,
    classNumber: 4,
    number: 22,
    department: "인공지능소프트웨어과",
    name: "최유진",
    email: "yujin@dsm.hs.kr",
    club: "DAUS",
  },
  {
    id: "student-6",
    grade: 2,
    classNumber: 1,
    number: 8,
    department: "소프트웨어개발과",
    name: "이서연",
    email: "seoyeon@dsm.hs.kr",
    club: "DMS",
  },
  {
    id: "student-7",
    grade: 3,
    classNumber: 3,
    number: 11,
    department: "인공지능소프트웨어과",
    name: "정하준",
    email: "hajun@dsm.hs.kr",
    club: "PiCK",
  },
  {
    id: "student-8",
    grade: 1,
    classNumber: 2,
    number: 14,
    department: "임베디드소프트웨어과",
    name: "한지훈",
    email: "jihoon@dsm.hs.kr",
    club: "XQUARE",
  },
  {
    id: "student-9",
    grade: 2,
    classNumber: 4,
    number: 4,
    department: "소프트웨어개발과",
    name: "오지민",
    email: "jimin@dsm.hs.kr",
    club: "B1ND",
  },
  {
    id: "student-10",
    grade: 3,
    classNumber: 1,
    number: 19,
    department: "임베디드소프트웨어과",
    name: "윤채원",
    email: "chaewon@dsm.hs.kr",
    club: "DAUS",
  },
  {
    id: "student-11",
    grade: 1,
    classNumber: 3,
    number: 10,
    department: "인공지능소프트웨어과",
    name: "김도현",
    email: "dohyun@dsm.hs.kr",
    club: "DMS",
  },
  {
    id: "student-12",
    grade: 3,
    classNumber: 4,
    number: 2,
    department: "소프트웨어개발과",
    name: "배수빈",
    email: "subin@dsm.hs.kr",
    club: "PiCK",
  },
];

export function getStudentDeleteRelations(student: Student) {
  if (student.club === "미가입" || student.club === "없음") return [];

  const relations = [
    {
      title: `소속 동아리 ${student.club}`,
      description: "학생이 동아리 구성원 목록에서 제외됩니다",
    },
  ];

  if (student.isClubLeader) {
    relations.unshift({
      title: `${student.club} 팀장`,
      description: "팀장 정보가 비게 됩니다. 동아리 수정에서 새 팀장을 정해 주세요",
    });
  }

  if (student.clubMemberCount !== undefined) {
    relations.push({
      title: `${student.club} 구성원 ${student.clubMemberCount}명`,
      description: `구성원 목록에서 빠져 ${Math.max(0, student.clubMemberCount - 1)}명이 됩니다`,
    });
  }

  return relations;
}
