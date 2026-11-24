"use client";

import { useEffect, useState, type ReactNode } from "react";
import styled from "@emotion/styled";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "../components/sidebar/sidebar";
import { api, TOKEN_STORAGE_KEY } from "../lib/api";
import { loadMyInfo, logout, resetMyInfo, useMyInfo } from "../lib/my-info";
import { Xquare_colors } from "../styles/colors";

// 사이드바 없이 화면 전체를 쓰는 페이지. 로그인 · 권한 확인 없이 열 수 있음
const FULL_SCREEN_PATHS = ["/login", "/forbidden"];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isFullScreen = FULL_SCREEN_PATHS.includes(pathname);
  const isAdmin = useMyInfo()?.role === "ADMIN";
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // 관리자 페이지는 로그인과 ADMIN 권한을 확인한 뒤에 보여줌
  // 토큰은 렌더 중에 읽으면 서버 렌더 결과와 달라져서 effect에서 확인함
  useEffect(() => {
    if (isFullScreen || isAdmin) return;
    if (!api.auth.isLoggedIn()) {
      router.replace("/login");
      return;
    }

    let cancelled = false;
    loadMyInfo().then(
      (info) => {
        if (cancelled || info.role === "ADMIN") return;
        // ADMIN이 아닌 계정의 토큰은 관리자 앱에서 쓸 데가 없음.
        // 지워 둬야 권한 없음 화면에서 다른 계정으로 바로 로그인할 수 있음
        logout();
        router.replace("/forbidden");
      },
      () => {
        if (cancelled) return;
        // 재발급까지 거절돼 토큰이 지워졌으면 api가 로그인 화면으로 보냄
        if (api.auth.isLoggedIn()) setFailed(true);
        else router.replace("/login");
      },
    );
    return () => {
      cancelled = true;
    };
  }, [isFullScreen, isAdmin, attempt, router]);

  // 다른 탭에서 로그아웃하면 이 탭도 확인부터 다시 함.
  // 다른 탭이 로그인하거나 토큰을 재발급했으면 화면은 그대로 두고 내 정보만 새로 받음 (계정이 바뀌었을 수 있음)
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== TOKEN_STORAGE_KEY && event.key !== null) return;
      if (!api.auth.isLoggedIn()) resetMyInfo();
      else loadMyInfo(true).catch(() => {});
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const retry = () => {
    setFailed(false);
    setAttempt((count) => count + 1);
  };

  let content: ReactNode = null;
  if (isFullScreen || isAdmin) content = children;
  else if (failed) {
    content = (
      <CheckFailed role="alert">
        <p>관리자 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
        <RetryButton type="button" onClick={retry}>
          다시 시도
        </RetryButton>
      </CheckFailed>
    );
  }

  return (
    <Shell>
      {/* Page 위치가 바뀌면 보존 중인 페이지 상태가 초기화되므로 사이드바만 조건부로 렌더링 */}
      {!isFullScreen && isAdmin && <Sidebar />}
      {/* 권한 확인이 끝나기 전에는 페이지를 그리지 않아 관리자 화면이 잠깐 보이지 않게 함 */}
      <Page>{content}</Page>
    </Shell>
  );
}

// 사이드바와 본문을 한 줄로 놓아 사이드바 열이 본문 높이만큼 늘어나게 함
const Shell = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Page = styled.div`
  flex: 1 1 0;
  min-width: 0;
`;

const CheckFailed = styled.div`
  align-items: center;
  color: ${Xquare_colors.slate[600]};
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 120px 24px;
  text-align: center;

  p {
    margin: 0;
  }
`;

const RetryButton = styled.button`
  appearance: none;
  background: ${Xquare_colors.white};
  border: 1px solid ${Xquare_colors.slate[400]};
  border-radius: 8px;
  color: ${Xquare_colors.slate[900]};
  cursor: pointer;
  padding: 8px 16px;
`;
