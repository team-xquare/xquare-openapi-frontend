"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ContactModal,
  type ErrorReport,
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
  request,
  requestId,
}: {
  status: ErrorStatus;
  // error.tsx의 retry. 없으면 이전 페이지로 돌아가 다시 요청
  onRetry?: () => void;
  // 문의하기 모달에 보여 줄 실패한 요청과 요청 ID
  request?: string;
  requestId?: string;
}) {
  const router = useRouter();
  const { title, description, actions } = ERROR_PAGES[status];
  const occurredAtRef = useRef<Date>(null);
  const [contactReport, setContactReport] = useState<ErrorReport | null>(null);

  // 이 화면이 처음 보인 때를 오류 발생 시각으로 봄
  // (화면을 그리는 중에 현재 시각을 읽으면 미리 그려 둘 수 없어 effect에서 기록)
  useEffect(() => {
    occurredAtRef.current = new Date();
  }, []);

  // 다른 페이지로 이동해도 화면이 숨겨진 채 상태가 남으므로,
  // 열려 있던 문의하기 모달이 돌아왔을 때 배경 없이 남지 않도록 숨겨질 때 닫음
  useLayoutEffect(() => {
    return () => setContactReport(null);
  }, []);

  const openContact = () => {
    setContactReport({
      code: status,
      request,
      occurredAt: occurredAtRef.current ?? new Date(),
      requestId,
    });
  };

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
    const handleClick =
      action.kind === "contact"
        ? openContact
        : action.kind === "retry" && onRetry
          ? onRetry
          : goBack;
    return (
      <ActionButton key={action.label} type="button" onClick={handleClick}>
        {action.label}
      </ActionButton>
    );
  };

  return (
    <>
      <ErrorPageLayout code={status} title={title} description={description}>
        {actions.map((action, index) => renderAction(action, index === 0))}
      </ErrorPageLayout>
      {contactReport && (
        <ContactModal
          report={contactReport}
          onClose={() => setContactReport(null)}
        />
      )}
    </>
  );
}
