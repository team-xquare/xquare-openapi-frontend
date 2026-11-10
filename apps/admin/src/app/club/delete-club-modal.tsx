"use client";

import { useEffect, useId, useRef } from "react";
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
  name,
  room,
  memberCount,
  teacher,
  onClose,
  onConfirm,
}: {
  name: string;
  room: string;
  memberCount: number;
  teacher?: string;
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
    <ClubModalDialog
      ref={dialogRef}
      onClose={(event) => {
        if (event.currentTarget.returnValue === "confirm") onConfirm();
        onClose();
      }}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
    >
      <ClubModalTitle id={`${id}-title`}>{name} 동아리를 삭제할까요?</ClubModalTitle>
      <ClubModalDescription id={`${id}-description`}>
        삭제하면 되돌릴 수 없습니다. 아래 연결이 함께 정리됩니다.
      </ClubModalDescription>
      <EffectList>
        <EffectItem>
          <div>
            <strong>구성원 {memberCount}명</strong>
            <span>소속 동아리가 없음으로 바뀝니다</span>
          </div>
        </EffectItem>
        {/* 담당 선생님이 없으면 정리할 연결도 없어 빼고 보여 줌 */}
        {teacher && (
          <EffectItem>
            <div>
              <strong>담당 선생님 {teacher}</strong>
              <span>담당 동아리가 없음으로 바뀝니다</span>
            </div>
          </EffectItem>
        )}
        <EffectItem>
          <div>
            <strong>사용 교실 {room}</strong>
            <span>비워져 다른 동아리가 쓸 수 있습니다</span>
          </div>
        </EffectItem>
      </EffectList>
      <ClubModalActions method="dialog">
        {/* 되돌릴 수 없는 동작이라 취소에 먼저 포커스를 둠 */}
        <SecondaryButton type="submit" value="cancel" autoFocus>
          취소
        </SecondaryButton>
        <ModalDangerButton type="submit" value="confirm">
          삭제
        </ModalDangerButton>
      </ClubModalActions>
    </ClubModalDialog>
  );
}
