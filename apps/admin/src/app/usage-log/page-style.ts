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
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
`;

export const SearchInput = styled.input`
  ${CONTROL}
  flex: 1 1 240px;
  min-width: 240px;
  padding: 0 16px;

  &::placeholder {
    color: ${Xquare_colors.slate[400]};
  }
`;

export const FilterSelect = styled.select`
  ${CONTROL}
  cursor: pointer;
  flex: none;
  padding: 0 38px 0 16px;
  /* "응답 코드 전체" 같은 가장 긴 옵션이 잘리지 않는 폭 */
  width: 176px;
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
    padding: 0 12px;
    text-align: left;
  }

  /* 본문 884px(1280px 화면)에서 시각·응답·분야·신청자·상세가 잘리지 않게 나눈 비율.
     호출한 API와 프로젝트 · 키 열만 길면 말줄임으로 줄입니다. */
  th:nth-of-type(1) {
    width: 17%;
  }
  th:nth-of-type(2) {
    width: 11%;
  }
  th:nth-of-type(3) {
    width: 18%;
  }
  th:nth-of-type(4) {
    width: 9%;
  }
  th:nth-of-type(5) {
    width: 20%;
  }
  th:nth-of-type(6) {
    width: 18%;
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
    padding: 0 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

// 오류 코드가 이 화면에서 가장 중요한 정보라 말줄임 대신 줄을 바꿔 전부 보여줌
// ("500 INTERNAL_SERVER_ERROR"처럼 긴 코드는 좁은 폭에서 열보다 김)
export const Status = styled.span<{ ok: boolean }>`
  color: ${({ ok }) => (ok ? OK_COLOR : Xquare_colors.red[600])};
  display: block;
  font-weight: 700;
  line-height: 1.35;
  overflow-wrap: anywhere;
  white-space: normal;
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

  &:disabled {
    color: ${Xquare_colors.slate[400]};
    cursor: not-allowed;
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
