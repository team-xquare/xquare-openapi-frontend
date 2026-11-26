import { Suspense } from "react";
import { ClubEditForm } from "../../club-form";

// 동아리는 브라우저에서 불러와서 빌드할 때 아는 id가 없음. Cache Components는 id가 하나 이상
// 있어야 빌드되므로 없는 id(0, 서버 id는 1부터)로 공통 화면 틀만 미리 그림
export function generateStaticParams() {
  return [{ id: "0" }];
}

export default function ClubEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense>
      <ClubEditLoader params={params} />
    </Suspense>
  );
}

// 동아리는 로그인한 관리자 토큰으로 브라우저에서 불러오므로 서버에서는 id만 넘김
async function ClubEditLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClubEditForm id={id} />;
}
