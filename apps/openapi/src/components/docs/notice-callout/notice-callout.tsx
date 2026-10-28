import { memo } from "react";
import {
  NoticeCalloutBody,
  NoticeCalloutContainer,
  NoticeCalloutText,
  NoticeCalloutTitle,
} from "./notice-callout-style";

interface NoticeCalloutProps {
  title: string;
  description: string;
}

function NoticeCalloutComponent({ title, description }: NoticeCalloutProps) {
  return (
    <NoticeCalloutContainer>
      <NoticeCalloutBody>
        <NoticeCalloutTitle>{title}</NoticeCalloutTitle>
        <NoticeCalloutText>{description}</NoticeCalloutText>
      </NoticeCalloutBody>
    </NoticeCalloutContainer>
  );
}

export const NoticeCallout = memo(NoticeCalloutComponent);
