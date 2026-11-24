import { useSyncExternalStore } from "react";
import { api } from "./api";

// GET /users/me 응답
export interface MyInfo {
  id: number;
  username: string;
  name: string;
  studentNumber?: number;
  email: string;
  role: "USER" | "ADMIN";
}

// 지금 토큰의 내 정보. 페이지를 옮길 때마다 다시 부르지 않도록 한 번 받아 두고,
// 이 탭에서 로그인 · 로그아웃하면 비움 (새로고침하면 다시 받음)
let current: MyInfo | null = null;
let pending: Promise<MyInfo> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// 받아 둔 내 정보. 아직 없거나 서버 렌더링 중이면 null
export function useMyInfo() {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
}

// 받아 둔 정보가 있으면 그대로 쓰고, 없으면(refresh면 항상) /users/me를 부름
export function loadMyInfo(refresh = false): Promise<MyInfo> {
  if (current && !refresh) return Promise.resolve(current);
  // refresh면 진행 중인 요청을 기다리지 않음. 그 요청은 바뀌기 전 토큰으로 보냈을 수 있음.
  // 새 요청을 pending에 넣으면 이전 요청은 끝날 때 결과를 버리고 이 요청을 따름
  if (pending && !refresh) return pending;

  const request: Promise<MyInfo> = api.get<MyInfo>("/users/me").then(
    (info) => {
      // 기다리는 사이 로그인 · 로그아웃했으면 이전 계정 정보는 버리고 지금 토큰으로 다시 받음
      if (pending !== request) return loadMyInfo();
      pending = null;
      current = info;
      emit();
      return info;
    },
    (error: unknown) => {
      if (pending !== request) return loadMyInfo();
      pending = null;
      throw error;
    },
  );
  pending = request;
  return request;
}

// 받아 둔 내 정보를 버림. 로그인한 뒤 새 계정 정보를 받기 전에 부름
export function resetMyInfo() {
  pending = null;
  current = null;
  emit();
}

// 토큰과 받아 둔 내 정보를 함께 지움
export function logout() {
  api.auth.logout();
  resetMyInfo();
}
