import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { errorMessage, isAbortError } from "@/lib/api-error";
import {
  fetchTeacherChoices,
  type SupervisionTeacher,
} from "../supervisor-content";

// 목록 조회 조건과 등록 · 수정 폼이 같이 쓰는 감독 교직원 선택지.
// 불러오지 못해도 화면의 나머지는 쓸 수 있도록 실패 문구만 따로 돌려줌
export function useTeacherChoices() {
  const router = useRouter();
  // 처음 불러오기 전에는 null
  const [teachers, setTeachers] = useState<SupervisionTeacher[] | null>(null);
  const [error, setError] = useState("");
  // 바뀌면 다시 불러옴 (다시 시도)
  const [reloadKey, setReloadKey] = useState(0);

  // 다른 화면에서 돌아와 다시 보일 때도 effect가 다시 돌아 최신 목록을 받음
  useEffect(() => {
    // 등록 화면은 따로 불러오는 게 이것뿐이라 로그인 확인도 여기서 함
    if (!api.auth.isLoggedIn()) {
      router.replace("/login");
      return;
    }
    const request = new AbortController();
    fetchTeacherChoices(request.signal)
      .then((list) => {
        setTeachers(list);
        setError("");
      })
      .catch((loadError: unknown) => {
        if (isAbortError(loadError) || request.signal.aborted) return;
        // 선택 칸 옆에 따로 뜨는 문구라 무엇을 못 불러왔는지 서버 문구 앞에 붙임
        const detail = errorMessage(loadError, "");
        setError(
          detail
            ? `교직원 목록을 불러오지 못했습니다. ${detail}`
            : "교직원 목록을 불러오지 못했습니다.",
        );
      });
    return () => request.abort();
  }, [router, reloadKey]);

  const retry = () => {
    setError("");
    setReloadKey((key) => key + 1);
  };

  return { teachers, error, retry };
}
