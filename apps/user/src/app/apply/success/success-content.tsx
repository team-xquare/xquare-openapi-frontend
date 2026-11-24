"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  SuccessPage,
  SuccessTitle,
  SuccessLead,
  ApplicationDetails,
  DetailRow,
  KeyPanel,
  ApiKey,
  CopyButton,
  KeyNotice,
  SuccessActions,
  PrimaryLink,
  SecondaryLink,
  HistoryButton,
} from "./page-style";

// API 연동 전 퍼블리싱용 신청 결과
const SAMPLE_APPLICATION = {
  apiKey: "xq_live_8f3a91c2d7e04b65a0c9",
  appliedAt: "2026-10-01 14:32",
};

export function ApplySuccessContent() {
  const searchParams = useSearchParams();
  const serviceName = searchParams.get("serviceName")?.trim() || "team-xquare";
  const category = searchParams.get("category");
  const isFirstApproval = searchParams.get("firstApproval") === "true";
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(SAMPLE_APPLICATION.apiKey);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  };

  if (category === "club" || category === "schedule") {
    const isClub = category === "club";
    const apiLabel = isClub
      ? "동아리 (GET /clubs, GET /clubs/{clubId})"
      : "일정 (학교 통합 일정 조회)";
    const availableAreas = isClub ? "동아리" : "동아리, 일정";
    const lead = isClub
      ? `동아리 분야 · 중간 · 자동 승인 · ${isFirstApproval ? "프로젝트 첫 승인 · API 키 발급" : "기존 키에 추가"}`
      : "일정 분야 · 중간 · 자동 승인 · 기존 키에 추가";

    return (
      <SuccessPage>
        <header>
          <SuccessTitle>활용신청이 접수되었습니다</SuccessTitle>
          <SuccessLead>{lead}</SuccessLead>
        </header>

        <ApplicationDetails aria-label="활용신청 결과">
          <DetailRow>
            <dt>신청 분야</dt>
            <dd>{apiLabel}</dd>
          </DetailRow>
          <DetailRow>
            <dt>프로젝트</dt>
            <dd>{serviceName}</dd>
          </DetailRow>
          <DetailRow>
            <dt>사용 가능 분야</dt>
            <dd>{availableAreas}</dd>
          </DetailRow>
          <DetailRow>
            <dt>상태</dt>
            <dd>
              <strong>승인 완료 — 바로 호출 가능</strong>
            </dd>
          </DetailRow>
          <DetailRow>
            <dt>신청일시</dt>
            <dd>2026-10-21 14:32</dd>
          </DetailRow>
          <DetailRow>
            <dt>만료일</dt>
            <dd>
              2026-12-20 (
              {isFirstApproval ? "발급일부터 60일" : "키 만료일 그대로"})
            </dd>
          </DetailRow>
        </ApplicationDetails>

        <section aria-label="발급된 API 키">
          <KeyPanel>
            <ApiKey>
              {isFirstApproval
                ? SAMPLE_APPLICATION.apiKey
                : "xq_test_8f3a••••a0c9"}
            </ApiKey>
            {isFirstApproval && (
              <CopyButton type="button" onClick={copyKey}>
                {copyStatus === "copied" ? "복사 완료" : "키 복사"}
              </CopyButton>
            )}
          </KeyPanel>
          <KeyNotice>
            {isFirstApproval
              ? "이 키는 지금만 전체가 표시됩니다. 복사해 안전한 곳에 보관하고, 서버에서만 쓰세요(프론트엔드 코드에 넣지 마세요). 이 프로젝트에서 다른 분야를 신청해도 이 키로 호출합니다."
              : `새 키는 발급되지 않습니다. 이 프로젝트의 키로 ${isClub ? "동아리" : "일정"} API를 바로 호출할 수 있습니다. 키를 잃어버렸다면 마이페이지에서 재발급하세요.`}
          </KeyNotice>
        </section>

        <SuccessActions>
          <PrimaryLink href="/api-test">API 테스트 하러가기</PrimaryLink>
          <HistoryButton
            type="button"
            disabled
            title="신청 내역 페이지 준비 중"
          >
            내 신청 내역
          </HistoryButton>
          <SecondaryLink href={isClub ? "/club" : "/schedule"}>
            문서로 돌아가기
          </SecondaryLink>
        </SuccessActions>
      </SuccessPage>
    );
  }

  return (
    <SuccessPage>
      <header>
        <SuccessTitle>활용신청이 접수되었습니다</SuccessTitle>
        <SuccessLead>학생 정보 조회 API · 개발계정 · 자동승인 완료</SuccessLead>
      </header>

      <ApplicationDetails aria-label="활용신청 결과">
        <DetailRow>
          <dt>신청 API</dt>
          <dd>학생 정보 조회 (GET /students)</dd>
        </DetailRow>
        <DetailRow>
          <dt>서비스명</dt>
          <dd>{serviceName}</dd>
        </DetailRow>
        <DetailRow>
          <dt>계정 유형</dt>
          <dd>개발계정 · 일 10,000회</dd>
        </DetailRow>
        <DetailRow>
          <dt>상태</dt>
          <dd>
            <strong>승인 완료 — 바로 호출 가능</strong>
          </dd>
        </DetailRow>
        <DetailRow>
          <dt>신청일시</dt>
          <dd>{SAMPLE_APPLICATION.appliedAt}</dd>
        </DetailRow>
      </ApplicationDetails>

      <section aria-label="발급된 API 키">
        <KeyPanel>
          <ApiKey>{SAMPLE_APPLICATION.apiKey}</ApiKey>
          <CopyButton type="button" onClick={copyKey}>
            {copyStatus === "copied" ? "복사 완료" : "키 복사"}
          </CopyButton>
        </KeyPanel>
        <KeyNotice>
          이 키는 지금만 전체가 표시됩니다. 복사 후 안전한 곳에 보관해 주세요.
          분실 시 재발급이 필요합니다.
        </KeyNotice>
        <KeyNotice role="status">
          {copyStatus === "error"
            ? "키를 복사하지 못했습니다. 키를 직접 선택해 복사해 주세요."
            : copyStatus === "copied"
              ? "API 키를 복사했습니다."
              : ""}
        </KeyNotice>
      </section>

      <SuccessActions>
        <PrimaryLink href="/api-test">API 테스트 하러가기</PrimaryLink>
        <HistoryButton type="button" disabled title="신청 내역 페이지 준비 중">
          내 신청 내역
        </HistoryButton>
        <SecondaryLink href="/student">문서로 돌아가기</SecondaryLink>
      </SuccessActions>
    </SuccessPage>
  );
}
