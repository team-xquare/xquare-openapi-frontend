import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CLUBS, findClub } from "../../../club-content";
import { ClubForm } from "../../club-form";

export function generateStaticParams() {
  return CLUBS.map((club) => ({ id: club.id }));
}

export default function ClubEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense>
      <ClubEditForm params={params} />
    </Suspense>
  );
}

async function ClubEditForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const club = findClub(id);

  if (!club) notFound();

  return <ClubForm club={club} />;
}
