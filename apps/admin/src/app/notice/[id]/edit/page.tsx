import { Suspense } from "react";
import { notFound } from "next/navigation";
import { NOTICES } from "../../../notice-content";
import { NoticeForm } from "../../notice-form";

export function generateStaticParams() {
  return NOTICES.map((notice) => ({ id: notice.id }));
}

export default function NoticeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense>
      <NoticeEditForm params={params} />
    </Suspense>
  );
}

async function NoticeEditForm({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const notice = NOTICES.find((item) => item.id === id);

  if (!notice) notFound();

  return <NoticeForm notice={notice} />;
}
