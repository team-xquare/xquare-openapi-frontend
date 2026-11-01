"use client";

import { useEffect, useId, useRef } from "react";
import {
  ModalActions,
  ModalCancelButton,
  ModalDangerButton,
  ModalDescription,
  ModalDialog,
  ModalTitle,
} from "./page-style";

// Figma에 공지 삭제 모달이 없어 디자인 시스템 Modal(Type=Danger)과
// 다른 메뉴의 삭제 확인 모달 문구를 따름
export function DeleteNoticeModal({
  title,
  onClose,
  onConfirm,
}: {
  title: string;
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
      {/* 공지 제목이 문장이라 따옴표로 감싸 "DMS 동아리를 삭제할까요?"와 같은 형태로 씀 */}
      <ModalTitle id={`${id}-title`}>&apos;{title}&apos; 공지를 삭제할까요?</ModalTitle>
      <ModalDescription id={`${id}-description`}>
        삭제하면 되돌릴 수 없습니다.
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
