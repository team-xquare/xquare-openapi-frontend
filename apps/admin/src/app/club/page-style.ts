import styled from "@emotion/styled";
import { Xquare_colors } from "../../styles/colors";
import {
  FormActions,
  NoticeTable,
  SearchInput,
  SecondaryButton,
} from "../notice/page-style";

// 머리말, 버튼, 입력칸, 폼 카드는 공지 화면 스타일(../notice/page-style)을 같이 씀

const BORDER_STRONG = `1px solid ${Xquare_colors.slate[400]}`;
const BORDER_DEFAULT = `1px solid ${Xquare_colors.slate[200]}`;

const FOCUS_RING = `
  &:focus-visible {
    outline: 2px solid ${Xquare_colors.purple[400]};
    outline-offset: 2px;
  }
`;

const TEXT_BUTTON = `
  appearance: none;
  background: transparent;
  border: 0;
  cursor: pointer;
  font: inherit;
  padding: 0;
  ${FOCUS_RING}
`;

export const FilterBar = styled.form`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
`;

export const KeywordInput = styled(SearchInput)`
  max-width: none;
  width: 280px;
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

// 열 너비는 Figma 동아리 목록 기준. 마지막(수정·삭제) 열이 남는 폭을 가짐
export const ClubTable = styled(NoticeTable)`
  /* 겹친 테두리 표에서는 높이에 아래 구분선 1px이 들어가므로 Figma 높이 + 1px */
  th {
    height: 49px;
  }

  td {
    height: 57px;
  }

  th:nth-of-type(1) {
    width: 200px;
  }

  th:nth-of-type(2) {
    width: 180px;
  }

  th:nth-of-type(3) {
    width: 150px;
  }

  th:nth-of-type(4) {
    width: 110px;
  }

  th:nth-of-type(5) {
    width: 180px;
  }

  th:nth-of-type(6) {
    width: auto;
  }
`;

export const Muted = styled.span`
  color: ${Xquare_colors.slate[400]};
`;

export const ClubFormBox = styled.form`
  display: flex;
  flex-direction: column;
  max-width: 824px;
`;

// Figma에서 버튼은 입력 카드 아래 30px에 있음
export const ClubFormActions = styled(FormActions)`
  padding-top: 30px;
`;

export const LogoField = styled.div`
  align-items: center;
  display: flex;
  gap: 16px;
`;

export const LogoBox = styled.div`
  align-items: center;
  background: ${Xquare_colors.slate[50]};
  border: ${BORDER_STRONG};
  border-radius: 10px;
  color: ${Xquare_colors.slate[600]};
  display: flex;
  flex: 0 0 auto;
  font-size: 13px;
  height: 120px;
  justify-content: center;
  overflow: hidden;
  width: 120px;

  img {
    height: 100%;
    object-fit: cover;
    width: 100%;
  }
`;

export const LogoSide = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const SmallButton = styled(SecondaryButton)`
  font-size: 14px;
  height: 36px;
  padding: 0 14px;
`;

export const FileName = styled.span`
  color: ${Xquare_colors.slate[400]};
  font-size: 12px;
  word-break: break-all;
`;

export const ErrorText = styled.p`
  color: ${Xquare_colors.red[600]};
  font-size: 13px;
  line-height: normal;
  margin: 0;
`;

export const MemberPicker = styled.div`
  display: flex;
  flex-direction: column;
`;

export const MemberSearch = styled.div`
  align-items: center;
  display: flex;
  gap: 12px;
`;

export const MemberSearchInput = styled(SearchInput)`
  flex: 0 1 560px;
  max-width: none;
  min-width: 0;
`;

export const ResultList = styled.ul`
  border: ${BORDER_STRONG};
  border-radius: 10px;
  list-style: none;
  margin: 12px 0 0;
  padding: 8px;
`;

export const ResultItem = styled.li`
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  min-height: 48px;
  padding: 6px 12px;
`;

export const ResultText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: normal;

  strong {
    color: ${Xquare_colors.slate[900]};
    font-size: 14px;
    font-weight: 500;
  }

  span {
    color: ${Xquare_colors.slate[600]};
    font-size: 12px;
  }

  /* 이미 추가된 학생은 이름도 흐리게 */
  &[data-added] strong {
    color: ${Xquare_colors.slate[600]};
  }
`;

export const ResultStatus = styled.span`
  color: ${Xquare_colors.slate[400]};
  flex: 0 0 auto;
  font-size: 14px;
  font-weight: 700;
`;

