import { Suspense } from "react";
import { MealApplySuccessContent } from "./success-content";

export default function MealApplySuccessPage() {
  return (
    <Suspense fallback={null}>
      <MealApplySuccessContent />
    </Suspense>
  );
}
