import { Suspense } from "react";
import { notFound } from "next/navigation";
import { TEACHERS } from "../../teacher-content";
import { TeacherEditForm } from "./teacher-edit-form";

export function generateStaticParams() {
  return TEACHERS.map((teacher) => ({ id: teacher.id }));
}

export default function TeacherEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense>
      <TeacherEditDetails params={params} />
    </Suspense>
  );
}

async function TeacherEditDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const teacher = TEACHERS.find((item) => item.id === id);

  if (!teacher) notFound();

  return <TeacherEditForm teacher={teacher} />;
}
