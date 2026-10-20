import { memo, type ReactNode } from "react";
import {
  DocSectionContainer,
  DocSectionDescription,
  DocSectionTitle,
} from "./doc-section-style";

// 문서 섹션 공통 틀 (제목 + 설명 + 본문)
interface DocSectionProps {
  id?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

function DocSectionComponent({
  id,
  title,
  description,
  children,
}: DocSectionProps) {
  return (
    <DocSectionContainer id={id} aria-labelledby={id && `${id}-title`}>
      <DocSectionTitle id={id && `${id}-title`}>{title}</DocSectionTitle>
      {description && (
        <DocSectionDescription>{description}</DocSectionDescription>
      )}
      {children}
    </DocSectionContainer>
  );
}

export const DocSection = memo(DocSectionComponent);
