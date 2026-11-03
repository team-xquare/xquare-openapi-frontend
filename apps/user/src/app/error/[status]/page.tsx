import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ERROR_PAGES, type ErrorStatus } from "../../error-content";
import { ErrorView } from "../../error-view";

// 404는 not-found.tsx가 그리므로 나머지 상태만 /error/{status}로 둠
const ROUTE_STATUSES = (
  Object.keys(ERROR_PAGES).map(Number) as ErrorStatus[]
).filter((status) => status !== 404);

export function generateStaticParams() {
  return ROUTE_STATUSES.map((status) => ({ status: String(status) }));
}

export default function ErrorStatusPage({
  params,
}: {
  params: Promise<{ status: string }>;
}) {
  return (
    <Suspense>
      <ErrorStatusContent params={params} />
    </Suspense>
  );
}

async function ErrorStatusContent({
  params,
}: {
  params: Promise<{ status: string }>;
}) {
  const { status } = await params;
  const errorStatus = ROUTE_STATUSES.find((item) => String(item) === status);

  if (!errorStatus) notFound();

  return <ErrorView status={errorStatus} />;
}