export const AddButton = styled.button`
  ${TEXT_BUTTON}
  color: ${Xquare_colors.purple[400]};
  flex: 0 0 auto;
  font-size: 14px;
  font-weight: 700;
`;

export const ResultEmpty = styled.li`
  color: ${Xquare_colors.slate[600]};
  font-size: 14px;
  padding: 14px 12px;
`;

export const MemberHead = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  justify-content: space-between;
  line-height: normal;
  margin-top: 16px;
  min-height: 36px;

  strong {
    color: ${Xquare_colors.slate[900]};
    font-size: 14px;
    font-weight: 700;
  }

  span {
    color: ${Xquare_colors.slate[600]};
    font-size: 13px;
  }
`;

export const MemberTableBox = styled.div`
  border: ${BORDER_STRONG};
  border-radius: 10px;
  overflow: hidden;
`;

// 열 너비는 Figma 구성원 표(760px) 기준
export const MemberTable = styled.table`
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;

  th {
    background: ${Xquare_colors.slate[50]};
    color: ${Xquare_colors.slate[600]};
    font-size: 13px;
    font-weight: 700;
    height: 44px;
    padding: 0 14px;
    text-align: left;
  }

  th:nth-of-type(1) {
    width: 80px;
  }

  th:nth-of-type(2) {
    width: 180px;
  }

  th:nth-of-type(3) {
    width: 220px;
  }

  th:nth-of-type(5) {
    width: 80px;
  }

  td {
    border-top: ${BORDER_DEFAULT};
    color: ${Xquare_colors.slate[900]};
    font-size: 14px;
    height: 53px;
    overflow: hidden;
    padding: 0 14px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  td:nth-of-type(3) {
    color: ${Xquare_colors.slate[600]};
  }

  tr[data-leader] td:nth-of-type(2) {
    font-weight: 700;
  }
`;

export const LeaderRadio = styled.input`
  appearance: none;
  background: ${Xquare_colors.white};
  border: ${BORDER_STRONG};
  border-radius: 50%;
  cursor: pointer;
  display: block;
  height: 18px;
  margin: 0;
  width: 18px;

  &:checked {
    border: 5px solid ${Xquare_colors.purple[400]};
  }

  ${FOCUS_RING}
`;

export const LeaderBadge = styled.span`
  color: ${Xquare_colors.purple[400]};
  font-size: 12px;
  font-weight: 700;
`;

export const RemoveButton = styled.button`
  ${TEXT_BUTTON}
  color: ${Xquare_colors.red[600]};
  font-size: 14px;
  font-weight: 500;
`;

export const MemberEmpty = styled.td`
  && {
    color: ${Xquare_colors.slate[600]};
    text-align: center;
  }
`;

// Figma 공통 · 삭제 확인 모달 · 동아리
export const ClubModalDialog = styled.dialog`
  background: ${Xquare_colors.white};
  border: 0;
  border-radius: 16px;
  color: ${Xquare_colors.slate[900]};
  margin: auto;
  max-width: calc(100vw - 40px);
  padding: 32px 32px 24px;
  width: 520px;
  word-break: keep-all;

  &::backdrop {
    background: rgba(0, 0, 0, 0.45);
  }
`;

export const ClubModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  line-height: normal;
  margin: 0;
`;

export const ClubModalDescription = styled.p`
  color: ${Xquare_colors.slate[600]};
  font-size: 15px;
  line-height: normal;
  margin: 14px 0 0;
`;

export const EffectList = styled.ul`
  background: ${Xquare_colors.slate[50]};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  line-height: normal;
  list-style: none;
  margin: 16px 0 0;
  padding: 16px 18px;
`;

export const EffectItem = styled.li`
  display: flex;
  gap: 10px;

  &::before {
    color: ${Xquare_colors.slate[600]};
    content: "·";
    font-size: 14px;
    font-weight: 700;
  }

  div {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  strong {
    font-size: 14px;
    font-weight: 700;
  }

  span {
    color: ${Xquare_colors.slate[600]};
    font-size: 13px;
  }
`;

export const ClubModalActions = styled.form`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 28px;
`;

export const ModalDangerButton = styled.button`
  align-items: center;
  background: ${Xquare_colors.red[600]};
  border: 0;
  border-radius: 8px;
  color: ${Xquare_colors.white};
  cursor: pointer;
  display: inline-flex;
  font-size: 15px;
  font-weight: 700;
  height: 44px;
  justify-content: center;
  padding: 0 20px;
  ${FOCUS_RING}
`;
