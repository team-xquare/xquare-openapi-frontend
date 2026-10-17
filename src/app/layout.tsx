import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import AppLayout from "./AppLayout";
import EmotionRegistry from "./EmotionRegistry";

export const metadata: Metadata = {
  title: "Xquare",
  description: "Xquare infrastructure dashboard",
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
