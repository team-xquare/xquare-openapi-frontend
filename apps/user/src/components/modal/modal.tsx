"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import {
  ModalActions,
  ModalDescription,
  ModalDialog,
  ModalTitle,
  PrimaryButton,
  SecondaryButton,
} from "./modal-style";

interface ModalProps {
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onClose: () => void;
  onConfirm?: () => void;
}

export function Modal({
  title,
  description,
  confirmLabel,
  cancelLabel = "취소",
  onClose,
  onConfirm,
}: ModalProps) {
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
        if (event.currentTarget.returnValue === "confirm") onConfirm?.();
        onClose();
      }}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
    >
      <ModalTitle id={`${id}-title`}>{title}</ModalTitle>
      <ModalDescription id={`${id}-description`}>
        {description}
      </ModalDescription>
      <ModalActions method="dialog">
        <PrimaryButton type="submit" value="confirm">
          {confirmLabel}
        </PrimaryButton>
        <SecondaryButton type="submit" value="cancel" autoFocus>
          {cancelLabel}
        </SecondaryButton>
      </ModalActions>
    </ModalDialog>
  );
}
