import styled from "@emotion/styled";
import Link from "next/link";
import { Xquare_colors } from "../../styles/colors";

const BORDER_STRONG = `1px solid ${Xquare_colors.slate[400]}`;
const BORDER_DEFAULT = `1px solid ${Xquare_colors.slate[200]}`;

const BUTTON = `
  align-items: center;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 15px;
  height: 44px;
  justify-content: center;
  line-height: normal;
  padding: 0 20px;
  white-space: nowrap;

  &:focus-visible {
    outline: 2px solid ${Xquare_colors.purple[400]};
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
`;

const PRIMARY_BUTTON = `
  ${BUTTON}
  background: ${Xquare_colors.purple[400]};
  border: 0;
  color: ${Xquare_colors.white};
  font-weight: 700;
`;

const FIELD = `
  border: ${BORDER_STRONG};
  border-radius: 8px;
  color: ${Xquare_colors.slate[900]};
  font: inherit;
  font-size: 15px;
  width: 100%;

  &::placeholder {
    color: ${Xquare_colors.slate[400]};
  }

  &:focus {
    border-color: ${Xquare_colors.purple[400]};
    outline: none;
  }
`;

export const NoticePage = styled.main`
  display: flex;
  flex-direction: column;
  padding: 48px 58px 64px;
  word-break: keep-all;
`;

export const PageHead = styled.header`
  align-items: center;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  margin-bottom: 32px;
`;

export const PageHeading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
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

export const PrimaryButton = styled.button`
  ${PRIMARY_BUTTON}
`;

export const PrimaryLink = styled(Link)`
  ${PRIMARY_BUTTON}
`;

export const SecondaryButton = styled.button`
  ${BUTTON}
  background: ${Xquare_colors.white};
  border: ${BORDER_STRONG};
  color: ${Xquare_colors.slate[900]};
  font-weight: 500;
`;

export const DangerOutlineButton = styled.button`
  ${BUTTON}
  background: ${Xquare_colors.white};
  border: 1px solid ${Xquare_colors.red[500]};
  color: ${Xquare_colors.red[600]};
  font-weight: 700;
`;

export const SearchBar = styled.form`
  align-items: center;
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
`;

export const SearchInput = styled.input`
  ${FIELD}
  height: 48px;
  max-width: 360px;
  padding: 0 16px;
`;

export const NoticeTable = styled.table`
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;

  th {
    background: ${Xquare_colors.slate[50]};
    border-bottom: ${BORDER_DEFAULT};
    color: ${Xquare_colors.slate[600]};
    font-size: 13px;
    font-weight: 700;
    /* 겹친 테두리 표에서는 높이에 아래 구분선 1px이 들어가므로,
       Figma의 머리줄 48px + 구분선 1px에 맞춰 49px */
    height: 49px;
    padding: 0 16px;
    text-align: left;
  }

  th:nth-of-type(2) {
    width: 150px;
  }

  th:nth-of-type(3),
  th:nth-of-type(4) {
    width: 220px;
  }

  th:nth-of-type(5) {
    width: 202px;
  }

  td {
    border-bottom: ${BORDER_DEFAULT};
    color: ${Xquare_colors.slate[900]};
    font-size: 14px;
    /* 행 56px + 구분선 1px */
    height: 57px;
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

export const VisuallyHidden = styled.span`
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;

export const RowActions = styled.div`
  align-items: center;
  display: flex;
  font-size: 14px;
  font-weight: 500;
  gap: 12px;
`;

export const RowEditLink = styled(Link)`
  color: ${Xquare_colors.purple[400]};
`;

export const RowDeleteButton = styled.button`
  appearance: none;
  background: transparent;
  border: 0;
  color: ${Xquare_colors.red[600]};
  cursor: pointer;
  font-weight: 500;
  padding: 0;
`;

// 전체 건수는 왼쪽, 페이지 버튼은 가운데
export const Pager = styled.div`
  align-items: center;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  padding-top: 20px;
`;

export const PagerTotal = styled.p`
  color: ${Xquare_colors.slate[600]};
  font-size: 14px;
  line-height: normal;
  margin: 0;
`;

export const PageList = styled.nav`
  align-items: center;
  display: flex;
  gap: 8px;
`;

export const PageButton = styled.button`
  appearance: none;
  background: ${Xquare_colors.white};
  border: 0;
  border-radius: 8px;
  color: ${Xquare_colors.slate[600]};
  cursor: pointer;
  font-size: 14px;
  height: 36px;
  min-width: 38px;
  padding: 0 15px;

  &[aria-current="page"] {
    background: ${Xquare_colors.purple[100]};
    color: ${Xquare_colors.purple[400]};
    font-weight: 700;
  }
`;

export const NoticeFormBox = styled.form`
  display: flex;
  flex-direction: column;
  max-width: 944px;
`;

export const FormCard = styled.div`
  background: ${Xquare_colors.white};
  border: ${BORDER_DEFAULT};
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 32px;
`;

export const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const FieldLabelRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

export const FieldLabel = styled.label`
  color: ${Xquare_colors.slate[900]};
  display: flex;
  font-size: 14px;
  font-weight: 700;
  gap: 6px;
`;

export const RequiredMark = styled.span`
  color: ${Xquare_colors.red[600]};
`;

export const FieldCount = styled.span`
  color: ${Xquare_colors.slate[400]};
  font-size: 13px;
`;

export const TitleInput = styled.input`
  ${FIELD}
  height: 48px;
  padding: 0 16px;
`;

export const ContentTextarea = styled.textarea`
  ${FIELD}
  height: 392px;
  line-height: 25px;
  padding: 12px 16px;
  resize: vertical;
`;

export const FormNote = styled.div`
  color: ${Xquare_colors.slate[600]};
  display: flex;
  flex-direction: column;
  font-size: 13px;
  gap: 4px;

  p {
    margin: 0;
  }
`;

// 수정 화면은 삭제가 왼쪽, 취소·저장이 오른쪽. 등록 화면은 취소·저장만 왼쪽
// Figma에서 버튼은 입력 카드 아래 30px에 있음
export const FormActions = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding-top: 30px;
`;

export const ActionGroup = styled.div`
  display: flex;
  gap: 12px;
`;

// 디자인 시스템 Modal(Type=Danger)
export const ModalDialog = styled.dialog`
  background: ${Xquare_colors.white};
  border: 0;
  border-radius: 16px;
  box-shadow: 0 8px 24px ${Xquare_colors.black}1F;
  color: ${Xquare_colors.slate[900]};
  margin: auto;
  max-width: calc(100vw - 40px);
  padding: 32px;
  width: 480px;

  &::backdrop {
    background: ${Xquare_colors.black}80;
  }
`;

export const ModalTitle = styled.h2`
  font-size: 22px;
  font-weight: 700;
  line-height: 30px;
  margin: 0;
`;

export const ModalDescription = styled.p`
  color: ${Xquare_colors.slate[600]};
  font-size: 14px;
  line-height: 20px;
  margin: 8px 0 0;
`;

export const ModalActions = styled.form`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 24px;
`;

export const ModalCancelButton = styled(SecondaryButton)`
  font-size: 14px;
`;

export const ModalDangerButton = styled.button`
  ${BUTTON}
  background: ${Xquare_colors.red[600]};
  border: 0;
  color: ${Xquare_colors.white};
  font-size: 14px;
  font-weight: 500;
`;
