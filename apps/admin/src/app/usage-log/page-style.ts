import styled from "@emotion/styled";
import { Xquare_colors } from "../../styles/colors";

// 활용신청 목록(apply/page-style.ts)과 같은 모양을 쓰되, 그쪽 파일이 따로 바뀌는 중이라 여기에 복사해 둡니다.
const BORDER = `1px solid ${Xquare_colors.slate[200]}`;
const STRONG_BORDER = `1px solid ${Xquare_colors.slate[400]}`;
// admin 팔레트에 초록이 없어 성공 응답 색은 이 화면에서만 씁니다.
// 흰 배경 글자 대비 4.5:1 이상(WCAG AA)이 되도록 고른 값 (5.0:1)
const OK_COLOR = "#0C8048";

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

export const UsagePage = styled.main`
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
  gap: 12px;
  margin-bottom: 20px;
`;

export const SearchInput = styled.input`
  ${CONTROL}
  flex: 1;
  min-width: 0;
  padding: 0 16px;

  &::placeholder {
    color: ${Xquare_colors.slate[400]};
  }
`;

export const FilterSelect = styled.select`
  ${CONTROL}
  cursor: pointer;
  padding: 0 38px 0 16px;
  width: 140px;
`;

export const SearchButton = styled.button`
  ${CONTROL}
  cursor: pointer;
  padding: 0 20px;

  &:hover,
  &:focus-visible {
    border-color: ${Xquare_colors.purple[400]};
    color: ${Xquare_colors.purple[400]};
  }
`;

export const UsageTable = styled.table`
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
    padding: 0 20px;
    text-align: left;
  }

  /* 시안 열 너비 250/100/190/110/200/400/82 비율 */
  th:nth-of-type(1) {
    width: 20%;
  }
  th:nth-of-type(2) {
    width: 8%;
  }
  th:nth-of-type(3) {
    width: 15%;
  }
  th:nth-of-type(4) {
    width: 9%;
  }
  th:nth-of-type(5) {
    width: 16%;
  }
  th:nth-of-type(6) {
    width: 25%;
  }
  th:nth-of-type(7) {
    width: 7%;
  }

  td {
    border-bottom: ${BORDER};
    color: ${Xquare_colors.slate[900]};
    font-size: 15px;
    height: 66px;
    overflow: hidden;
    padding: 0 20px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const Status = styled.span<{ ok: boolean }>`
  color: ${({ ok }) => (ok ? OK_COLOR : Xquare_colors.red[600])};
  font-weight: 700;
`;

export const DetailButton = styled.button`
  appearance: none;
  background: transparent;
  border: 0;
  color: ${Xquare_colors.purple[400]};
  cursor: pointer;
  font: inherit;
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
