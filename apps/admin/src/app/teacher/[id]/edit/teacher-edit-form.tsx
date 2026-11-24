"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadStatus } from "@/components/request-status/request-status-style";
import { api } from "@/lib/api";
import { errorMessage, isAbortError, isNotFoundError } from "@/lib/api-error";
import { fetchTeacher, type TeacherResponse } from "@/lib/teachers-api";
import { TeacherForm } from "../../teacher-form";
import {
  ActionGroup,
  CancelLink as ListLink,
  PageHead,
  PageTitle,
  RegisterPage,
  SaveButton as RetryButton,
} from "../../../student/new/page-style";

// 수정 화면. 교직원을 불러온 뒤 등록과 같은 폼을 띄움
export function TeacherEditForm({ id }: { id: string }) {
  const router = useRouter();
  const [teacher, setTeacher] = useState<TeacherResponse | null>(null);
  const [loadError, setLoadError] = useState<{
    message: string;
    notFound: boolean;
  } | null>(null);
  // 바뀌면 교직원을 다시 불러옴 (다시 시도)
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // 로그인 여부는 저장소를 읽어야 해서 렌더 중이 아니라 effect에서 확인
    if (!api.auth.isLoggedIn()) {
      router.replace("/login");
      return;
    }
    const request = new AbortController();
    fetchTeacher(id, request.signal)
      .then((loaded) => {
        setTeacher(loaded);
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (isAbortError(error) || request.signal.aborted) return;
        setLoadError({
          message: errorMessage(error, "교직원을 불러오지 못했습니다."),
          notFound: isNotFoundError(error),
        });
      });
    return () => request.abort();
  }, [id, router, reloadKey]);

  // 같은 교직원을 다시 불러와도 입력 중인 폼이 초기화되지 않도록 내용으로 폼을 구분.
  // 응답에 수정일시가 없어 내용이 바뀌었을 때만 새 값으로 다시 그림
  if (teacher && !loadError) {
    return <TeacherForm key={JSON.stringify(teacher)} teacher={teacher} />;
  }

  return (
    <RegisterPage>
      <PageHead>
        <PageTitle>교직원 수정</PageTitle>
      </PageHead>
      {loadError ? (
        <LoadStatus role="alert">
          <p>{loadError.message}</p>
          <ActionGroup>
            {/* 없는 교직원(404)은 다시 불러와도 같으므로 목록으로만 보냄 */}
            {!loadError.notFound && (
              <RetryButton
                type="button"
                onClick={() => {
                  setLoadError(null);
                  setReloadKey((key) => key + 1);
                }}
              >
                다시 시도
              </RetryButton>
            )}
            <ListLink href="/teacher">목록으로</ListLink>
          </ActionGroup>
        </LoadStatus>
      ) : (
        <LoadStatus role="status">
          <p>교직원을 불러오는 중입니다.</p>
        </LoadStatus>
      )}
    </RegisterPage>
  );
}
