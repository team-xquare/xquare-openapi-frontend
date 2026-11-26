"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { ModalError } from "@/components/request-status/request-status-style";
import { errorMessage, isAbortError, isNotFoundError } from "@/lib/api-error";
import { deleteClub, type ClubResponse } from "@/lib/clubs-api";
import { formatClubRoom, getClubMembers } from "../club-content";
import { SecondaryButton } from "../notice/page-style";
import {
  ClubModalActions,
  ClubModalDescription,
  ClubModalDialog,
  ClubModalTitle,
  EffectItem,
  EffectList,
  ModalDangerButton,
} from "./page-style";

// Figma `공통 · 삭제 확인 모달 · 동아리`. 삭제하면 같이 정리되는 연결을 보여 줌
export function DeleteClubModal({
  club,
  onClose,
  onDeleted,
}: {
  club: ClubResponse;
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
      await deleteClub(club.id, request.signal);
    } catch (deleteError) {
      if (isAbortError(deleteError) || request.signal.aborted) return;
      // 이미 지워진 동아리(404)는 지운 것과 같으므로 목록에서 빼고 닫음
      if (!isNotFoundError(deleteError)) {
        setError(errorMessage(deleteError, "동아리를 삭제하지 못했습니다."));
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
    <ClubModalDialog
      ref={dialogRef}
      onClose={onClose}
      // 삭제 요청 중에는 Esc로 닫지 않음
      onCancel={(event) => {
        if (deleting) event.preventDefault();
      }}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
    >
      <ClubModalTitle id={`${id}-title`}>
        {club.name} 동아리를 삭제할까요?
      </ClubModalTitle>
      <ClubModalDescription id={`${id}-description`}>
        삭제하면 되돌릴 수 없습니다. 아래 연결이 함께 정리됩니다.
      </ClubModalDescription>
      <EffectList>
        <EffectItem>
          <div>
            <strong>구성원 {getClubMembers(club).length}명</strong>
            <span>소속 동아리가 없음으로 바뀝니다</span>
          </div>
        </EffectItem>
        {/* 담당 선생님이나 교실이 없으면 정리할 연결도 없어 빼고 보여 줌 */}
        {club.teacher && (
          <EffectItem>
            <div>
              <strong>담당 선생님 {club.teacher.name}</strong>
              <span>담당 동아리가 없음으로 바뀝니다</span>
            </div>
          </EffectItem>
        )}
        {club.room && (
          <EffectItem>
            <div>
              <strong>사용 교실 {formatClubRoom(club.room)}</strong>
              <span>비워져 다른 동아리가 쓸 수 있습니다</span>
            </div>
          </EffectItem>
        )}
      </EffectList>
      {error && <ModalError role="alert">{error}</ModalError>}
      <ClubModalActions method="dialog">
        {/* 되돌릴 수 없는 동작이라 취소에 먼저 포커스를 둠 */}
        <SecondaryButton
          type="submit"
          value="cancel"
          autoFocus
          disabled={deleting}
        >
          취소
        </SecondaryButton>
        <ModalDangerButton
          type="button"
          disabled={deleting}
          onClick={handleDelete}
        >
          {deleting ? "삭제 중…" : "삭제"}
        </ModalDangerButton>
      </ClubModalActions>
    </ClubModalDialog>
  );
}
