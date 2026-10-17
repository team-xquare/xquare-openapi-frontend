import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import AppLayout from "./AppLayout";
import EmotionRegistry from "./EmotionRegistry";

export const metadata: Metadata = {
  title: "XQUARE Open api",
  description: "Xquare School-Information Access Module",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body suppressHydrationWarning>
        <EmotionRegistry>
          <AppLayout>{children}</AppLayout>
        </EmotionRegistry>
      </body>
    </html>
  );
}
