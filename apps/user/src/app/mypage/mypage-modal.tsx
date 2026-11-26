"use client";

import { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { Modal } from "../../components/modal";
import {
  ModalDescription,
  ModalDialog,
  ModalTitle,
  PrimaryButton,
  SecondaryButton,
} from "../../components/modal/modal-style";
import { Xquare_colors } from "../../index";

export function ProjectNameEditModal({
  projectName,
  onClose,
  onSave,
}: {
  projectName: string;
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(projectName);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <ModalDialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="project-edit-title"
    >
      <ModalTitle id="project-edit-title">프로젝트 이름 수정</ModalTitle>
      <ProjectNameInput
        autoFocus
        aria-label="프로젝트 이름"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <ModalDescription align="left">
        이름만 바뀌고 API 키와 신청 분야는 그대로입니다.
      </ModalDescription>
      <ModalButtons>
        <PrimaryButton
          type="button"
          disabled={!name.trim()}
          onClick={() => {
            onSave(name.trim());
            dialogRef.current?.close();
          }}
        >
          저장
        </PrimaryButton>
        <SecondaryButton
          type="button"
          onClick={() => dialogRef.current?.close()}
        >
          취소
        </SecondaryButton>
      </ModalButtons>
    </ModalDialog>
  );
}

export function ProjectDeleteModal({
  projectName,
  apiKey,
  areas,
  onClose,
  onDelete,
}: {
  projectName: string;
  apiKey: string;
  areas: string[];
  onClose: () => void;
  onDelete: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <ModalDialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="project-delete-title"
    >
      <ModalTitle id="project-delete-title">프로젝트를 삭제할까요?</ModalTitle>
      <ModalDescription align="left">
        {projectName} 프로젝트와 API 키, 신청 분야(
        {areas.length > 0 ? areas.join(", ") : "없음"})가 모두 삭제됩니다.
        <br />
        지금 쓰는 키({apiKey || "아직 발급되지 않음"})는 바로 쓸 수 없게 되고,
        다시 쓰려면 새 프로젝트로 신청해야 합니다.
      </ModalDescription>
      <DeleteModalButtons>
        <DeleteConfirmButton
          type="button"
          onClick={() => {
            onDelete();
            dialogRef.current?.close();
          }}
        >
          삭제
        </DeleteConfirmButton>
        <SecondaryButton
          type="button"
          onClick={() => dialogRef.current?.close()}
        >
          취소
        </SecondaryButton>
      </DeleteModalButtons>
    </ModalDialog>
  );
}

const API_KEY = "xq_test_d41e07b9c3a2f5168e2b";

export function ReissueConfirmModal({
  projectName,
  apiKey,
  onClose,
  onConfirm,
}: {
  projectName: string;
  apiKey: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      title={`${projectName} 키를 재발급할까요?`}
      description={
        <>
          재발급하면 {projectName}의 키 값만 바뀌고, 이 프로젝트의 신청 분야
          (동아리, 일정)는 그대로 유지됩니다.
          <br />
          지금 쓰는 키({apiKey})는 바로 쓸 수 없게 되고, 이 키를 쓰는 서비스의
          설정도 바꿔 주세요. 새 키는 재발급일부터 60일 동안 쓸 수 있고, 다른
          프로젝트의 키는 바뀌지 않습니다.
          <br />
          재발급을 누르면 학교 이메일로 인증 코드를 보냅니다.
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

export function ApiKeySuccessModal({
  projectName,
  areas,
  onClose,
}: {
  projectName: string;
  areas: string[];
  onClose: () => void;
}) {
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
      <p>
        {projectName} · 신청 분야:{" "}
        {areas.length > 0 ? areas.join(", ") : "없음"} (그대로) · 만료일
        2027-01-19 (오늘부터 60일)
      </p>
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
  text-align: left;
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

const DeleteModalButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 30px;
`;

const DeleteConfirmButton = styled(PrimaryButton)`
  background: ${Xquare_colors.red[500]};
  border-color: ${Xquare_colors.red[500]};
  font-size: 15px;
  font-weight: 600;
  min-height: 44px;
  padding: 10px 24px;
`;

const ProjectNameInput = styled.input`
  border: 1px solid ${Xquare_colors.slate[400]};
  border-radius: 8px;
  box-sizing: border-box;
  color: ${Xquare_colors.slate[900]};
  font: inherit;
  font-size: 16px;
  outline: none;
  padding: 12px 14px;
  width: 100%;

  &:focus {
    border-color: ${Xquare_colors.blue[500]};
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 30px;
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
