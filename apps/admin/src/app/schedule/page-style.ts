import styled from "@emotion/styled";
import Link from "next/link";
import { Xquare_colors } from "../../styles/colors";
import { TitleInput } from "../notice/page-style";

// 머리말, 버튼, 입력칸, 행 동작, 삭제 모달은 공지 화면 스타일(../notice/page-style)을 같이 씀

const BORDER_STRONG = `1px solid ${Xquare_colors.slate[400]}`;
const BORDER_DEFAULT = `1px solid ${Xquare_colors.slate[200]}`;

const FOCUS_RING = `
  &:focus-visible {
    outline: 2px solid ${Xquare_colors.purple[400]};
    outline-offset: 2px;
  }
`;

export const FilterBar = styled.form`
  align-items: center;
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`;

// 기본 화살표 대신 Figma의 ▾ 글자를 오른쪽에 그림
// width는 span의 HTML 속성으로 새지 않도록 스타일에만 씀
export const SelectBox = styled("span", {
  shouldForwardProp: (prop) => prop !== "width",
})<{ width: number }>`
  display: inline-flex;
  flex: 0 0 auto;
  position: relative;
  width: ${({ width }) => width}px;

  &::after {
    color: ${Xquare_colors.slate[600]};
    content: "▾";
    font-size: 14px;
    pointer-events: none;
    position: absolute;
    right: 17px;
    top: 50%;
    transform: translateY(-50%);
  }
`;

export const Select = styled.select`
  appearance: none;
  background: ${Xquare_colors.white};
  border: ${BORDER_STRONG};
  border-radius: 8px;
  color: ${Xquare_colors.slate[900]};
  cursor: pointer;
  font: inherit;
  font-size: 15px;
  height: 48px;
  padding: 0 40px 0 16px;
  width: 100%;

  /* "출처 전체"처럼 거르지 않는 값은 흐리게 */
  &[data-placeholder] {
    color: ${Xquare_colors.slate[400]};
  }

  &:focus {
    border-color: ${Xquare_colors.purple[400]};
    outline: none;
  }

  option {
    color: ${Xquare_colors.slate[900]};
  }
`;

export const FilterHint = styled.p`
  color: ${Xquare_colors.slate[600]};
  font-size: 13px;
  line-height: normal;
  margin: 0 0 20px;
`;

export const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const Card = styled.section`
  background: ${Xquare_colors.white};
  border: ${BORDER_DEFAULT};
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
`;

export const CardHead = styled.div`
  align-items: center;
  display: flex;
  gap: 16px;
  justify-content: space-between;
`;

export const CardHeading = styled.div`
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

const SMALL_BUTTON = `
  align-items: center;
  background: ${Xquare_colors.white};
  border: ${BORDER_STRONG};
  border-radius: 8px;
  color: ${Xquare_colors.slate[900]};
  cursor: pointer;
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 14px;
  font-weight: 500;
  height: 36px;
  line-height: normal;
  padding: 0 14px;
  white-space: nowrap;
  ${FOCUS_RING}
`;

export const SmallButton = styled.button`
  ${SMALL_BUTTON}
`;

export const SmallLink = styled(Link)`
  ${SMALL_BUTTON}
`;

const TABLE = `
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;

  th {
    background: ${Xquare_colors.slate[50]};
    border-bottom: ${BORDER_DEFAULT};
    color: ${Xquare_colors.slate[600]};
    font-size: 13px;
    font-weight: 700;
    /* 공지 표와 같이 높이에 아래 구분선 1px을 포함 (머리줄 48px, 행 56px) */
    height: 49px;
    padding: 0 16px;
    text-align: left;
  }

  td {
    border-bottom: ${BORDER_DEFAULT};
    color: ${Xquare_colors.slate[900]};
    font-size: 14px;
    height: 57px;
    overflow: hidden;
    padding: 0 16px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

// 날짜 · 제목 · 설명 · 출처 · 관리
export const ScheduleTable = styled.table`
  ${TABLE}

  th:nth-of-type(1),
  th:nth-of-type(4) {
    width: 160px;
  }

  th:nth-of-type(2) {
    width: 360px;
  }

  th:nth-of-type(5) {
    width: 124px;
  }
`;

// 날짜 · 2층 · 3층 · 4층. 4층 칸이 남는 폭을 채움
export const SupervisionTable = styled.table`
  ${TABLE}

  th:nth-of-type(1) {
    width: 160px;
  }

  th:nth-of-type(2),
  th:nth-of-type(3) {
    width: 280px;
  }
`;

export const Unassigned = styled.span`
  color: ${Xquare_colors.slate[400]};
`;

export const SourceBadge = styled.span<{ source: "neis" | "school" }>`
  background: ${({ source }) =>
    source === "neis" ? Xquare_colors.blue[100] : Xquare_colors.purple[100]};
  border-radius: 999px;
  color: ${({ source }) =>
    source === "neis" ? Xquare_colors.blue[400] : Xquare_colors.purple[400]};
  display: inline-flex;
  font-size: 12px;
  font-weight: 700;
  line-height: normal;
  padding: 5px 10px;
`;

export const TimetableNotice = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  line-height: normal;

  p {
    margin: 0;
  }

  p:first-of-type {
    color: ${Xquare_colors.slate[900]};
    font-size: 15px;
    font-weight: 500;
  }

  p:last-of-type {
    color: ${Xquare_colors.slate[600]};
    font-size: 13px;
  }
`;

export const ScheduleFormBox = styled.form`
  display: flex;
  flex-direction: column;
  max-width: 704px;
`;

export const FieldHint = styled.p`
  color: ${Xquare_colors.slate[600]};
  font-size: 13px;
  line-height: normal;
  margin: 0;
`;

// 비어 있을 때 브라우저가 보여주는 "연도-월-일"을 placeholder처럼 흐리게
export const DateInput = styled(TitleInput)`
  &[data-empty] {
    color: ${Xquare_colors.slate[400]};
  }
`;

export const ReadonlyInput = styled(TitleInput)`
  background: ${Xquare_colors.slate[50]};
  border-color: ${Xquare_colors.slate[200]};
  color: ${Xquare_colors.slate[600]};
`;
