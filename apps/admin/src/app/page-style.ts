import styled from "@emotion/styled";
import Link from "next/link";
import { Xquare_colors } from "../styles/colors";

const BORDER_DEFAULT = `1px solid ${Xquare_colors.slate[200]}`;

export const HomePage = styled.main`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 48px 58px 64px;
  word-break: keep-all;
`;

// 카드 사이는 20px, 머리말과 현황 사이만 32px
export const PageHead = styled.header`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
`;

export const PageTitle = styled.h1`
  color: ${Xquare_colors.slate[900]};
  font-size: 28px;
  font-weight: 700;
  line-height: normal;
  margin: 0;
`;

export const PageDescription = styled.p`
  color: ${Xquare_colors.slate[600]};
  font-size: 15px;
  line-height: normal;
  margin: 0;
`;

const CARD = `
  background: ${Xquare_colors.white};
  border: ${BORDER_DEFAULT};
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 24px;
`;

// 넓은 화면에서는 5개가 한 줄, 좁아지면 줄바꿈
export const StatList = styled.dl`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  margin: 0;
`;

export const StatCard = styled.div<{ isWarning?: boolean }>`
  ${CARD}
  gap: 8px;
  line-height: normal;

  dt {
    color: ${Xquare_colors.slate[600]};
    font-size: 13px;
    font-weight: 700;
  }

  dd {
    margin: 0;
  }

  dd:first-of-type {
    color: ${({ isWarning }) =>
      isWarning ? Xquare_colors.red[600] : Xquare_colors.slate[900]};
    font-size: 24px;
    font-weight: 700;
  }

  dd:last-of-type {
    color: ${Xquare_colors.slate[600]};
    font-size: 13px;
  }
`;

export const CardRow = styled.div`
  align-items: start;
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
`;

export const Card = styled.section`
  ${CARD}
  gap: 12px;
`;

export const TodayCard = styled(Card)`
  gap: 16px;
`;

export const CardHead = styled.div`
  align-items: center;
  display: flex;
  gap: 10px;
  line-height: normal;
  white-space: nowrap;
`;

export const CardTitle = styled.h2`
  color: ${Xquare_colors.slate[900]};
  font-size: 18px;
  font-weight: 700;
  margin: 0;
`;

export const CardMeta = styled.span`
  color: ${Xquare_colors.slate[600]};
  font-size: 13px;
`;

export const SmallLinkButton = styled(Link)`
  align-items: center;
  background: ${Xquare_colors.white};
  border: 1px solid ${Xquare_colors.slate[400]};
  border-radius: 8px;
  color: ${Xquare_colors.slate[900]};
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 14px;
  font-weight: 500;
  height: 36px;
  line-height: normal;
  padding: 0 14px;
  white-space: nowrap;

  &:focus-visible {
    outline: 2px solid ${Xquare_colors.purple[400]};
    outline-offset: 2px;
  }
`;

// 카드 제목 줄 오른쪽 끝에 붙는 이동 버튼
export const CardHeadLink = styled(SmallLinkButton)`
  margin-left: auto;
`;

export const TodayList = styled.dl`
  display: flex;
  flex-direction: column;
  font-size: 14px;
  gap: 16px;
  line-height: normal;
  margin: 0;

  div {
    display: flex;
    gap: 16px;
  }

  dt {
    color: ${Xquare_colors.slate[600]};
    flex: 0 0 90px;
    font-weight: 700;
  }

  dd {
    color: ${Xquare_colors.slate[900]};
    margin: 0;
    min-width: 0;
  }
`;

export const IssueList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 12px;
  list-style: none;
  margin: 0;
  padding: 0;
`;

export const IssueItem = styled.li`
  align-items: center;
  background: ${Xquare_colors.slate[50]};
  border-radius: 8px;
  display: flex;
  gap: 12px;
  padding: 12px 16px;
`;

export const IssueText = styled.div`
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: 4px;
  line-height: normal;
  min-width: 0;

  strong {
    color: ${Xquare_colors.slate[900]};
    font-size: 14px;
    font-weight: 700;
  }

  p {
    color: ${Xquare_colors.slate[600]};
    font-size: 13px;
    margin: 0;
  }
`;

export const RecentNoticeTable = styled.table`
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;

  th {
    border-bottom: ${BORDER_DEFAULT};
    color: ${Xquare_colors.slate[600]};
    font-size: 13px;
    font-weight: 700;
    height: 48px;
    padding: 0 16px;
    text-align: left;
  }

  th:nth-of-type(2) {
    width: 200px;
  }

  th:nth-of-type(3) {
    width: 220px;
  }

  td {
    border-bottom: ${BORDER_DEFAULT};
    color: ${Xquare_colors.slate[900]};
    font-size: 14px;
    height: 56px;
    overflow: hidden;
    padding: 0 16px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const EmptyCell = styled.td`
  color: ${Xquare_colors.slate[600]};
  text-align: center;
`;
