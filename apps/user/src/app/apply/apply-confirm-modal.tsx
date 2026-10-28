"use client";

import { Modal } from "../../components/modal";

interface ApplyConfirmModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export function ApplyConfirmModal({ onClose, onConfirm }: ApplyConfirmModalProps) {
  return (
    <Modal
      title="이 내용으로 신청할까요?"
      description={
        <>
          학생 정보 조회 API · 개발계정
          <br />
          제출 후에는 담당자 검토 단계로 넘어가며, 내용 수정은 반려 후 가능합니다.
        </>
      }
      confirmLabel="신청하기"
      cancelLabel="다시 확인"
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
