import { memo, type ReactNode } from "react";
import {
  InfoListContainer,
  InfoListKey,
  InfoListRow,
  InfoListValue,
} from "./info-list-style";

export interface InfoListItem {
  label: string;
  value: ReactNode;
  isCode?: boolean;
  // 넓은 화면에서 한 줄에 두 항목씩 배치
  isHalf?: boolean;
}

interface InfoListProps {
  items: InfoListItem[];
  labelWidth?: number;
  // 값이 여러 줄이거나 입력칸일 때 항목 이름을 값의 세로 가운데에 맞춤
  isLabelCentered?: boolean;
}

function InfoListComponent({
  items,
  labelWidth = 180,
  isLabelCentered = false,
}: InfoListProps) {
  return (
    <InfoListContainer>
      {items.map((item) => (
        <InfoListRow
          key={item.label}
          isHalf={item.isHalf ?? false}
          isLabelCentered={isLabelCentered}
        >
          <InfoListKey labelWidth={labelWidth}>{item.label}</InfoListKey>
          <InfoListValue isCode={item.isCode ?? false}>{item.value}</InfoListValue>
        </InfoListRow>
      ))}
    </InfoListContainer>
  );
}

export const InfoList = memo(InfoListComponent);
