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
  TYPE_LABELS,
  fetchApplication,
  tierOf,
  type ApplicationDetail,
} from "../apply-content";
import {
  ActionBar,
  ActionGroup,
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

  const tier = tierOf(shown.field);
  const isRestricted = tier === "제한";
  const { applicant } = shown;

  return (
    <DetailPage>
      <PageHead>
        <PageTitle>활용신청 상세</PageTitle>
        <PageDescription>
          {shown.serviceName} · {FIELD_LABELS[shown.field]}
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
          <dt>분야</dt>
          <dd>{FIELD_LABELS[shown.field]}</dd>
        </DetailRow>
        <DetailRow>
          <dt>접근 단계</dt>
          <dd>
            <TierValue $tier={tier}>
              {isRestricted
                ? "제한 — 개인정보가 들어간 데이터라 관리자 승인이 있어야 호출할 수 있습니다"
                : "교내 — 신청하면 자동 승인"}
            </TierValue>
          </dd>
        </DetailRow>
        <DetailRow>
          <dt>구분</dt>
          <dd>{TYPE_LABELS[shown.type]}</dd>
        </DetailRow>
        <DetailRow>
          <dt>상태</dt>
          <dd>
            {isRestricted
              ? "서버 연동 준비 중"
              : "승인 완료 (교내 · 자동 승인)"}
          </dd>
        </DetailRow>
        <DetailRow>
          <dt>서비스명</dt>
          <dd>{shown.serviceName}</dd>
        </DetailRow>
        <DetailRow>
          <dt>{isRestricted ? "사용 목적" : "사용 내용"}</dt>
          <dd>{shown.purpose}</dd>
        </DetailRow>
        <DetailRow>
          <dt>신청일시</dt>
          <dd>{shown.appliedAt}</dd>
        </DetailRow>
        <DetailRow>
          <dt>신청한 분야</dt>
          <dd>
            {shown.fields.length > 0
              ? shown.fields
                  .map((item) => `${FIELD_LABELS[item.field]} (${item.appliedAt})`)
                  .join(" · ")
              : "—"}
          </dd>
        </DetailRow>
        {isRestricted && (
          <DetailRow>
            <dt>
              <label htmlFor="reject-reason">반려 사유</label>
            </dt>
            <dd>
              <ReasonTextarea
                id="reject-reason"
                aria-describedby="reject-reason-help"
                value={reason}
                placeholder="반려할 때 신청자에게 보여 줄 사유를 적어 주세요. (예: 사용 목적을 더 자세히 적어 주세요)"
                onChange={(event) => setReason(event.target.value)}
              />
              <ReasonHelp id="reject-reason-help">
                반려 사유를 입력해야 반려할 수 있습니다
              </ReasonHelp>
            </dd>
          </DetailRow>
        )}
      </DetailCard>

      <ActionBar>
        <BackLink href="/apply">목록으로</BackLink>
        {isRestricted && (
          <ActionGroup>
            {/* 승인 · 반려 API가 서버에 아직 없어서 쓸 수 없음 */}
            <RejectButton
              type="button"
              aria-describedby="review-pending-note"
              disabled
            >
              반려
            </RejectButton>
            <ApproveButton
              type="button"
              aria-describedby="review-pending-note"
              disabled
            >
              승인
            </ApproveButton>
          </ActionGroup>
        )}
      </ActionBar>
      {isRestricted && (
        <ReasonHelp id="review-pending-note">
          승인 · 반려는 서버 API가 준비되면 사용할 수 있습니다.
        </ReasonHelp>
      )}
    </DetailPage>
  );
}
