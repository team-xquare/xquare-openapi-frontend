"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { DeleteModal } from "@/components/delete-modal";
import { errorMessage, isAbortError, isNotFoundError } from "@/lib/api-error";
import { deleteStudent, type StudentResponse } from "@/lib/students-api";
import { getStudentDeleteRelations } from "./student-content";

// 목록과 수정 화면이 같이 쓰는 학생 삭제 확인 모달
export function DeleteStudentModal({
  student,
  onClose,
  onDeleted,
}: {
  student: Pick<StudentResponse, "id" | "name" | "club">;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  // 진행 중인 삭제 요청. 화면을 떠나면 취소해서 결과로 다른 화면을 바꾸지 않게 함
  const requestRef = useRef<AbortController | null>(null);

  useLayoutEffect(() => {
    return () => {
      requestRef.current?.abort();
      requestRef.current = null;
    };
  }, []);

  const handleDelete = async () => {
    if (requestRef.current) return;
    const request = new AbortController();
    requestRef.current = request;
    setPending(true);
    setError("");
    try {
      await deleteStudent(student.id, request.signal);
    } catch (deleteError) {
      if (isAbortError(deleteError) || request.signal.aborted) return;
      // 이미 지워진 학생(404)은 지운 것과 같으므로 목록에서 빼고 닫음
      if (!isNotFoundError(deleteError)) {
        setError(errorMessage(deleteError, "학생을 삭제하지 못했습니다."));
        setPending(false);
        requestRef.current = null;
        return;
      }
    }
    requestRef.current = null;
    setPending(false);
    onDeleted();
    onClose();
  };

  return (
    <DeleteModal
      title={`${student.name} 학생을 삭제할까요?`}
      relations={getStudentDeleteRelations(student)}
      pending={pending}
      error={error}
      onCancel={onClose}
      onConfirm={handleDelete}
    />
  );
}
