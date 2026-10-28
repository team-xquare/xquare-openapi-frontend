import { Suspense } from "react";
import { notFound } from "next/navigation";
import { API_DETAILS } from "../../api-detail-content";
import { ApiDetailView } from "./api-detail";

export function generateStaticParams() {
  return API_DETAILS.map((detail) => ({
    category: detail.category,
    endpointId: detail.id,
  }));
}

export default function ApiDetailPage({
  params,
}: {
  params: Promise<{ category: string; endpointId: string }>;
}) {
  return (
    <Suspense>
      <ApiDetailContent params={params} />
    </Suspense>
  );
}

async function ApiDetailContent({
  params,
}: {
  params: Promise<{ category: string; endpointId: string }>;
}) {
  const { category, endpointId } = await params;
  const detail = API_DETAILS.find(
    (item) => item.category === category && item.id === endpointId,
  );

  if (!detail) notFound();

  return <ApiDetailView detail={detail} />;
}
