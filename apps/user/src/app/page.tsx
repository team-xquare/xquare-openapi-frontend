"use client";

import {
  CodeBlock,
  DocBadge,
  DocSection,
  DocSectionNote,
  DocTable,
  InfoList,
  NoticeCallout,
  StepCards,
} from "../components";
import {
  ACCESS_LEVELS,
  AUTH_INFO,
  ENDPOINT_COLUMNS,
  ENDPOINT_ROWS,
  ERROR_CODE_COLUMNS,
  ERROR_CODE_ROWS,
  GETTING_STARTED_STEPS,
  LOGIN_RESPONSE_LINES,
  META_INFO,
  OVERVIEW_BADGES,
  OVERVIEW_LEAD,
  OVERVIEW_NOTICE,
  OVERVIEW_TITLE,
  QUICK_START_CODES,
  RESPONSE_FORMAT_CODES,
} from "./overview-content";
import {
  OverviewBadgeList,
  OverviewContainer,
  OverviewHeader,
  OverviewLead,
  OverviewTitle,
} from "./page-style";

// 문서 Overview 페이지
export default function Home() {
  return (
    <OverviewContainer>
      <OverviewHeader>
        <OverviewBadgeList>
          {OVERVIEW_BADGES.map((badge) => (
            <DocBadge key={badge} label={badge} />
          ))}
        </OverviewBadgeList>
        <OverviewTitle>{OVERVIEW_TITLE}</OverviewTitle>
        <OverviewLead>{OVERVIEW_LEAD}</OverviewLead>
      </OverviewHeader>

      <DocSection
        id="quick-start"
        title="빠른 시작"
        description="로그인으로 액세스 토큰을 발급받은 뒤, Authorization 헤더에 실어 호출합니다."
      >
        {QUICK_START_CODES.map((code) => (
          <CodeBlock
            key={code.label}
            label={code.label}
            lines={code.lines}
            highlightLines={[0]}
          />
        ))}
      </DocSection>

      <DocSection
        id="auth"
        title="인증"
        description="모든 엔드포인트는 로그인으로 발급받은 JWT 액세스 토큰을 요구합니다."
      >
        <InfoList items={AUTH_INFO} />
        <CodeBlock label="로그인 응답" lines={LOGIN_RESPONSE_LINES} />
      </DocSection>

      <DocSection
        id="endpoints"
        title="엔드포인트"
        description="리소스는 7개 구분으로 나뉘며 대부분 조회, 등록, 수정, 삭제를 지원합니다. 아래는 명세서에 경로가 확정된 항목입니다."
      >
        <DocTable columns={ENDPOINT_COLUMNS} rows={ENDPOINT_ROWS} />
        <DocSectionNote>
          급식, 일정, 동아리, 교직원, 공지는 기능 명세는 있으나 경로가 아직
          확정되지 않았습니다.
        </DocSectionNote>
      </DocSection>

      <DocSection
        id="response-format"
        title="응답 형식"
        description="현재 명세서에는 두 가지 응답 형태가 섞여 있습니다. 통일 여부를 확정해야 합니다."
      >
        {RESPONSE_FORMAT_CODES.map((code) => (
          <CodeBlock key={code.label} label={code.label} lines={code.lines} />
        ))}
      </DocSection>

      <DocSection
        id="error-codes"
        title="오류 코드"
        description="오류는 HTTP 상태 코드와 함께 문자열 코드로 반환됩니다."
      >
        <DocTable columns={ERROR_CODE_COLUMNS} rows={ERROR_CODE_ROWS} />
      </DocSection>

      <DocSection
        id="access"
        title="접근 권한"
        description="엔드포인트마다 호출 가능한 대상이 정해져 있습니다. 명세서의 타겟 값을 따릅니다."
      >
        <InfoList items={ACCESS_LEVELS} />
      </DocSection>

      <DocSection id="getting-started" title="시작하기">
        <StepCards steps={GETTING_STARTED_STEPS} />
      </DocSection>

      <DocSection id="meta" title="메타 정보">
        <InfoList items={META_INFO} labelWidth={160} />
      </DocSection>

      <NoticeCallout
        title={OVERVIEW_NOTICE.title}
        description={OVERVIEW_NOTICE.description}
      />
    </OverviewContainer>
  );
}
