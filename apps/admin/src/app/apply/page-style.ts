import styled from "@emotion/styled";
import Link from "next/link";
import { Xquare_colors } from "../../styles/colors";

const BORDER = `1px solid ${Xquare_colors.slate[200]}`;
const STRONG_BORDER = `1px solid ${Xquare_colors.slate[400]}`;

const CONTROL = `
  background: ${Xquare_colors.white};
  border: ${STRONG_BORDER};
  border-radius: 8px;
  color: ${Xquare_colors.slate[900]};
  font: inherit;
  font-size: 15px;
  height: 48px;
  outline: none;

  &:focus-visible {
    border-color: ${Xquare_colors.purple[400]};
    box-shadow: 0 0 0 2px ${Xquare_colors.purple[100]};
  }
`;

export const ApplyPage = styled.main`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 48px 58px 64px;
  word-break: keep-all;
`;

export const PageHead = styled.header`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 32px;
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

export const FilterBar = styled.form`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
`;

export const SearchInput = styled.input`
  ${CONTROL}
  padding: 0 16px;
  width: min(100%, 420px);

  &::placeholder {
    color: ${Xquare_colors.slate[400]};
  }

  &:disabled {
    background: ${Xquare_colors.slate[50]};
    cursor: not-allowed;
  }
`;

export const FilterSelect = styled.select`
  ${CONTROL}
  cursor: pointer;
  padding: 0 38px 0 16px;
  /* "첫 신청 (키 발급)"처럼 긴 옵션도 잘리지 않는 폭 */
  width: 184px;

  &:disabled {
    background: ${Xquare_colors.slate[50]};
    cursor: not-allowed;
  }
`;

export const SearchButton = styled.button`
  ${CONTROL}
  cursor: pointer;
  padding: 0 20px;

  &:disabled {
    background: ${Xquare_colors.slate[50]};
    cursor: not-allowed;
  }

  &:hover,
  &:focus-visible {
    border-color: ${Xquare_colors.purple[400]};
    color: ${Xquare_colors.purple[400]};
  }
`;

export const RetryButton = styled.button`
  ${CONTROL}
  cursor: pointer;
  height: 40px;
  padding: 0 16px;

  &:hover,
  &:focus-visible {
    border-color: ${Xquare_colors.purple[400]};
    color: ${Xquare_colors.purple[400]};
  }
`;

export const CellStatus = styled.div`
  align-items: center;
  display: inline-flex;
  gap: 12px;
`;

// 서버에 아직 없는 값(신청자 · 구분)의 빈 칸 표시
export const PendingValue = styled.span`
  color: ${Xquare_colors.slate[400]};
`;

// 서버 연동 전이라 쓸 수 없는 필터 · 검색 안내
export const FilterNote = styled.p`
  color: ${Xquare_colors.slate[600]};
  font-size: 13px;
  margin: -8px 0 20px;
`;

export const ApplicationTable = styled.table`
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;

  th {
    background: ${Xquare_colors.slate[50]};
    border-bottom: ${BORDER};
    color: ${Xquare_colors.slate[600]};
    font-size: 14px;
    font-weight: 700;
    height: 56px;
    padding: 0 12px;
    text-align: left;
  }

  th:nth-of-type(1) {
    width: 24%;
  }
  th:nth-of-type(2) {
    width: 7%;
  }
  th:nth-of-type(3) {
    width: 12%;
  }
  th:nth-of-type(4) {
    width: 10%;
  }
  th:nth-of-type(5) {
    width: 19%;
  }
  th:nth-of-type(6) {
    width: 18%;
  }
  th:nth-of-type(7) {
    width: 10%;
  }

  td {
    border-bottom: ${BORDER};
    color: ${Xquare_colors.slate[900]};
    font-size: 15px;
    height: 66px;
    overflow: hidden;
    padding: 0 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

// 단계: 제한은 주황, 교내는 회색
export const TierText = styled.span<{ $tier: "제한" | "교내" }>`
  color: ${({ $tier }) =>
    $tier === "제한"
      ? Xquare_colors.orange[600]
      : Xquare_colors.slate[600]};
`;

// 상태: 승인 대기는 주황, 승인은 초록, 반려는 빨강
export const StatusText = styled.span<{
  $status: "PENDING" | "APPROVED" | "REJECTED";
}>`
  color: ${({ $status }) =>
    $status === "PENDING"
      ? Xquare_colors.orange[600]
      : $status === "APPROVED"
        ? Xquare_colors.green[700]
        : Xquare_colors.red[600]};
  font-weight: 700;
`;

export const DetailLink = styled(Link)`
  color: ${Xquare_colors.purple[400]};
  display: inline-block;
  font-size: 15px;
  padding: 8px 0;

  &:focus-visible {
    outline: 2px solid ${Xquare_colors.purple[400]};
    outline-offset: 3px;
  }
`;

export const EmptyCell = styled.td`
  color: ${Xquare_colors.slate[600]};
  height: 120px !important;
  text-align: center;
`;

export const Pager = styled.div`
  align-items: center;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  padding-top: 24px;
`;

export const Total = styled.p`
  color: ${Xquare_colors.slate[600]};
  font-size: 14px;
  margin: 0;
`;

export const PageList = styled.nav`
  align-items: center;
  display: flex;
  gap: 8px;
`;

export const PageButton = styled.button`
  appearance: none;
  background: transparent;
  border: 0;
  border-radius: 8px;
  color: ${Xquare_colors.slate[600]};
  cursor: pointer;
  font-size: 14px;
  height: 40px;
  min-width: 40px;
  padding: 0 12px;

  &[aria-current="page"] {
    background: ${Xquare_colors.purple[100]};
    color: ${Xquare_colors.purple[400]};
    font-weight: 700;
  }

  &:disabled {
    border: ${STRONG_BORDER};
    color: ${Xquare_colors.slate[900]};
    cursor: not-allowed;
  }
`;

