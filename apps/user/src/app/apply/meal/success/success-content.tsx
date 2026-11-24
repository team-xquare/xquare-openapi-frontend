"use client";

import { useSearchParams } from "next/navigation";
import {
  ApiKeyPanel,
  ApiKeyValue,
  DetailList,
  DetailRow,
  MealSuccessPage,
  SuccessActions,
  SuccessLead,
  SuccessTitle,
  PrimaryLink,
  SecondaryLink,
  HistoryButton,
  KeyNotice,
} from "./page-style";

export function MealApplySuccessContent() {
  const searchParams = useSearchParams();
  const project = searchParams.get("project")?.trim() || "team-xquare";

  return (
    <MealSuccessPage>
      <header>
        <SuccessTitle>활용신청이 접수되었습니다</SuccessTitle>
        <SuccessLead>급식 분야 · 공개 · 바로 사용 · 기존 키에 추가</SuccessLead>
      </header>

      <DetailList aria-label="급식 활용신청 결과">
        <DetailRow>
          <dt>신청 분야</dt>
          <dd>급식 (GET /meals, GET /meals/{"{mealId}"})</dd>
        </DetailRow>
        <DetailRow>
          <dt>프로젝트</dt>
          <dd>{project}</dd>
        </DetailRow>
        <DetailRow>
          <dt>사용 가능 분야</dt>
          <dd>동아리, 일정, 급식</dd>
        </DetailRow>
        <DetailRow>
          <dt>상태</dt>
          <dd><strong>승인 완료 — 바로 호출 가능</strong></dd>
        </DetailRow>
        <DetailRow>
          <dt>신청일시</dt>
          <dd>2026-11-24 10:20</dd>
        </DetailRow>
        <DetailRow>
          <dt>만료일</dt>
          <dd>2026-12-20 (키 만료일 그대로)</dd>
        </DetailRow>
      </DetailList>

      <ApiKeyPanel>
        <ApiKeyValue>xq_test_8f3a••••a0c9</ApiKeyValue>
      </ApiKeyPanel>
      <KeyNotice>
        새 키는 발급되지 않습니다. 이메일 인증이나 승인 없이 이 프로젝트의 키로 급식
        API를 바로 호출할 수 있습니다.
      </KeyNotice>

      <SuccessActions>
        <PrimaryLink href="/api-test">API 테스트 하러가기</PrimaryLink>
        <HistoryButton type="button" disabled title="신청 내역 페이지 준비 중">
          내 신청 내역
        </HistoryButton>
        <SecondaryLink href="/meal">문서로 돌아가기</SecondaryLink>
      </SuccessActions>
    </MealSuccessPage>
  );
}
