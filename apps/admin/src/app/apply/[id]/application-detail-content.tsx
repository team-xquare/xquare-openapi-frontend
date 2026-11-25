"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  errorMessage,
  isAbortError,
  isNotFoundError,
} from "../../notice-content";
import {
  FIELD_LABELS,
  REJECT_REASON_MAX_LENGTH,
  STATUS_LABELS,
  approveApplication,
  fetchApplication,
  isAlreadyDecidedError,
  rejectApplication,
  type ApplicationDetail,
} from "../apply-content";
import { StatusText } from "../page-style";
import {
  ActionBar,
  ActionGroup,
  ActionMessage,
  ApproveButton,
  BackLink,
  DetailCard,
  DetailPage,
  DetailRow,
  LoadButton,
  LoadStatus,
  PageDescription,
  PageHead,
  PageTitle,
  ReasonHelp,
  ReasonTextarea,
  RejectButton,
  TierValue,
} from "./page-style";

export function ApplicationDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const [application, setApplication] = useState<ApplicationDetail | null>(
    null,
  );
  const [loadError, setLoadError] = useState<{
    id: string;
    message: string;
    notFound: boolean;
  } | null>(null);
  // 바뀌면 다시 불러옴 (다시 시도)
  const [reloadKey, setReloadKey] = useState(0);
  const [reason, setReason] = useState("");
  // 승인 · 반려 요청 중이면 어느 쪽인지
  const [deciding, setDeciding] = useState<"approve" | "reject" | null>(null);
  // 승인 · 반려 결과 안내. 실패면 isError
  const [actionMessage, setActionMessage] = useState<{
    id: string;
    text: string;
    isError: boolean;
  } | null>(null);
  // 반려를 눌렀는데 사유가 비어 있으면 입력칸에 오류 표시
  const [reasonMissing, setReasonMissing] = useState(false);

  // 다른 화면에서 돌아와 다시 보일 때도 effect가 다시 돌아 최신 내용을 받음
  useEffect(() => {
    // 로그인 여부는 저장소를 읽어야 해서 렌더 중이 아니라 effect에서 확인
    if (!api.auth.isLoggedIn()) {
      router.replace("/login");
      return;
    }
    const request = new AbortController();
    fetchApplication(id, request.signal)
      .then((loaded) => {
        setApplication(loaded);
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (isAbortError(error) || request.signal.aborted) return;
        setLoadError({
          id,
          message: errorMessage(error, "활용신청을 불러오지 못했습니다."),
          notFound: isNotFoundError(error),
        });
      });
    return () => request.abort();
  }, [id, router, reloadKey]);

  // 다른 id의 내용이 잠깐 보이지 않도록 id가 같을 때만 보여 줌
  const shown = application?.id === id ? application : null;
  const errorHere = loadError?.id === id ? loadError : null;

  if (!shown || errorHere) {
    return (
      <DetailPage>
        <PageHead>
          <PageTitle>활용신청 상세</PageTitle>
        </PageHead>
        {errorHere ? (
          <LoadStatus role="alert">
            <p>{errorHere.message}</p>
            <ActionGroup>
              <BackLink href="/apply">목록으로</BackLink>
              {/* 없는 신청(404)은 다시 불러와도 같으므로 목록으로만 보냄 */}
              {!errorHere.notFound && (
                <LoadButton
                  type="button"
                  onClick={() => {
                    setLoadError(null);
                    setReloadKey((key) => key + 1);
                  }}
                >
                  다시 시도
                </LoadButton>
              )}
            </ActionGroup>
          </LoadStatus>
        ) : (
          <LoadStatus role="status">
            <p>활용신청을 불러오는 중입니다.</p>
          </LoadStatus>
        )}
      </DetailPage>
    );
  }

  const { applicant, tier } = shown;
  const isPending = shown.status === "PENDING";
  const messageHere = actionMessage?.id === id ? actionMessage : null;

  const decide = async (action: "approve" | "reject") => {
    const trimmed = reason.trim();
    if (action === "reject" && !trimmed) {
      setReasonMissing(true);
      document.getElementById("reject-reason")?.focus();
      return;
    }
    setDeciding(action);
    setActionMessage(null);
    try {
      const updated =
        action === "approve"
          ? await approveApplication(id)
          : await rejectApplication(id, trimmed);
      setApplication(updated);
      setReason("");
      setActionMessage({
        id,
        text: action === "approve" ? "승인했습니다." : "반려했습니다.",
        isError: false,
      });
    } catch (error: unknown) {
      if (isAlreadyDecidedError(error)) {
        // 다른 관리자가 먼저 처리했으면 바뀐 상태를 다시 불러와 보여 줌
        setActionMessage({
          id,
          text: "이미 승인 또는 반려된 신청입니다. 바뀐 상태를 다시 불러왔습니다.",
          isError: true,
        });
        setReloadKey((key) => key + 1);
      } else {
        setActionMessage({
          id,
          text: errorMessage(
            error,
            action === "approve"
              ? "승인하지 못했습니다. 잠시 후 다시 시도해주세요."
              : "반려하지 못했습니다. 잠시 후 다시 시도해주세요.",
          ),
          isError: true,
        });
      }
    } finally {
      setDeciding(null);
    }
  };

  return (
    <DetailPage>
      <PageHead>
        <PageTitle>활용신청 상세</PageTitle>
        <PageDescription>
          {shown.projectName} · {FIELD_LABELS[shown.field]}
        </PageDescription>
      </PageHead>

      <DetailCard aria-label="활용신청 상세 정보">
        <DetailRow>
          <dt>신청자</dt>
          <dd>
            {applicant ? `${applicant.name} · ${applicant.username}` : "알 수 없음"}
          </dd>
        </DetailRow>
        <DetailRow>
          <dt>학번</dt>
          <dd>{applicant?.studentNumber ?? "—"}</dd>
        </DetailRow>
        <DetailRow>
          <dt>이메일</dt>
          <dd>{applicant?.email ?? "—"}</dd>
        </DetailRow>
        <DetailRow>
          <dt>프로젝트</dt>
          <dd>{shown.projectName}</dd>
        </DetailRow>
        <DetailRow>
          <dt>분야</dt>
          <dd>{FIELD_LABELS[shown.field]}</dd>
        </DetailRow>
        <DetailRow>
          <dt>접근 단계</dt>
          <dd>
            <TierValue $tier={tier}>
              {tier === "제한"
                ? "제한 — 개인정보가 들어간 데이터라 관리자 승인이 있어야 호출할 수 있습니다"
                : "교내 — 신청하면 자동 승인"}
            </TierValue>
          </dd>
        </DetailRow>
        <DetailRow>
          <dt>상태</dt>
          <dd>
            <StatusText $status={shown.status}>
              {STATUS_LABELS[shown.status]}
            </StatusText>
            {shown.decidedAt && ` (${shown.decidedAt} 처리)`}
          </dd>
        </DetailRow>
        {shown.status === "REJECTED" && (
          <DetailRow>
            <dt>반려 사유</dt>
            <dd>{shown.rejectReason || "—"}</dd>
          </DetailRow>
        )}
        <DetailRow>
          <dt>사용 목적</dt>
          <dd>{shown.purpose}</dd>
        </DetailRow>
        <DetailRow>
          <dt>신청일시</dt>
          <dd>{shown.appliedAt}</dd>
        </DetailRow>
        <DetailRow>
          <dt>프로젝트 분야</dt>
          <dd>
            {shown.projectFields.length > 0
              ? shown.projectFields
                  .map(
                    (item) =>
                      `${FIELD_LABELS[item.field]} (${STATUS_LABELS[item.status]})`,
                  )
                  .join(" · ")
              : "—"}
          </dd>
        </DetailRow>
        <DetailRow>
          <dt>API 키</dt>
          <dd>
            {shown.keyIssued
              ? "발급됨"
              : "아직 발급 전 (프로젝트의 첫 승인 때 발급)"}
          </dd>
        </DetailRow>
        {isPending && (
          <DetailRow>
            <dt>
              <label htmlFor="reject-reason">반려 사유</label>
            </dt>
            <dd>
              <ReasonTextarea
                id="reject-reason"
                aria-describedby="reject-reason-help"
                aria-invalid={reasonMissing || undefined}
                maxLength={REJECT_REASON_MAX_LENGTH}
                value={reason}
                disabled={deciding !== null}
                placeholder="반려할 때 신청자에게 보여 줄 사유를 적어 주세요. (예: 사용 목적을 더 자세히 적어 주세요)"
                onChange={(event) => {
                  setReason(event.target.value);
                  if (event.target.value.trim()) setReasonMissing(false);
                }}
              />
              <ReasonHelp id="reject-reason-help" $isError={reasonMissing}>
                {reasonMissing
                  ? "반려 사유를 입력해주세요."
                  : "반려 사유를 입력해야 반려할 수 있습니다"}{" "}
                ({reason.length}/{REJECT_REASON_MAX_LENGTH})
              </ReasonHelp>
            </dd>
          </DetailRow>
        )}
      </DetailCard>

      <ActionBar>
        <BackLink href="/apply">목록으로</BackLink>
        {isPending && (
          <ActionGroup>
            <RejectButton
              type="button"
              disabled={deciding !== null}
              onClick={() => decide("reject")}
            >
              {deciding === "reject" ? "반려 중…" : "반려"}
            </RejectButton>
            <ApproveButton
              type="button"
              disabled={deciding !== null}
              onClick={() => decide("approve")}
            >
              {deciding === "approve" ? "승인 중…" : "승인"}
            </ApproveButton>
          </ActionGroup>
        )}
      </ActionBar>
      {/* 승인 · 반려 결과는 화면 아래에 글로도 보여 주고 스크린 리더에도 읽힘 */}
      <ActionMessage
        role={messageHere?.isError ? "alert" : "status"}
        $isError={messageHere?.isError ?? false}
      >
        {messageHere?.text ?? ""}
      </ActionMessage>
    </DetailPage>
  );
}
