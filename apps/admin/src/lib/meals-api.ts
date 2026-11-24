import { api } from "./api";
import { withQuery } from "./query";

// 급식 API (GET · POST /meals, GET · PATCH /meals/{mealId})
// 삭제 API는 아직 없음

export interface MealResponse {
  id: number;
  // YYYY-MM-DD
  date: string;
  breakfast: string[];
  lunch: string[];
  dinner: string[];
}

export interface MealListResponse {
  startDate: string;
  finishDate: string;
  meals: MealResponse[];
  totalCount: number;
}

// 등록 · 수정 본문. 끼니마다 메뉴를 하나씩 배열로 보냄
export interface MealRequest {
  date: string;
  breakfast: string[];
  lunch: string[];
  dinner: string[];
}

// 서버 MealRequest 검증과 같음 (메뉴 하나의 최대 글자 수, 끼니마다 최대 메뉴 수)
export const MEAL_MENU_MAX_LENGTH = 50;
export const MEAL_MENU_MAX_COUNT = 20;

// 시작일 ~ 종료일(포함) 급식
export const fetchMeals = (
  range: { startDate: string; finishDate: string },
  signal?: AbortSignal,
) => api.get<MealListResponse>(withQuery("/meals", range), { signal });

export const createMeal = (body: MealRequest, signal?: AbortSignal) =>
  api.post("/meals", body, { signal });

export const updateMeal = (
  id: number | string,
  body: MealRequest,
  signal?: AbortSignal,
) =>
  api.patch(`/meals/${encodeURIComponent(String(id))}`, body, { signal });
