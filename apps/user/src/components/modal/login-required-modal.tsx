"use client";

import { Modal } from "./modal";

interface LoginRequiredModalProps {
  onClose: () => void;
  onLogin: () => void;
}

export function LoginRequiredModal({
  onClose,
  onLogin,
}: LoginRequiredModalProps) {
  return (
    <Modal
      title="로그인이 필요합니다"
      description="활용신청은 로그인 후 이용할 수 있습니다. 로그인하면 작성 중인 내용이 그대로 유지됩니다."
      confirmLabel="로그인하기"
      cancelLabel="취소"
      onConfirm={onLogin}
      onClose={onClose}
    />
  );
}
