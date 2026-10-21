import { Suspense } from "react";
import { notFound } from "next/navigation";
import { NOTICES } from "../../notice-content";
import { NoticeArticle, NoticeDetailFrame } from "./notice-detail";

export function generateStaticParams() {
  return NOTICES.map((notice) => ({ id: notice.id }));
}

export default function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <NoticeDetailFrame>
      <Suspense>
        <NoticeContent params={params} />
      </Suspense>
    </NoticeDetailFrame>
  );
}

async function NoticeContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const index = NOTICES.findIndex((notice) => notice.id === id);

  if (index === -1) notFound();

  // 목록이 최신순이라 이전글은 바로 뒤, 다음글은 바로 앞 항목
  return (
    <NoticeArticle
      notice={NOTICES[index]}
      prev={NOTICES[index + 1]}
      next={NOTICES[index - 1]}
    />
  );
}
