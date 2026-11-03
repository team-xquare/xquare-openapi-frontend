"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  ContactActions,
  ContactDescription,
  ContactDialog,
  ContactInfo,
  ContactTitle,
  ErrorInfoList,
  ErrorInfoRow,
  PrimaryButton,
  SecondaryButton,
} from "./modal-style";

// 문의처가 아직 정해지지 않아 Figma 문구를 그대로 둠
const CONTACT_CHANNEL = "[확정 필요] 예: 디스코드 채널 또는 이메일";

const COPY_LABELS = {
  idle: "오류 정보 복사",
  copied: "복사 완료",
  failed: "복사 실패",
} as const;

export interface ErrorReport {
  code: number;
  // 실패한 요청 (예: GET /students?grade=2)
  request?: string;
  occurredAt: Date;
  requestId?: string;
}

// 2026-10-23 14:32:10 형식 (사용자 기준 시각)
function formatDateTime(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

interface ContactModalProps {
  report: ErrorReport;
  onClose: () => void;
}

export function ContactModal({ report, onClose }: ContactModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [copyState, setCopyState] = useState<keyof typeof COPY_LABELS>("idle");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  // 값이 없는 항목은 "—"로 표시
  const rows = [
    { label: "오류 코드", value: String(report.code) },
    { label: "요청", value: report.request ?? "—" },
    { label: "발생 시각", value: formatDateTime(report.occurredAt) },
    { label: "요청 ID", value: report.requestId ?? "—" },
  ];

  const handleCopy = async () => {
    const text = rows.map(({ label, value }) => `${label}: ${value}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopyState("copied");
    } catch {
      // 권한이 없거나 http 환경이면 복사가 막힘. 다시 누르면 재시도
      setCopyState("failed");
    }
  };

  return (
    <ContactDialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
    >
      <ContactTitle id={`${id}-title`}>문의하기</ContactTitle>
      <ContactDescription id={`${id}-description`}>
        아래 오류 정보를 함께 보내 주시면 원인을 빨리 찾을 수 있습니다.
      </ContactDescription>
      <ErrorInfoList aria-label="오류 정보">
        {rows.map(({ label, value }) => (
          <ErrorInfoRow key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </ErrorInfoRow>
        ))}
      </ErrorInfoList>
      <ContactInfo>
        <dt>문의처</dt>
        <dd>{CONTACT_CHANNEL}</dd>
      </ContactInfo>
      <ContactActions method="dialog">
        <PrimaryButton type="button" aria-live="polite" onClick={handleCopy}>
          {COPY_LABELS[copyState]}
        </PrimaryButton>
        <SecondaryButton type="submit">닫기</SecondaryButton>
      </ContactActions>
    </ContactDialog>
  );
}
