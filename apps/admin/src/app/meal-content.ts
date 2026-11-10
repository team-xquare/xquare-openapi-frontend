export interface Meal {
  // YYYY-MM-DD. 하루에 한 건이라 날짜를 id로 씀
  date: string;
  // 한 줄에 메뉴 하나. API에는 저장할 때 쉼표로 합쳐서 보냄
  breakfast: string[];
  lunch: string[];
  dinner: string[];
}

export const MEAL_TIMES = [
  { key: "breakfast", label: "조식" },
  { key: "lunch", label: "중식" },
  { key: "dinner", label: "석식" },
] as const;

export type MealTime = (typeof MEAL_TIMES)[number]["key"];

// 홈 기준일(2026-09-14)이 있는 달을 처음에 보여 줌
export const MEAL_BASE_YEAR = 2026;
export const MEAL_BASE_MONTH = 9;

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const toDate = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const getWeekday = (date: string) => WEEKDAYS[toDate(date).getDay()];

export const isWeekend = (date: string) => {
  const day = toDate(date).getDay();
  return day === 0 || day === 6;
};

export const formatDate = (year: number, month: number, day: number) =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

// 2026-02-31처럼 형식만 맞는 날짜는 걸러 냄
export const isMealDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = toDate(value);
  return (
    formatDate(date.getFullYear(), date.getMonth() + 1, date.getDate()) ===
    value
  );
};

export const getMonthDates = (year: number, month: number) => {
  const lastDay = new Date(year, month, 0).getDate();
  return Array.from({ length: lastDay }, (_, index) =>
    formatDate(year, month, index + 1),
  );
};

const menu = (text: string) => text.split(", ");

// Figma 급식 목록에 나온 날짜
const FIGMA_MEALS: Meal[] = [
  {
    date: "2026-09-01",
    breakfast: menu("찹쌀밥, 미역국, 계란말이, 제육볶음, 배추김치, 요구르트"),
    lunch: menu("백미밥, 된장찌개, 잡채, 오징어튀김, 깍두기, 방울토마토"),
    dinner: menu("카레라이스, 김치전, 단무지, 미소장국, 포기김치"),
  },
  {
    date: "2026-09-02",
    breakfast: menu("모닝빵, 크림스프, 삶은계란, 사과잼, 우유"),
    lunch: menu("김치볶음밥, 어묵국, 메추리알조림, 콩나물무침, 포기김치"),
    dinner: menu("제육덮밥, 계란국, 알감자조림, 오이무침, 배추김치, 아이스크림"),
  },
  {
    date: "2026-09-04",
    breakfast: menu("흑미밥, 북엇국, 스크램블에그, 김구이, 깍두기"),
    lunch: menu("잡곡밥, 순두부찌개, 닭갈비, 시금치나물, 배추김치"),
    dinner: menu("짜장밥, 계란국, 탕수육, 단무지, 배추김치, 요구르트"),
  },
];

// 나머지 평일은 아래 식단을 돌려 가며 채움
const ROTATION: Omit<Meal, "date">[] = [
  {
    breakfast: menu("현미밥, 콩나물국, 소시지야채볶음, 김자반, 배추김치"),
    lunch: menu("기장밥, 육개장, 고등어구이, 도라지무침, 깍두기, 바나나"),
    dinner: menu("볶음밥, 짬뽕국, 군만두, 단무지, 요구르트"),
  },
  {
    breakfast: menu("토스트, 양송이스프, 스크램블에그, 그린샐러드, 우유"),
    lunch: menu("쌀밥, 김치찌개, 돈까스, 양배추샐러드, 깍두기"),
    dinner: menu("비빔밥, 미역국, 계란후라이, 배추김치, 오렌지"),
  },
  {
    breakfast: menu("흰죽, 장조림, 김구이, 백김치"),
    lunch: menu("카레라이스, 유부장국, 치킨너겟, 오이피클, 배추김치"),
    dinner: menu("잡곡밥, 감자국, 불고기, 숙주나물, 깍두기"),
  },
  {
    breakfast: menu("찹쌀밥, 시래기국, 떡갈비, 무생채, 배추김치"),
    lunch: menu("짜장면, 짬뽕국물, 탕수육, 단무지, 요구르트"),
    dinner: menu("오므라이스, 콘스프, 치킨까스, 양배추샐러드, 배추김치"),
  },
  {
    breakfast: menu("시리얼, 우유, 삶은계란, 바나나"),
    lunch: menu("잡곡밥, 된장국, 닭볶음탕, 계란말이, 배추김치, 사과"),
    dinner: menu("쌀밥, 어묵탕, 돼지불백, 상추쌈, 깍두기"),
  },
];

// 급식 API 연동 전까지 쓰는 더미 데이터.
// 홈의 `9월 미등록 1일`과 맞도록 2026-09-03만 비워 둠
export const MEALS: Meal[] = [
  ...FIGMA_MEALS,
  ...getMonthDates(MEAL_BASE_YEAR, MEAL_BASE_MONTH)
    .filter(
      (date) =>
        !isWeekend(date) &&
        date !== "2026-09-03" &&
        !FIGMA_MEALS.some((meal) => meal.date === date),
    )
    .map((date, index) => ({ date, ...ROTATION[index % ROTATION.length] })),
].sort((a, b) => a.date.localeCompare(b.date));

export const findMeal = (date: string) =>
  MEALS.find((meal) => meal.date === date);
