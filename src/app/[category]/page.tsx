import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ENDPOINT_GROUPS } from "../all-content";
import { EndpointListing } from "../endpoint-listing";

// /notice에는 별도의 공지사항 페이지가 있으므로, 카테고리 경로로 사용하지 않음
const CATEGORY_IDS = ENDPOINT_GROUPS.filter(
  (group) => group.id !== "notice",
).map((group) => group.id);

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
