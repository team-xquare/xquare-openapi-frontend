import { Suspense } from "react";
import { notFound } from "next/navigation";
import { SUPERVISIONS, findSupervision } from "../../../supervisor-content";
import { SupervisionForm } from "../../supervision-form";

export function generateStaticParams() {
  return SUPERVISIONS.map((supervision) => ({ date: supervision.date }));
}

export default function SupervisorEditPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  return (
    <Suspense>
      <SupervisorEditForm params={params} />
    </Suspense>
  );
}

async function SupervisorEditForm({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const supervision = findSupervision(date);

  if (!supervision) notFound();

  return <SupervisionForm supervision={supervision} />;
}
