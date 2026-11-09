import { Suspense } from "react";
import { notFound } from "next/navigation";
import { APPLICATIONS } from "../apply-content";
import { ApplicationDetailContent } from "./application-detail-content";

export function generateStaticParams() {
  return APPLICATIONS.map((application) => ({ id: application.id }));
}

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense>
      <ApplicationDetailData params={params} />
    </Suspense>
  );
}

async function ApplicationDetailData({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const application = APPLICATIONS.find((item) => item.id === id);

  if (!application) notFound();

  return <ApplicationDetailContent application={application} />;
}
