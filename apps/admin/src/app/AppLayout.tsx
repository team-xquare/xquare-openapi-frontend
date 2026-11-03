"use client";

import type { ReactNode } from "react";
import styled from "@emotion/styled";
import { Sidebar } from "../components/sidebar/sidebar";
import { SIDEBAR_WIDTH } from "../components/sidebar/sidebar-style";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Sidebar />
      <Page>{children}</Page>
    </>
  );
}

const Page = styled.div`
  margin-left: ${SIDEBAR_WIDTH};
  min-height: 100vh;
  width: calc(100% - ${SIDEBAR_WIDTH});
`;
