"use client";

import { useSyncExternalStore } from "react";

const pad = (value: number) => String(value).padStart(2, "0");

const readToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

// 날짜가 바뀌는 것까지 지켜볼 필요는 없어 구독하지 않음
const subscribe = () => () => {};

// 오늘 날짜(YYYY-MM-DD, 브라우저 시간대).
// 화면을 그리는 중에 현재 시각을 읽으면 미리 그려 둘 수 없어서,
// 미리 그릴 때와 첫 화면 연결(hydration) 때는 null을 주고 브라우저에서 바로 다시 그림
export function useToday(): string | null {
  return useSyncExternalStore(subscribe, readToday, () => null);
}
