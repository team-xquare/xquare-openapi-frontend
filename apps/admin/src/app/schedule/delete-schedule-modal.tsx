"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { ModalError } from "@/components/request-status/request-status-style";
import { errorMessage, isAbortError, isNotFoundError } from "@/lib/api-error";
import { deleteSchedule } from "@/lib/schedules-api";
import type { Schedule } from "../schedule-content";
import {
  ModalActions,
  ModalCancelButton,
  ModalDangerButton,
  ModalDescription,
  ModalDialog,
  ModalTitle,
} from "../notice/page-style";

// Figma에 일정 삭제 모달이 없어 공지 삭제 모달과 같은 형태로 씀
export function DeleteScheduleModal({
  schedule,
  onClose,
  onDeleted,
}: {
  schedule: Pick<Schedule, "id" | "title">;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  // 진행 중인 삭제 요청. 화면을 떠나면 취소해서 결과로 다른 화면을 바꾸지 않게 함
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  useLayoutEffect(() => {
    return () => {
      requestRef.current?.abort();
      requestRef.current = null;
    };
  }, []);

  const handleDelete = async () => {
    if (deleting) return;
    const request = new AbortController();
    requestRef.current = request;
    setDeleting(true);
    setError("");
    try {
      await deleteSchedule(schedule.id, request.signal);
    } catch (deleteError) {
      if (isAbortError(deleteError) || request.signal.aborted) return;
      // 이미 지워진 일정(404)은 지운 것과 같으므로 목록에서 빼고 닫음
      if (!isNotFoundError(deleteError)) {
        setError(errorMessage(deleteError, "일정을 삭제하지 못했습니다."));
        setDeleting(false);
        requestRef.current = null;
        return;
      }
    }
    requestRef.current = null;
    setDeleting(false);
    // 닫으면 포커스가 지울 행의 삭제 버튼으로 돌아가므로, 먼저 닫고 부모가 포커스를 옮기게 함
    dialogRef.current?.close();
    onDeleted();
  };

  return (
    <ModalDialog
      ref={dialogRef}
      onClose={onClose}
      // 삭제 요청 중에는 Esc로 닫지 않음
      onCancel={(event) => {
        if (deleting) event.preventDefault();
      }}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
    >
      <ModalTitle id={`${id}-title`}>
        &apos;{schedule.title}&apos; 일정을 삭제할까요?
      </ModalTitle>
      <ModalDescription id={`${id}-description`}>
        삭제하면 되돌릴 수 없습니다.
      </ModalDescription>
      {error && <ModalError role="alert">{error}</ModalError>}
      <ModalActions method="dialog">
        {/* 되돌릴 수 없는 동작이라 취소에 먼저 포커스를 둠 */}
        <ModalCancelButton
          type="submit"
          value="cancel"
          autoFocus
          disabled={deleting}
        >
          취소
        </ModalCancelButton>
        <ModalDangerButton
          type="button"
          disabled={deleting}
          onClick={handleDelete}
        >
          {deleting ? "삭제 중…" : "삭제"}
        </ModalDangerButton>
      </ModalActions>
    </ModalDialog>
  );
}
