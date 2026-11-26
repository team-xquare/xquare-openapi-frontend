"use client";

import { useSyncExternalStore } from "react";
import { getUsageLog } from "../usage-log-content";
import { Status } from "../page-style";
import {
  ActionBar,
  BackLink,
  DetailCard,
  DetailPage,
  DetailRow,
  EmptyValue,
  Note,
  PageDescription,
  PageHead,
  PageTitle,
} from "./page-style";

// 서버가 아직 주지 않는 값
const NOT_PROVIDED = <EmptyValue>—</EmptyValue>;

const subscribe = () => () => {};

export function UsageLogDetailContent({ id }: { id: string }) {
  // sessionStorage는 브라우저에서만 읽을 수 있어, 서버 렌더에서는 비어 있는 것으로 둠
  const raw = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(getUsageLog(id)),
    () => "null",
  );
  const log = JSON.parse(raw) as ReturnType<typeof getUsageLog>;

  if (!log) {
    return (
      <DetailPage>
        <PageHead>
          <PageTitle>사용 기록 상세</PageTitle>
          <PageDescription role="status">
            목록에서 사용 기록을 다시 열어 주세요.
          </PageDescription>
        </PageHead>
        <ActionBar>
          <BackLink href="/usage-log">목록으로</BackLink>
        </ActionBar>
      </DetailPage>
    );
  }

  return (
    <DetailPage>
      <PageHead>
        <PageTitle>사용 기록 상세</PageTitle>
        <PageDescription>
          {log.method} {log.route} · {log.calledAt}
        </PageDescription>
      </PageHead>

      <DetailCard aria-label="사용 기록 상세 정보">
        <DetailRow>
          <dt>시각</dt>
          <dd>{log.calledAt}</dd>
        </DetailRow>
        <DetailRow>
          <dt>요청</dt>
          <dd>{NOT_PROVIDED}</dd>
        </DetailRow>
        <DetailRow>
          <dt>API</dt>
          <dd>
            {log.method} {log.route}
          </dd>
        </DetailRow>
        <DetailRow>
          <dt>분야 · 단계</dt>
          <dd>{NOT_PROVIDED}</dd>
        </DetailRow>
        <DetailRow>
          <dt>응답 코드</dt>
          <dd>
            <Status ok={log.status < 400}>{log.status}</Status>
          </dd>
        </DetailRow>
        <DetailRow>
          <dt>오류 메시지</dt>
          <dd>{NOT_PROVIDED}</dd>
        </DetailRow>
        <DetailRow>
          <dt>응답 시간</dt>
          <dd>{log.durationMs}ms</dd>
        </DetailRow>
        <DetailRow>
          <dt>프로젝트</dt>
          <dd>{NOT_PROVIDED}</dd>
        </DetailRow>
        <DetailRow>
          <dt>API 키</dt>
          <dd>{NOT_PROVIDED}</dd>
        </DetailRow>
        <DetailRow>
          <dt>신청자</dt>
          <dd>{NOT_PROVIDED}</dd>
        </DetailRow>
      </DetailCard>
      <Note>실제 요청 경로 · 분야 · 오류 · 프로젝트 · 키 · 신청자는 서버에서 제공하면 표시됩니다.</Note>

      <ActionBar>
        <BackLink href="/usage-log">목록으로</BackLink>
      </ActionBar>
    </DetailPage>
  );
}
