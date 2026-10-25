import type { InfoListItem } from "../components";

export interface ApiResponseExample {
  code: string;
  description: string;
  example: string[];
}

export interface ApiDetail {
  // ENDPOINT_GROUPS의 id (상세 경로 /{category}/{id})
  category: string;
  id: string;
  title: string;
  badges: string[];
  basicInfo: InfoListItem[];
  detailInfo: InfoListItem[];
  parameters: InfoListItem[];
  responses: ApiResponseExample[];
  test: {
    method: string;
    url: string;
    // 요청에 채워 넣을 파라미터 입력칸
    fields: { name: string; placeholder: string }[];
    // 실제 호출 연동 전까지 보여줄 예시 응답
    response: { status: string; headers: string[]; body: string[] };
  };
}

// 모든 API에 같은 이용 조건
export const API_LICENSE_INFO: InfoListItem[] = [
  { label: "이용허락범위", value: "이용허락범위 제한 없음" },
  { label: "심의유형", value: "개발단계 : 자동승인 / 운영단계 : 자동승인" },
  {
    label: "신청 가능 트래픽",
    value:
      "개발계정 : 10,000 / 운영계정 : 활용사례 등록시 신청하면 트래픽 증가 가능",
  },
];

export const API_DETAILS: ApiDetail[] = [
  {
    category: "student",
    id: "get-student",
    title: "학생 조회",
    badges: ["JSON"],
    basicInfo: [
      { label: "OpenAPI 명", value: "학생조회" },
      { label: "분류", value: "학생 > 학생 정보" },
      { label: "담당자", value: "XQUARE" },
    ],
    detailInfo: [
      {
        label: "설명",
        value:
          "학생 id로 단건 조회합니다. 학번, 학년, 반, 번호, 이름, 생일, 이메일, 소속 동아리 정보를 반환합니다. 소속 동아리가 없으면 club은 null입니다.",
      },
      { label: "API 유형", value: "REST", isHalf: true },
      { label: "데이터 포맷", value: "JSON", isHalf: true },
      { label: "제약조건", value: "소속 동아리 없으면 club은 null", isHalf: true },
      { label: "기준일", value: "2026-09-12", isHalf: true },
    ],
    parameters: [
      {
        label: "studentId",
        value: "LONG (Path) · 조회할 학생의 id입니다. 예: 1",
      },
    ],
    responses: [
      {
        code: "200",
        description:
          "OK — id, studentNumber, grade, classNum, number, name, birthDate, email, club을 반환합니다.",
        example: [
          "{",
          '  "id": 1,',
          '  "studentNumber": 2315,',
          '  "grade": 2,',
          '  "classNum": 3,',
          '  "number": 15,',
          '  "name": "장윤호",',
          '  "birthDate": "2009-07-28",',
          '  "email": "example@dsm.hs.kr",',
          '  "club": { "id": 1, "name": "DMS", "logo": "image.png" }',
          "}",
        ],
      },
      {
        code: "401",
        description: "INVALID_API_KEY — API 키가 없거나 유효하지 않습니다.",
        example: [
          "{",
          '  "code": "INVALID_API_KEY",',
          '  "message": "API 키가 유효하지 않습니다."',
          "}",
        ],
      },
      {
        code: "404",
        description: "STUDENT_NOT_FOUND — 존재하지 않는 학생 id입니다.",
        example: [
          "{",
          '  "code": "STUDENT_NOT_FOUND",',
          '  "message": "학생을 찾을 수 없습니다."',
          "}",
        ],
      },
    ],
    test: {
      method: "GET",
      url: "https://open.xquare.app/students/{studentId}",
      fields: [{ name: "studentId", placeholder: "조회할 학생 id (예: 1)" }],
      response: {
        status: "200 OK · 128 ms",
        headers: ["Content-Type: application/json"],
        body: [
          "{",
          '  "id": 1,',
          '  "studentNumber": 2315,',
          '  "name": "장윤호",',
          '  "birthDate": "2009-07-28",',
          '  "email": "example@dsm.hs.kr",',
          '  "club": { "id": 1, "name": "DMS", "logo": "image.png" }',
          "}",
        ],
      },
    },
  },
];
