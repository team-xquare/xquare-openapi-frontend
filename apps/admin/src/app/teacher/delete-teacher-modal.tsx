"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { DeleteModal } from "@/components/delete-modal";
import { errorMessage, isAbortError, isNotFoundError } from "@/lib/api-error";
import { deleteTeacher, type TeacherResponse } from "@/lib/teachers-api";
import { formatHomeroom } from "./teacher-content";

// 목록과 수정 화면이 같이 쓰는 교직원 삭제 확인 모달
export function DeleteTeacherModal({
  teacher,
  onClose,
  onDeleted,
}: {
  teacher: Pick<TeacherResponse, "id" | "name" | "grade" | "classNum" | "club">;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  // 진행 중인 삭제 요청. 화면을 떠나면 취소해서 결과로 다른 화면을 바꾸지 않게 함
  const requestRef = useRef<AbortController | null>(null);
  const homeroom = formatHomeroom(teacher);

  useLayoutEffect(() => {
    return () => {
      requestRef.current?.abort();
      requestRef.current = null;
    };
  }, []);

  const handleDelete = async () => {
    const request = new AbortController();
    requestRef.current = request;
    setDeleting(true);
    setError("");
    try {
      await deleteTeacher(teacher.id, request.signal);
    } catch (deleteError) {
      if (isAbortError(deleteError) || request.signal.aborted) return;
      // 이미 지워진 교직원(404)은 지운 것과 같으므로 목록에서 빼고 닫음
      if (!isNotFoundError(deleteError)) {
        setError(errorMessage(deleteError, "교직원을 삭제하지 못했습니다."));
        setDeleting(false);
        requestRef.current = null;
        return;
      }
    }
    requestRef.current = null;
    setDeleting(false);
    onDeleted();
    onClose();
  };

  return (
    <DeleteModal
      title={`${teacher.name} 교직원을 삭제할까요?`}
      relations={[
        // 담당 동아리가 없으면 정리될 연결이 없으므로 뺌
        ...(teacher.club
          ? [
              {
                title: `담당 동아리 ${teacher.club.name}`,
                description: `${teacher.club.name}의 담당 선생님이 미지정으로 바뀝니다`,
              },
            ]
          : []),
        {
          title: "자습 감독 배정",
          description: "해당 교직원의 자습 감독 배정이 함께 정리됩니다",
        },
        ...(homeroom
          ? [
              {
                title: `${homeroom} 담임`,
                description: "담임 정보가 함께 지워집니다",
              },
            ]
          : []),
      ]}
      pending={deleting}
      error={error || undefined}
      onCancel={onClose}
      onConfirm={handleDelete}
    />
  );
}
