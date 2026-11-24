"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  ModalActions,
  ModalDialog,
  ModalDescription,
  ModalTitle,
  PrimaryButton,
  SecondaryButton,
} from "../../components/modal/modal-style";
import {
  CodeInput,
  CodeInputWrap,
  ResendButton,
  Timer,
  VerificationNotice,
} from "./email-verification-modal-style";

interface EmailVerificationModalProps {
  category: "club" | "schedule" | "restricted";
  onClose: () => void;
  onVerify: () => void;
}

export function EmailVerificationModal({
  category,
  onClose,
  onVerify,
}: EmailVerificationModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(300);
  const categoryLabel =
    category === "club" ? "동아리" : category === "schedule" ? "일정" : "제한";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setInterval(
      () => setSecondsLeft((seconds) => Math.max(0, seconds - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  const close = (returnValue: string) => {
    dialogRef.current?.close(returnValue);
  };

  return (
    <ModalDialog
      ref={dialogRef}
      onClose={(event) => {
        if (event.currentTarget.returnValue === "confirm") onVerify();
        onClose();
      }}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
    >
      <ModalTitle id={`${id}-title`}>
        이메일 인증 코드를 입력해 주세요
      </ModalTitle>
      <ModalDescription id={`${id}-description`}>
        jae******@dsm.hs.kr로 6자리 인증 코드를 보냈습니다.
        <br />
        {category === "restricted"
          ? "코드를 확인하면 신청이 접수되고, 관리자 승인 후 이 프로젝트의 키로 쓸 수 있습니다."
          : `코드를 확인하면 ${categoryLabel} 분야가 바로 승인되어 이 프로젝트의 키로 쓸 수 있습니다.`}
      </ModalDescription>

      <CodeInputWrap>
        <CodeInput
          aria-label="이메일 인증 코드 6자리"
          autoComplete="one-time-code"
          inputMode="numeric"
          maxLength={6}
          pattern="[0-9]{6}"
          placeholder="인증 코드 6자리"
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
          required
        />
        <Timer aria-live="polite">
          {minutes}:{seconds}
        </Timer>
      </CodeInputWrap>
      <VerificationNotice>
        코드는 5분 동안 유효합니다.{" "}
        <ResendButton type="button" onClick={() => setSecondsLeft(300)}>
          다시 받기
        </ResendButton>
      </VerificationNotice>
      <ModalActions>
        <PrimaryButton
          type="button"
          disabled={code.length !== 6}
          onClick={() => close("confirm")}
        >
          인증하고 바로 사용
        </PrimaryButton>
        <SecondaryButton
          type="button"
          autoFocus
          onClick={() => close("cancel")}
        >
          취소
        </SecondaryButton>
      </ModalActions>
    </ModalDialog>
  );
}
