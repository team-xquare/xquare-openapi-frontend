import { memo } from "react";
import { DocBadgeSpan } from "./doc-badge-style";

interface DocBadgeProps {
  label: string;
}

function DocBadgeComponent({ label }: DocBadgeProps) {
  return <DocBadgeSpan>{label}</DocBadgeSpan>;
}

export const DocBadge = memo(DocBadgeComponent);
