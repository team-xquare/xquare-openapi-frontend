"use client";

import { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { Modal } from "../../components/modal";
import { Xquare_colors } from "../../index";

const API_KEY = "xq_test_d41e07b9c3a2f5168e2b";

export function ReissueConfirmModal({
  // apiName,
  onClose,
  onConfirm,
}: {
  apiName: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      title="API 키를 재발급할까요?"
      description={
        <>
          {/* {apiName} API */}
          학생 정보 조회 API
          <br />
          재발급하면 지금 쓰는 키(xq_test_8f3a••••a0c9)는 바로 쓸 수 없게
          됩니다. 이 키를 쓰는 서비스의 설정도 바꿔 주세요. 새 키는 재발급일부터
          1년 동안 쓸 수 있습니다.
        </>
      }
      confirmLabel="재발급"
      cancelLabel="취소"
      descriptionAlign="left"
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}

export function ApiKeySuccessModal({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard?.writeText(API_KEY);
    setCopied(true);
  };

  return (
    <SuccessDialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="api-key-success-title"
    >
      <h2 id="api-key-success-title">새 API 키가 발급되었습니다</h2>
      <p>학생 정보 조회 API · 만료일 2027-10-27</p>
      <KeyRow>
        <code>{API_KEY}</code>
        <CopyButton type="button" onClick={handleCopy}>
          {copied ? "복사됨" : "키 복사"}
        </CopyButton>
      </KeyRow>
      <small>
        이 키는 지금만 전체가 표시됩니다. 복사해 안전한 곳에 보관해 주세요.
      </small>
      <ConfirmButton type="button" onClick={() => dialogRef.current?.close()}>
        확인
      </ConfirmButton>
    </SuccessDialog>
  );
}

const SuccessDialog = styled.dialog`
  border: 0;
  border-radius: 14px;
  color: ${Xquare_colors.slate[900]};
  margin: auto;
  padding: 32px;
  width: 430px;
  &::backdrop {
    background: ${Xquare_colors.black}80;
  }

  h2 {
    font-size: 21px;
    margin: 0 0 12px;
  }

  p {
    color: ${Xquare_colors.gray[600]};
    font-size: 13px;
    margin: 0 0 14px;
  }

  small {
    color: ${Xquare_colors.red[500]};
    display: block;
    font-size: 11px;
    margin: 10px 0 22px;
  }
`;

const KeyRow = styled.div`
  align-items: center;
  background: ${Xquare_colors.gray[700]};
  border-radius: 6px;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding: 12px 14px;

  code {
    color: ${Xquare_colors.white};
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const CopyButton = styled.button`
  background: ${Xquare_colors.blue[500]};
  border: 0;
  border-radius: 6px;
  color: ${Xquare_colors.white};
  cursor: pointer;
  font-weight: 700;
  padding: 10px 16px;
  white-space: nowrap;
`;

const ConfirmButton = styled.button`
  background: ${Xquare_colors.blue[500]};
  border: 0;
  border-radius: 8px;
  color: ${Xquare_colors.white};
  cursor: pointer;
  font-weight: 600;
  min-height: 44px;
  padding: 10px 24px;
`;
