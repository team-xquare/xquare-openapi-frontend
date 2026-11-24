"use client";

import { useState } from "react";
import type { Application } from "../apply-content";
import {
  ActionBar,
  ActionGroup,
  ApproveButton,
  BackLink,
  DetailCard,
  DetailPage,
  DetailRow,
  PageDescription,
  PageHead,
  PageTitle,
  ReasonTextarea,
  RejectButton,
  StatusValue,
  TierValue,
} from "./page-style";

export function ApplicationDetailContent({
  application,
}: {
  application: Application;
}) {
  const [reason, setReason] = useState("");
  const isRestricted = application.tier === "제한";
  const isPending = application.status === "승인 대기";

  return (
    <DetailPage>
      <PageHead>
        <PageTitle>활용신청 상세</PageTitle>
        <PageDescription>
          {application.project} · {application.field}
        </PageDescription>
      </PageHead>

      <DetailCard aria-label="활용신청 상세 정보">
        <DetailRow>
          <dt>신청자</dt>
          <dd>
            {application.applicant} · {application.username}
          </dd>
        </DetailRow>
        <DetailRow>
          <dt>분야</dt>
          <dd>{application.field}</dd>
        </DetailRow>
        <DetailRow>
          <dt>접근 단계</dt>
          <dd>
            <TierValue $tier={application.tier}>
              {isRestricted
                ? "제한 — 개인정보가 들어간 데이터라 관리자 승인이 있어야 호출할 수 있습니다"
                : "교내 — 신청하면 자동 승인"}
            </TierValue>
          </dd>
        </DetailRow>
        <DetailRow>
          <dt>구분</dt>
          <dd>{application.kind}</dd>
        </DetailRow>
        <DetailRow>
          <dt>상태</dt>
          <dd>
            <StatusValue $status={application.status}>
              {application.status === "승인 완료" && !isRestricted
                ? "승인 완료 (교내 · 자동 승인)"
                : application.status}
            </StatusValue>
          </dd>
        </DetailRow>
        <DetailRow>
          <dt>프로젝트</dt>
          <dd>{application.project}</dd>
        </DetailRow>
        <DetailRow>
          <dt>서비스 URL</dt>
          <dd>
            {application.url.replace("https://", "").replace("http://", "")}
          </dd>
        </DetailRow>
        <DetailRow>
          <dt>{isRestricted ? "사용 목적" : "사용 내용"}</dt>
          <dd>{application.purpose}</dd>
        </DetailRow>
        <DetailRow>
          <dt>신청일시</dt>
          <dd>{application.appliedAt}</dd>
        </DetailRow>
        <DetailRow>
          <dt>키 만료일</dt>
          <dd>2026-12-20 (발급일부터 60일)</dd>
        </DetailRow>
        <DetailRow>
          <dt>API 키</dt>
          <dd>xq_test_8f3a••••a0c9</dd>
        </DetailRow>
        <DetailRow>
          <dt>이 프로젝트의 분야</dt>
          <dd>{application.projectFields}</dd>
        </DetailRow>
        {isRestricted && isPending && (
          <DetailRow>
            <dt>
              <label htmlFor="reject-reason">반려 사유</label>
            </dt>
            <dd>
              <ReasonTextarea
                id="reject-reason"
                value={reason}
                placeholder="반려할 때 신청자에게 보여 줄 사유를 적어 주세요. (예: 사용 목적을 더 자세히 적어 주세요)"
                onChange={(event) => setReason(event.target.value)}
              />
            </dd>
          </DetailRow>
        )}
      </DetailCard>

      <ActionBar>
        <BackLink href="/apply">목록으로</BackLink>
        {isRestricted && isPending && (
          <ActionGroup>
            {/* 승인 · 반려 API 연동은 OPN-94에서 하고, 지금은 화면만 둔다 */}
            <RejectButton type="button" disabled={reason.trim() === ""}>
              반려
            </RejectButton>
            <ApproveButton type="button">승인</ApproveButton>
          </ActionGroup>
        )}
      </ActionBar>
    </DetailPage>
  );
}
