"use client";

import type { Student } from "./student-content";
import {
  DeleteModal,
  DeleteModalActions,
  DeleteModalCancel,
  DeleteModalConfirm,
  DeleteModalDescription,
  DeleteModalDialog,
  DeleteModalHeading,
  DeleteModalOverlay,
  DeleteModalRelation,
  DeleteModalRelations,
} from "./page-style";

type DeleteStudentModalProps = {
  student: Student | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteStudentModal({
  student,
  onCancel,
  onConfirm,
}: DeleteStudentModalProps) {
  if (!student) return null;

  return (
    <DeleteModalOverlay>
      <DeleteModal
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-student-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) onCancel();
        }}
      >
        <DeleteModalDialog>
          <DeleteModalHeading id="delete-student-title">
            {student.name} 학생을 삭제할까요?
          </DeleteModalHeading>
          <DeleteModalDescription>
            삭제하면 되돌릴 수 없습니다. 아래 연결이 함께 정리됩니다.
          </DeleteModalDescription>
          <DeleteModalRelations>
            <DeleteModalRelation>
              <strong>· {student.club} 팀장</strong>
              <span>팀장이 비게 됩니다. 동아리 수정에서 새 팀장을 정해 주세요</span>
            </DeleteModalRelation>
            <DeleteModalRelation>
              <strong>· {student.club} 구성원 5명</strong>
              <span>구성원 목록에서 빠져 4명이 됩니다</span>
            </DeleteModalRelation>
          </DeleteModalRelations>
          <DeleteModalActions>
            <DeleteModalCancel type="button" onClick={onCancel}>
              취소
            </DeleteModalCancel>
            <DeleteModalConfirm type="button" onClick={onConfirm}>
              삭제
            </DeleteModalConfirm>
          </DeleteModalActions>
        </DeleteModalDialog>
      </DeleteModal>
    </DeleteModalOverlay>
  );
}
