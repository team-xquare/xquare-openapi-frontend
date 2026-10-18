"use client";

import { useEffect, useState } from "react";
import {
  SidebarFooterContainer,
  SidebarFooterName,
} from "./sidebar-footer-style";

const USERNAME_CACHE_KEY = "xquare:username";

export function SidebarFooter() {
  const [userName, setUserName] = useState("사용자");

  useEffect(() => {
    // username이 없을 경우 사용자로 표시
    const syncUserName = () => {
      setUserName(window.localStorage.getItem(USERNAME_CACHE_KEY) || "사용자");
    };

    syncUserName();
    window.addEventListener("storage", syncUserName);
    return () => window.removeEventListener("storage", syncUserName);
  }, []);

  return (
    <SidebarFooterContainer>
      <SidebarFooterName>{userName}</SidebarFooterName>
    </SidebarFooterContainer>
  );
}
