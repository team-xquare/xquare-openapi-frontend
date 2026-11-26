import { Suspense } from "react";
import { UsageLogDetailContent } from "./usage-log-detail-content";

// 기록 id는 실행 중에 정해져 빌드에서는 견본 하나로만 미리 그림 (나머지는 요청 때 그림)
export function generateStaticParams() {
  return [{ id: "0" }];
}

export default function UsageLogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense>
      <UsageLogDetailData params={params} />
    </Suspense>
  );
}

async function UsageLogDetailData({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <UsageLogDetailContent id={id} />;
}
