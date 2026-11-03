"use client";

import { Modal } from "../../components/modal";

interface ApplyConfirmModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export function ApplyConfirmModal({
  onClose,
  onConfirm,
}: ApplyConfirmModalProps) {
  return (
    <Modal
      title="이 내용으로 신청할까요?"
      description={
        <>
          학생 정보 조회 API · 개발계정
          <br />
          신청하면 바로 API 키가 발급됩니다.
        </>
      }
      confirmLabel="신청하기"
      cancelLabel="다시 확인"
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
