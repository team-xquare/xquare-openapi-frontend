import { memo } from "react";
import {
  StepCardDescription,
  StepCardItem,
  StepCardList,
  StepCardNumber,
  StepCardTitle,
} from "./step-cards-style";

export interface StepCard {
  title: string;
  description: string;
}

interface StepCardsProps {
  steps: StepCard[];
}

function StepCardsComponent({ steps }: StepCardsProps) {
  return (
    <StepCardList>
      {steps.map((step, index) => (
        <StepCardItem key={step.title}>
          <StepCardNumber aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </StepCardNumber>
          <StepCardTitle>{step.title}</StepCardTitle>
          <StepCardDescription>{step.description}</StepCardDescription>
        </StepCardItem>
      ))}
    </StepCardList>
  );
}

export const StepCards = memo(StepCardsComponent);
