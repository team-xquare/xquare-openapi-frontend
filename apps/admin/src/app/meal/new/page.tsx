import { Suspense } from "react";
import { isMealDate } from "../../meal-content";
import { MealForm } from "../meal-form";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

// 목록·홈의 `입력`은 /meal/new?date=YYYY-MM-DD로 와서 날짜를 미리 채움
export default function MealNewPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense>
      <MealNewForm searchParams={searchParams} />
    </Suspense>
  );
}

async function MealNewForm({ searchParams }: { searchParams: SearchParams }) {
  const { date } = await searchParams;
  const initialDate = typeof date === "string" && isMealDate(date) ? date : "";

  return <MealForm initialDate={initialDate} />;
}
