import styled from "@emotion/styled";
import Link from "next/link";
import { Xquare_colors } from "../../styles/colors";
import {
  ContentTextarea,
  FormActions,
  TitleInput,
} from "../notice/page-style";

// 머리말, 버튼, 입력칸, 폼 카드, 삭제 모달은 공지 화면 스타일(../notice/page-style)을 같이 씀

const BORDER_STRONG = `1px solid ${Xquare_colors.slate[400]}`;
const BORDER_DEFAULT = `1px solid ${Xquare_colors.slate[200]}`;

// Figma 급식 목록의 `미등록` 글자색. 색상 토큰에 없어 이 화면에만 둠
const WARNING_TEXT = "#B45309";

export const FilterBar = styled.form`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
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

  &:focus {
    border-color: ${Xquare_colors.purple[400]};
    outline: none;
  }
`;

export const Hint = styled.p`
  color: ${Xquare_colors.slate[600]};
  font-size: 13px;
  line-height: normal;
  margin: 0;
`;

export const ListHint = styled(Hint)`
  margin-bottom: 20px;
`;

export const DayList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 16px;
  list-style: none;
  margin: 0;
  padding: 0;
`;

// 미등록·급식 없음 날짜는 옅은 배경
export const DayCard = styled.li`
  background: ${Xquare_colors.white};
  border: ${BORDER_DEFAULT};
  border-radius: 12px;
  padding: 20px 24px;

  &[data-state="empty"],
  &[data-state="off"] {
    background: ${Xquare_colors.slate[50]};
  }
`;

export const DayHead = styled.div`
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  min-height: 20px;
`;

export const DayTitle = styled.h2`
  align-items: center;
  color: ${Xquare_colors.slate[900]};
  display: flex;
  font-size: 16px;
  font-weight: 700;
  gap: 10px;
  line-height: normal;
  margin: 0;
`;

export const Weekday = styled.span`
  color: ${Xquare_colors.slate[600]};
  font-size: 14px;
  font-weight: 400;

  &[data-weekend] {
    color: ${Xquare_colors.red[600]};
  }
`;

export const DayBadge = styled.span`
  color: ${Xquare_colors.slate[600]};
  font-size: 12px;
  font-weight: 700;

  &[data-tone="warning"] {
    color: ${WARNING_TEXT};
  }
`;

export const SmallLink = styled(Link)`
  align-items: center;
  background: ${Xquare_colors.white};
  border: ${BORDER_STRONG};
  border-radius: 8px;
  color: ${Xquare_colors.slate[900]};
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 14px;
  font-weight: 500;
  height: 36px;
  padding: 0 14px;

  &:focus-visible {
    outline: 2px solid ${Xquare_colors.purple[400]};
    outline-offset: 2px;
  }
`;

export const MealColumns = styled.div`
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 16px;
`;

export const MealColumn = styled.section`
  h3 {
    color: ${Xquare_colors.slate[600]};
    font-size: 13px;
    font-weight: 700;
    line-height: normal;
    margin: 0;
  }

  ul {
    color: ${Xquare_colors.slate[900]};
    display: flex;
    flex-direction: column;
    font-size: 14px;
    gap: 6px;
    line-height: normal;
    list-style: none;
    margin: 10px 0 0;
    padding: 0;
  }
`;

export const EmptyText = styled.p`
  color: ${Xquare_colors.slate[400]};
  font-size: 14px;
  line-height: normal;
  margin: 16px 0 0;
`;

export const MenuNone = styled.p`
  color: ${Xquare_colors.slate[400]};
  font-size: 14px;
  line-height: normal;
  margin: 10px 0 0;
`;

export const MealFormBox = styled.form`
  display: flex;
  flex-direction: column;
  max-width: 824px;
`;

// 비어 있을 때(required라 :invalid) 날짜 자리 글자를 안내 문구 색으로 보임
export const DateInput = styled(TitleInput)`
  &:invalid {
    color: ${Xquare_colors.slate[400]};
  }

  &[aria-invalid="true"] {
    border-color: ${Xquare_colors.red[500]};
  }

  &::-webkit-calendar-picker-indicator {
    cursor: pointer;
  }
`;

// 한 줄에 메뉴 하나. Figma 입력칸 높이(7줄)에 맞춤
export const MenuTextarea = styled(ContentTextarea)`
  height: auto;
  padding: 12px 16px;
`;

export const ErrorText = styled.p`
  color: ${Xquare_colors.red[600]};
  font-size: 13px;
  line-height: normal;
  margin: 0;
`;

// Figma에서 버튼은 입력 카드 아래 30px에 있음
export const MealFormActions = styled(FormActions)`
  padding-top: 30px;
`;
