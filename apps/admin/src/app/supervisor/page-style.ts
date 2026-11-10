import styled from "@emotion/styled";
import { Xquare_colors } from "../../styles/colors";
import { FormActions, NoticeTable, TitleInput } from "../notice/page-style";

// 머리말, 버튼, 입력칸, 폼 카드, 삭제 모달은 공지 화면 스타일(../notice/page-style)을 같이 씀

const BORDER_STRONG = `1px solid ${Xquare_colors.slate[400]}`;

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
})<{ width?: number }>`
  display: inline-flex;
  flex: 0 1 auto;
  max-width: 100%;
  position: relative;
  width: ${({ width }) => (width ? `${width}px` : "100%")};

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

// 값이 비어 있으면(data-empty) 안내 문구 색으로 보임
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

  &[data-empty] {
    color: ${Xquare_colors.slate[400]};
  }

  option {
    color: ${Xquare_colors.slate[900]};
  }

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

// 열 너비는 Figma 자습감독 목록 기준. 마지막(수정·삭제) 열이 남는 폭을 가짐
export const SupervisionTable = styled(NoticeTable)`
  /* 겹친 테두리 표에서는 높이에 아래 구분선 1px이 들어가므로 Figma 높이 + 1px */
  th {
    height: 49px;
  }

  td {
    height: 57px;
  }

  th:nth-of-type(1) {
    width: 160px;
  }

  th:nth-of-type(2) {
    width: 100px;
  }

  th:nth-of-type(3),
  th:nth-of-type(4),
  th:nth-of-type(5) {
    width: 220px;
  }

  th:nth-of-type(6) {
    width: auto;
  }
`;

export const Muted = styled.span`
  color: ${Xquare_colors.slate[400]};
`;

export const SupervisionFormBox = styled.form`
  display: flex;
  flex-direction: column;
  max-width: 704px;
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

export const ErrorText = styled.p`
  color: ${Xquare_colors.red[600]};
  font-size: 13px;
  line-height: normal;
  margin: 0;
`;

export const FloorList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const FloorRow = styled.div`
  align-items: center;
  display: flex;
  gap: 16px;
`;

export const FloorLabel = styled.label`
  color: ${Xquare_colors.slate[900]};
  flex: 0 0 80px;
  font-size: 14px;
  font-weight: 700;
`;

// Figma에서 버튼은 입력 카드 아래 30px에 있음
export const SupervisionFormActions = styled(FormActions)`
  padding-top: 30px;
`;
