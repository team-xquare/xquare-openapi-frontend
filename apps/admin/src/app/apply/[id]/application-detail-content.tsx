"use client";

import type { Application } from "../apply-content";
import {
  BackLink,
  DetailCard,
  DetailPage,
  DetailRow,
  PageDescription,
  PageHead,
  PageTitle,
} from "./page-style";

export function ApplicationDetailContent({
  application,
}: {
  application: Application;
}) {
  const apiName = application.api.split(" · ")[1] ?? application.api;
  const quota =
    application.accountType === "운영계정" ? "일 100,000회" : "일 10,000회";

  return (
    <DetailPage>
      <PageHead>
        <PageTitle>활용신청 상세</PageTitle>
        <PageDescription>
          {application.serviceName} · {apiName}
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
          <dt>API</dt>
          <dd>{apiName}</dd>
        </DetailRow>
        <DetailRow>
          <dt>계정 유형</dt>
          <dd>
            {application.accountType} · {quota}
          </dd>
        </DetailRow>
        <DetailRow>
          <dt>상태</dt>
          <dd>승인 완료 (자동승인)</dd>
        </DetailRow>
        <DetailRow>
          <dt>서비스명</dt>
          <dd>{application.serviceName}</dd>
        </DetailRow>
        <DetailRow>
          <dt>서비스 URL</dt>
          <dd>
            {application.url.replace("https://", "").replace("http://", "")}
          </dd>
        </DetailRow>
        <DetailRow>
          <dt>활용 목적</dt>
          <dd>{application.purpose}</dd>
        </DetailRow>
        <DetailRow>
          <dt>신청일시</dt>
          <dd>{application.appliedAt}</dd>
        </DetailRow>
        <DetailRow>
          <dt>만료일</dt>
          <dd>2027-10-01</dd>
        </DetailRow>
        <DetailRow>
          <dt>API 키</dt>
          <dd>xq_test_8f3a••••a0c9</dd>
        </DetailRow>
      </DetailCard>

      <BackLink href="/apply">목록으로</BackLink>
    </DetailPage>
  );
}
