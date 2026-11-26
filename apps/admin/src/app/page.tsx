"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { errorMessage, isAbortError } from "@/lib/api-error";
import { useToday } from "@/lib/use-today";
import {
  HOME_STAT_LABELS,
  HOME_TODAY_LABELS,
  formatToday,
  loadHomeData,
  type HomeData,
  type HomeStat,
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
  RetryButton,
  SmallLinkButton,
  StatCard,
  StatList,
  TodayCard,
  TodayList,
} from "./page-style";

const LOADING_TEXT = "불러오는 중입니다.";

export default function AdminHome() {
  const router = useRouter();
  // 오늘은 브라우저에서만 알 수 있어서 미리 그릴 때는 불러오지 않음
  const today = useToday();
  // 불러온 날과 함께 둬서, 날짜가 바뀐 뒤 어제 데이터를 오늘 것처럼 보이지 않게 함
  const [loaded, setLoaded] = useState<{ date: string; data: HomeData } | null>(
    null,
  );
  const [loadError, setLoadError] = useState("");
  // 바뀌면 다시 불러옴 (다시 시도)
  const [reloadKey, setReloadKey] = useState(0);

  // 다른 화면에서 돌아와 다시 보일 때도 effect가 다시 돌아 최신 현황을 받음
  useEffect(() => {
    if (!today) return;
    // 로그인 여부는 저장소를 읽어야 해서 렌더 중이 아니라 effect에서 확인
    if (!api.auth.isLoggedIn()) {
      router.replace("/login");
      return;
    }
    const request = new AbortController();
    loadHomeData(today, request.signal)
      .then((data) => {
        setLoaded({ date: today, data });
        setLoadError("");
      })
      .catch((error: unknown) => {
        if (isAbortError(error) || request.signal.aborted) return;
        setLoadError(errorMessage(error, "홈 현황을 불러오지 못했습니다."));
      });
    return () => request.abort();
  }, [today, router, reloadKey]);

  const data = loaded && loaded.date === today ? loaded.data : null;
  // 불러오는 동안에도 현황 카드 자리는 그대로 둠
  const stats: HomeStat[] =
    data?.stats ??
    HOME_STAT_LABELS.map((label) => ({
      label,
      value: "—",
      caption: LOADING_TEXT,
    }));
  const reload = () => {
    setLoadError("");
    setReloadKey((key) => key + 1);
  };

  return (
    <HomePage>
      <PageHead>
        <PageTitle>홈</PageTitle>
        <PageDescription>
          학교 데이터 현황과 오늘 확인할 내용을 모아 봅니다.
        </PageDescription>
      </PageHead>

      {loadError && (
        <IssueItem as="div" role="alert">
          <IssueText>
            <strong>{loadError}</strong>
          </IssueText>
          <RetryButton type="button" onClick={reload}>
            다시 시도
          </RetryButton>
        </IssueItem>
      )}

      <StatList aria-label="데이터 현황" aria-busy={!data || undefined}>
        {stats.map((stat) => (
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
            {today && <CardMeta>{formatToday(today)}</CardMeta>}
            <CardHeadLink href="/schedule">일정 관리로 이동</CardHeadLink>
          </CardHead>
          <TodayList>
            {(data?.today ??
              HOME_TODAY_LABELS.map((label) => ({ label, value: LOADING_TEXT }))
            ).map((item) => (
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
            {data && <CardMeta>{data.issues.length}건</CardMeta>}
          </CardHead>
          <IssueList>
            {data?.issues.map((issue) => (
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
            {/* 불러오지 못한 항목은 빠진 채로 '없음'처럼 보이지 않게 따로 알림 */}
            {data && data.issueErrors.length > 0 && (
              <IssueItem role="alert">
                <IssueText>
                  <strong>일부 항목을 확인하지 못했습니다.</strong>
                  {data.issueErrors.map((error) => (
                    <p key={error}>{error}</p>
                  ))}
                </IssueText>
                <RetryButton type="button" onClick={reload}>
                  다시 시도
                </RetryButton>
              </IssueItem>
            )}
            {!data && (
              <IssueItem>
                <IssueText>
                  <p>확인할 항목을 {LOADING_TEXT}</p>
                </IssueText>
              </IssueItem>
            )}
            {data &&
              data.issues.length === 0 &&
              data.issueErrors.length === 0 && (
                <IssueItem>
                  <IssueText>
                    <p>지금 확인이 필요한 항목이 없습니다.</p>
                  </IssueText>
                </IssueItem>
              )}
          </IssueList>
        </Card>
      </CardRow>

      <Card aria-labelledby="home-notices">
        <CardHead>
          <CardTitle id="home-notices">최근 공지</CardTitle>
          {data && "list" in data.notices && (
            <CardMeta>최신순 {data.notices.list.length}건</CardMeta>
          )}
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
            {data &&
              "list" in data.notices &&
              data.notices.list.map((notice) => (
                <tr key={notice.id}>
                  <td title={notice.title}>{notice.title}</td>
                  <td>{notice.author}</td>
                  <td>{notice.createdAt}</td>
                </tr>
              ))}
            {(!data ||
              "error" in data.notices ||
              data.notices.list.length === 0) && (
              <tr>
                <EmptyCell
                  colSpan={3}
                  role={data && "error" in data.notices ? "alert" : undefined}
                >
                  {!data
                    ? `공지를 ${LOADING_TEXT}`
                    : "error" in data.notices
                      ? data.notices.error
                      : "등록된 공지가 없습니다."}
                </EmptyCell>
              </tr>
            )}
          </tbody>
        </RecentNoticeTable>
      </Card>
    </HomePage>
  );
}
