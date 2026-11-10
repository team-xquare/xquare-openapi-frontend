import { Suspense } from "react";
import { notFound } from "next/navigation";
import { MEALS, findMeal } from "../../../meal-content";
import { MealForm } from "../../meal-form";

export function generateStaticParams() {
  return MEALS.map((meal) => ({ date: meal.date }));
}

export default function MealEditPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  return (
    <Suspense>
      <MealEditForm params={params} />
    </Suspense>
  );
}

async function MealEditForm({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const meal = findMeal(date);

  if (!meal) notFound();

  return <MealForm meal={meal} />;
}
