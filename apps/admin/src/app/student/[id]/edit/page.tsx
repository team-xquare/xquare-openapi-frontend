import { Suspense } from "react";
import { notFound } from "next/navigation";
import { STUDENTS } from "../../student-content";
import { StudentEditForm } from "./student-edit-form";

export function generateStaticParams() {
  return STUDENTS.map((student) => ({ id: student.id }));
}

export default async function StudentEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense>
      <StudentEditDetails params={params} />
    </Suspense>
  );
}

async function StudentEditDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = STUDENTS.find((item) => item.id === id);

  if (!student) notFound();

  return <StudentEditForm student={student} />;
}
