import { Suspense } from "react";
import { notFound } from "next/navigation";
import { isMealDate } from "../../../meal-content";
import { MealEditForm } from "../../meal-form";

// 급식은 브라우저에서 불러와서 빌드할 때 아는 날짜가 없음. Cache Components는 날짜가 하나 이상
// 있어야 빌드되므로 아무 날짜(2000-01-01)로 공통 화면 틀만 미리 그림
export function generateStaticParams() {
  return [{ date: "2000-01-01" }];
}

export default function MealEditPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  return (
    <Suspense>
      <MealEditLoader params={params} />
    </Suspense>
  );
}

// 급식은 브라우저에서 불러오므로 서버에서는 날짜만 넘김.
// 날짜 모양이 아니면 불러올 급식도 없어 바로 404
async function MealEditLoader({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!isMealDate(date)) notFound();

  return <MealEditForm date={date} />;
}
