import { memo } from "react";
import {
  InfoListContainer,
  InfoListKey,
  InfoListRow,
  InfoListValue,
} from "./info-list-style";

export interface InfoListItem {
  label: string;
  value: string;
  isCode?: boolean;
}

interface InfoListProps {
  items: InfoListItem[];
  labelWidth?: number;
}

function InfoListComponent({ items, labelWidth = 180 }: InfoListProps) {
  return (
    <InfoListContainer>
      {items.map((item) => (
        <InfoListRow key={item.label}>
          <InfoListKey labelWidth={labelWidth}>{item.label}</InfoListKey>
          <InfoListValue isCode={item.isCode ?? false}>{item.value}</InfoListValue>
        </InfoListRow>
      ))}
    </InfoListContainer>
  );
}

export const InfoList = memo(InfoListComponent);
