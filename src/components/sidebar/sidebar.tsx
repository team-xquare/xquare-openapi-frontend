import { useCallback } from "react";
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
} from "./sidebar-style";

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

  const isMatch = (basePath?: string) =>
    basePath != null &&
    (pathname === basePath || pathname.startsWith(`${basePath}/`));

  const activeItemId =
    navItems.find(
      (i) => isMatch(i.path) || i.subItems?.some((s) => isMatch(s.path)),
    )?.id ??
    navItems[0]?.id ??
    "";
  const overviewItem = navItems.find((item) => item.id === "overview");
  const endpointItems = navItems.filter((item) => item.id !== "overview");

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
