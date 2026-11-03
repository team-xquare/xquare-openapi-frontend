"use client";

import { useRouter } from "next/navigation";
import {
  ErrorPageLayout,
  ErrorPrimaryButton,
  ErrorPrimaryLink,
  ErrorSecondaryButton,
  ErrorSecondaryLink,
} from "../components";
import {
  ERROR_PAGES,
  type ErrorAction,
  type ErrorStatus,
} from "./error-content";

export function ErrorView({
  status,
  onRetry,
}: {
  status: ErrorStatus;
  // error.tsx의 retry. 없으면 이전 페이지로 돌아가 다시 요청
  onRetry?: () => void;
}) {
  const router = useRouter();
  const { title, description, actions } = ERROR_PAGES[status];

  const goBack = () => {
    // 새 탭으로 바로 들어와 돌아갈 페이지가 없으면 홈으로
    if (window.history.length > 1) router.back();
    else router.push("/");
  };

  const renderAction = (action: ErrorAction, isPrimary: boolean) => {
    if ("href" in action) {
      const ActionLink = isPrimary ? ErrorPrimaryLink : ErrorSecondaryLink;
      return (
        <ActionLink key={action.label} href={action.href}>
          {action.label}
        </ActionLink>
      );
    }

    const ActionButton = isPrimary ? ErrorPrimaryButton : ErrorSecondaryButton;
    const handleClick = action.kind === "retry" && onRetry ? onRetry : goBack;
    return (
      <ActionButton key={action.label} type="button" onClick={handleClick}>
        {action.label}
      </ActionButton>
    );
  };

  return (
    <ErrorPageLayout code={status} title={title} description={description}>
      {actions.map((action, index) => renderAction(action, index === 0))}
    </ErrorPageLayout>
  );
}
