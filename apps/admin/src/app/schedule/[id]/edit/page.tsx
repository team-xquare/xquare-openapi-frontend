import { Suspense } from "react";
import { notFound } from "next/navigation";
import { SCHEDULES } from "../../../schedule-content";
import { ScheduleForm } from "../../schedule-form";

export function generateStaticParams() {
  return SCHEDULES.map((schedule) => ({ id: schedule.id }));
}

export default function ScheduleEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense>
      <ScheduleEditForm params={params} />
    </Suspense>
  );
}

async function ScheduleEditForm({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const schedule = SCHEDULES.find((item) => item.id === id);

  if (!schedule) notFound();

  return <ScheduleForm schedule={schedule} />;
}
