import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ENDPOINT_GROUPS } from "../all-content";
import { EndpointListing } from "../endpoint-listing";

const CATEGORY_IDS = ENDPOINT_GROUPS.map((group) => group.id);

export function generateStaticParams() {
  return CATEGORY_IDS.map((category) => ({ category }));
}

export default function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  return (
    <Suspense fallback={<EndpointListing groups={[]} />}>
      <CategoryContent params={params} />
    </Suspense>
  );
}

async function CategoryContent({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const group = ENDPOINT_GROUPS.find((item) => item.id === category);

  if (!group) notFound();

  return <EndpointListing groups={[group]} />;
}
