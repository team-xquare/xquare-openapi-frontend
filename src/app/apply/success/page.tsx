import { Suspense } from "react";
import { ApplySuccessContent } from "./success-content";

export default function ApplySuccessPage() {
  return (
    <Suspense fallback={null}>
      <ApplySuccessContent />
    </Suspense>
  );
}
