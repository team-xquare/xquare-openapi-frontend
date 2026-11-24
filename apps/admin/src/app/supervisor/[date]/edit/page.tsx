import { Suspense } from "react";
import { SupervisionEditForm } from "../../supervision-form";

// 자습감독은 브라우저에서 불러와서 빌드할 때 아는 날짜가 없음. Cache Components는 날짜가 하나 이상
// 있어야 빌드되므로 없는 날짜(0000-00-00)로 공통 화면 틀만 미리 그림
export function generateStaticParams() {
  return [{ date: "0000-00-00" }];
}

export default function SupervisorEditPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  return (
    <Suspense>
      <SupervisorEditLoader params={params} />
    </Suspense>
  );
}

// 자습감독은 로그인한 관리자 토큰으로 브라우저에서 불러오므로 서버에서는 날짜만 넘김
async function SupervisorEditLoader({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  return <SupervisionEditForm date={date} />;
}
