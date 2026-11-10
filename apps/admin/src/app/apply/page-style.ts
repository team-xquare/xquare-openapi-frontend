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
`;

export const FilterSelect = styled.select`
  ${CONTROL}
  cursor: pointer;
  padding: 0 38px 0 16px;
  width: 208px;
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
    padding: 0 20px;
    text-align: left;
  }

  th:nth-of-type(1) {
    width: 43%;
  }
  th:nth-of-type(2) {
    width: 12%;
  }
  th:nth-of-type(3) {
    width: 15%;
  }
  th:nth-of-type(4) {
    width: 15%;
  }
  th:nth-of-type(5) {
    width: 15%;
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

export const ApplicationDialog = styled.dialog`
  border: 0;
  border-radius: 16px;
  box-shadow: 0 12px 40px ${Xquare_colors.black}24;
  color: ${Xquare_colors.slate[900]};
  margin: auto;
  max-width: calc(100vw - 40px);
  padding: 32px;
  width: 520px;

  &::backdrop {
    background: ${Xquare_colors.black}80;
  }
`;

export const DialogTitle = styled.h2`
  font-size: 22px;
  margin: 0 0 24px;
`;

export const DetailList = styled.dl`
  display: grid;
  gap: 14px;
  margin: 0;
`;

export const DetailRow = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: 92px 1fr;
  font-size: 14px;

  dt {
    color: ${Xquare_colors.slate[600]};
  }
  dd {
    margin: 0;
    overflow-wrap: anywhere;
  }
`;

export const DialogClose = styled.button`
  background: ${Xquare_colors.white};
  border: ${STRONG_BORDER};
  border-radius: 8px;
  color: ${Xquare_colors.slate[900]};
  cursor: pointer;
  display: block;
  font: inherit;
  margin: 28px 0 0 auto;
  padding: 11px 20px;
`;
