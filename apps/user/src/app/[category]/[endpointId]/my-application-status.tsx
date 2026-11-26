"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@xquare/api";
import { api } from "@/lib/api";
import {
  API_FIELD_LABELS,
  fetchMyProjects,
  type ApiField,
  type ProjectFieldResponse,
} from "@/lib/projects-api";
import {
  StatusLine,
  StatusLink,
  StatusList,
  StatusRetryButton,
} from "./page-style";

// 이 API 분야를 신청한 내 프로젝트
interface FieldApplication {
  projectId: number;
  projectName: string;
  field: ProjectFieldResponse;
}

type LoadState =
  | { kind: "loading" }
  | { kind: "logged-out" }
  | { kind: "error"; message: string }
  | { kind: "loaded"; applications: FieldApplication[] };

const statusText = ({ status, rejectReason }: ProjectFieldResponse) => {
  if (status === "PENDING") return "승인 대기 (관리자 승인 후 호출 가능)";
  if (status === "APPROVED") return "승인 (이 프로젝트의 API 키로 호출 가능)";
  return rejectReason ? `반려 (사유: ${rejectReason})` : "반려";
};

// 이용 조건의 '내 신청 상태' 값. 로그인한 사용자의 프로젝트에서 이 분야의 신청 상태를 보여 줌
export function MyApplicationStatus({ field }: { field: ApiField }) {
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  // 바뀌면 다시 불러옴 (다시 시도)
  const [reloadKey, setReloadKey] = useState(0);

  // 다른 화면에서 로그인 · 신청하고 돌아와 다시 보일 때도 effect가 다시 돌아 최신 상태를 받음
  useEffect(() => {
    const request = new AbortController();
    // 로그인 여부는 저장소를 읽어야 해서 렌더 중이 아니라 effect에서 확인.
    // 결과는 요청이 끝난 뒤(또는 다음 틱에) 넣어서 effect 안에서 바로 상태를 바꾸지 않음
    Promise.resolve()
      .then(() => {
        if (!api.auth.isLoggedIn()) return null;
        return fetchMyProjects(request.signal);
      })
      .then((projects) => {
        if (request.signal.aborted) return;
        if (!projects) {
          setState({ kind: "logged-out" });
          return;
        }
        setState({
          kind: "loaded",
          applications: projects.flatMap((project) =>
            project.fields
              .filter((item) => item.field === field)
              .map((item) => ({
                projectId: project.projectId,
                projectName: project.name,
                field: item,
              })),
          ),
        });
      })
      .catch((error: unknown) => {
        if (request.signal.aborted) return;
        setState({
          kind: "error",
          message:
            error instanceof ApiError
              ? error.message
              : "신청 상태를 불러오지 못했습니다.",
        });
      });
    return () => request.abort();
  }, [field, reloadKey]);

  if (state.kind === "loading") {
    return <StatusLine role="status">신청 상태를 불러오는 중입니다.</StatusLine>;
  }

  if (state.kind === "logged-out") {
    return (
      <StatusLine>
        로그인하면 내 프로젝트의 신청 상태를 볼 수 있습니다.{" "}
        <StatusLink href="/login">로그인</StatusLink>
      </StatusLine>
    );
  }

  if (state.kind === "error") {
    return (
      <StatusLine role="alert">
        {state.message}{" "}
        <StatusRetryButton
          type="button"
          onClick={() => {
            setState({ kind: "loading" });
            setReloadKey((key) => key + 1);
          }}
        >
          다시 시도
        </StatusRetryButton>
      </StatusLine>
    );
  }

  if (state.applications.length === 0) {
    return (
      <StatusLine>
        아직 {API_FIELD_LABELS[field]} 분야를 신청한 프로젝트가 없습니다.{" "}
        <StatusLink href="/apply">활용신청</StatusLink>
      </StatusLine>
    );
  }

  return (
    <StatusList>
      {state.applications.map((application) => (
        <li key={application.projectId}>
          {application.projectName} · {API_FIELD_LABELS[field]} 분야{" "}
          {statusText(application.field)}
        </li>
      ))}
    </StatusList>
  );
}
