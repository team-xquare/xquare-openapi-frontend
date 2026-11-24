"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import {
  errorMessage,
  isAbortError,
  isNotFoundError,
  type NoticeSummary,
} from "../notice-content";
import {
  ModalActions,
  ModalCancelButton,
  ModalDangerButton,
  ModalDescription,
  ModalDialog,
  ModalError,
  ModalTitle,
} from "./page-style";

// Figma에 공지 삭제 모달이 없어 디자인 시스템 Modal(Type=Danger)과
// 다른 메뉴의 삭제 확인 모달 문구를 따름
export function DeleteNoticeModal({
  notice,
  onClose,
  onDeleted,
}: {
  notice: Pick<NoticeSummary, "id" | "title">;
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
      await api.delete(`/notices/${encodeURIComponent(notice.id)}`, {
        signal: request.signal,
      });
    } catch (deleteError) {
      if (isAbortError(deleteError) || request.signal.aborted) return;
      // 이미 지워진 공지(404)는 지운 것과 같으므로 목록에서 빼고 닫음
      if (!isNotFoundError(deleteError)) {
        setError(errorMessage(deleteError, "공지를 삭제하지 못했습니다."));
        setDeleting(false);
        requestRef.current = null;
        return;
      }
    }
    requestRef.current = null;
    setDeleting(false);
    // 먼저 닫아야 함. 모달이 열려 있는 동안에는 바깥 요소에 포커스를 줄 수 없어서
    // onDeleted에서 옮긴 포커스가 무시되고, 지워질 행의 버튼으로 돌아갔다가 사라졌음
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
      {/* 공지 제목이 문장이라 따옴표로 감싸 "DMS 동아리를 삭제할까요?"와 같은 형태로 씀 */}
      <ModalTitle id={`${id}-title`}>&apos;{notice.title}&apos; 공지를 삭제할까요?</ModalTitle>
      <ModalDescription id={`${id}-description`}>
        삭제하면 되돌릴 수 없습니다.
      </ModalDescription>
      {error && <ModalError role="alert">{error}</ModalError>}
      <ModalActions method="dialog">
        {/* 되돌릴 수 없는 동작이라 취소에 먼저 포커스를 둠 */}
        <ModalCancelButton type="submit" value="cancel" autoFocus disabled={deleting}>
          취소
        </ModalCancelButton>
        <ModalDangerButton type="button" disabled={deleting} onClick={handleDelete}>
          {deleting ? "삭제 중…" : "삭제"}
        </ModalDangerButton>
      </ModalActions>
    </ModalDialog>
  );
}
