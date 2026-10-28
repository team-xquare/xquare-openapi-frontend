import { memo } from "react";
import {
  SideBarHeader,
  SideBarHeaderDescriptionDiv,
  SideBarHeaderDescriptionDivSpan,
  SideBarHeaderDiv,
  SideBarHeaderNameSpan,
} from "./sidebar-header-style";

function SidebarHeaderComponent() {
  return (
    <SideBarHeader>
      <SideBarHeaderDiv>
        <SideBarHeaderNameSpan>XQUARE</SideBarHeaderNameSpan>
        <SideBarHeaderDescriptionDiv>
          <SideBarHeaderDescriptionDivSpan>
            DSM Open API 플랫폼
          </SideBarHeaderDescriptionDivSpan>
        </SideBarHeaderDescriptionDiv>
      </SideBarHeaderDiv>
    </SideBarHeader>
  );
}

export const SidebarHeader = memo(SidebarHeaderComponent);
