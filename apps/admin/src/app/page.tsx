"use client";

import {
  BASE_DATE,
  BASE_WEEKDAY,
  HOME_ISSUES,
  HOME_STATS,
  RECENT_NOTICES,
  TODAY_ITEMS,
} from "./home-content";
import {
  Card,
  CardHead,
  CardHeadLink,
  CardMeta,
  CardRow,
  CardTitle,
  EmptyCell,
  HomePage,
  IssueItem,
  IssueList,
  IssueText,
  PageDescription,
  PageHead,
  PageTitle,
  RecentNoticeTable,
  SmallLinkButton,
  StatCard,
  StatList,
  TodayCard,
  TodayList,
} from "./page-style";

export default function AdminHome() {
  return (
    <HomePage>
      <PageHead>
        <PageTitle>홈</PageTitle>
        <PageDescription>
          학교 데이터 현황과 오늘 확인할 내용을 모아 봅니다.{" "}
          {`기준일 ${BASE_DATE} (${BASE_WEEKDAY})`}
        </PageDescription>
      </PageHead>

      <StatList aria-label="데이터 현황">
        {HOME_STATS.map((stat) => (
          <StatCard key={stat.label} isWarning={stat.isWarning}>
            <dt>{stat.label}</dt>
            <dd>{stat.value}</dd>
            <dd>{stat.caption}</dd>
          </StatCard>
        ))}
      </StatList>

      <CardRow>
        <TodayCard aria-labelledby="home-today">
          <CardHead>
            <CardTitle id="home-today">오늘</CardTitle>
            <CardMeta>
              {BASE_DATE} {BASE_WEEKDAY}요일
            </CardMeta>
            <CardHeadLink href="/schedule">일정 관리로 이동</CardHeadLink>
          </CardHead>
          <TodayList>
            {TODAY_ITEMS.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </TodayList>
        </TodayCard>

        <Card aria-labelledby="home-issues">
          <CardHead>
            <CardTitle id="home-issues">확인이 필요한 항목</CardTitle>
            <CardMeta>{HOME_ISSUES.length}건</CardMeta>
          </CardHead>
          <IssueList>
            {HOME_ISSUES.map((issue) => (
              <IssueItem key={issue.title}>
                <IssueText>
                  <strong>{issue.title}</strong>
                  <p>{issue.description}</p>
                </IssueText>
                <SmallLinkButton
                  href={issue.href}
                  aria-label={`${issue.title} ${issue.actionLabel}`}
                >
                  {issue.actionLabel}
                </SmallLinkButton>
              </IssueItem>
            ))}
          </IssueList>
        </Card>
      </CardRow>

      <Card aria-labelledby="home-notices">
        <CardHead>
          <CardTitle id="home-notices">최근 공지</CardTitle>
          <CardMeta>최신순 {RECENT_NOTICES.length}건</CardMeta>
          <CardHeadLink href="/notice">공지 관리로 이동</CardHeadLink>
        </CardHead>
        <RecentNoticeTable aria-labelledby="home-notices">
          <thead>
            <tr>
              <th scope="col">제목</th>
              <th scope="col">작성자</th>
              <th scope="col">작성일시</th>
            </tr>
          </thead>
          <tbody>
            {RECENT_NOTICES.map((notice) => (
              <tr key={notice.id}>
                <td title={notice.title}>{notice.title}</td>
                <td>{notice.author}</td>
                <td>{notice.createdAt}</td>
              </tr>
            ))}
            {RECENT_NOTICES.length === 0 && (
              <tr>
                <EmptyCell colSpan={3}>등록된 공지가 없습니다.</EmptyCell>
              </tr>
            )}
          </tbody>
        </RecentNoticeTable>
      </Card>
    </HomePage>
  );
}
