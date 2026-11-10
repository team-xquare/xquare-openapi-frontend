"use client";

import { useEffect, useId, useRef } from "react";
import {
  ModalActions,
  ModalCancelButton,
  ModalDangerButton,
  ModalDescription,
  ModalDialog,
  ModalTitle,
} from "../notice/page-style";

// Figma에 자습감독 삭제 모달이 없어 공지 삭제 모달과 같은 디자인 시스템 Modal(Type=Danger)을 씀
export function DeleteSupervisionModal({
  date,
  onClose,
  onConfirm,
}: {
  date: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const id = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <ModalDialog
      ref={dialogRef}
      onClose={(event) => {
        if (event.currentTarget.returnValue === "confirm") onConfirm();
        onClose();
      }}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
    >
      <ModalTitle id={`${id}-title`}>{date} 자습감독 배정을 삭제할까요?</ModalTitle>
      <ModalDescription id={`${id}-description`}>
        삭제하면 되돌릴 수 없고, 일정 관리의 자습 감독에서도 빠집니다.
      </ModalDescription>
      <ModalActions method="dialog">
        {/* 되돌릴 수 없는 동작이라 취소에 먼저 포커스를 둠 */}
        <ModalCancelButton type="submit" value="cancel" autoFocus>
          취소
        </ModalCancelButton>
        <ModalDangerButton type="submit" value="confirm">
          삭제
        </ModalDangerButton>
      </ModalActions>
    </ModalDialog>
  );
}
