import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SidebarFooter } from "./index";
import { SidebarHeader } from "./index";
import { SidebarItem } from "./index";
import {
  SidebarContainer,
  SidebarContent,
  SidebarNavContainer,
  SidebarNavContent,
  SidebarOverview,
  SidebarSectionTitle,
  SidebarUtilityLink,
} from "./sidebar-style";

// 공통 sidebar 컴포넌트
interface SidebarNavItem {
  id: string;
  label: string;
  subItems?: SidebarNavItem[];
  path?: string;
}

interface SidebarProps {
  navItems: SidebarNavItem[];
  onNavItemClick: (itemId: string) => void;
}

function Sidebar({ navItems, onNavItemClick }: SidebarProps) {
  const pathname = usePathname();
  const [activeAnchor, setActiveAnchor] = useState("");

  useEffect(() => {
    const syncAnchor = () => setActiveAnchor(window.location.hash.slice(1));
    syncAnchor();
    window.addEventListener("hashchange", syncAnchor);
    window.addEventListener("popstate", syncAnchor);
    return () => {
      window.removeEventListener("hashchange", syncAnchor);
      window.removeEventListener("popstate", syncAnchor);
    };
  }, [pathname]);

  // 사이드바 경로 비교 후 이동
  const isMatch = (basePath?: string) =>
    basePath != null &&
    (pathname === basePath || pathname.startsWith(`${basePath}/`));

  const activeItemId =
    pathname === "/all"
      ? activeAnchor || "all"
      : (navItems.find(
          (i) =>
            isMatch(i.path?.split("#")[0]) ||
            i.subItems?.some((s) => isMatch(s.path)),
        )?.id ??
        navItems[0]?.id ??
        "");
  const overviewItem = navItems.find((item) => item.id === "overview");
  const noticeItem = navItems.find((item) => item.id === "notice");
  const endpointItems = navItems.filter(
    (item) => item.id !== "overview" && item.id !== "notice",
  );

  const isMainItemActive = useCallback(
    (itemId: string) =>
      itemId === activeItemId ||
      navItems
        .find((i) => i.id === itemId)
        ?.subItems?.some((sub) => sub.id === activeItemId),
    [activeItemId, navItems],
  );

  const handleMainItemClick = useCallback(
    (itemId: string) => {
      if (itemId === "all") setActiveAnchor("");
      onNavItemClick(itemId);
    },
    [onNavItemClick],
  );

  return (
    <SidebarContainer>
      <SidebarHeader />
      <SidebarContent>
        {overviewItem && (
          <SidebarOverview
            type="button"
            onClick={() => handleMainItemClick(overviewItem.id)}
            aria-current={activeItemId === overviewItem.id ? "page" : undefined}
          >
            {overviewItem.label}
          </SidebarOverview>
        )}
        {noticeItem && (
          <SidebarUtilityLink
            type="button"
            onClick={() => handleMainItemClick(noticeItem.id)}
            aria-current={activeItemId === noticeItem.id ? "page" : undefined}
          >
            {noticeItem.label}
          </SidebarUtilityLink>
        )}
        <SidebarSectionTitle>ENDPOINT</SidebarSectionTitle>
        <SidebarNavContent>
          <SidebarNavContainer aria-label="Endpoint">
            {endpointItems.map((item) => (
              <SidebarItem
                key={item.id}
                label={item.label}
                isActive={isMainItemActive(item.id)}
                onClick={() => handleMainItemClick(item.id)}
              />
            ))}
          </SidebarNavContainer>
        </SidebarNavContent>
      </SidebarContent>
      <SidebarFooter />
    </SidebarContainer>
  );
}

export { Sidebar };
