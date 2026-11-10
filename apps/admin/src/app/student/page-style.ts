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

  &:focus-visible {
    border-color: ${Xquare_colors.purple[400]};
    outline: 2px solid ${Xquare_colors.purple[100]};
    outline-offset: 0;
  }
`;

const BUTTON = `
  align-items: center;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  height: 48px;
  justify-content: center;
  padding: 0 20px;
  white-space: nowrap;
`;

export const StudentPage = styled.main`
  display: flex;
  flex-direction: column;
  padding: 48px 58px 64px;
  word-break: keep-all;
`;

export const PageHead = styled.header`
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  margin-bottom: 34px;
`;

export const Heading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const PageTitle = styled.h1`
  color: ${Xquare_colors.slate[900]};
  font-size: 28px;
  font-weight: 700;
  margin: 0;
`;

export const PageDescription = styled.p`
  color: ${Xquare_colors.slate[600]};
  font-size: 15px;
  margin: 0;
`;

export const PrimaryButton = styled.button`
  ${BUTTON}
  background: ${Xquare_colors.purple[400]};
  border: 0;
  color: ${Xquare_colors.white};
  font-weight: 700;
`;

export const PrimaryLink = styled(Link)`
  ${BUTTON}
  background: ${Xquare_colors.purple[400]};
  color: ${Xquare_colors.white};
  font-weight: 700;
`;

export const FilterBar = styled.form`
  align-items: center;
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`;

export const SearchInput = styled.input`
  ${CONTROL}
  padding: 0 16px;
  width: 322px;

  &::placeholder {
    color: ${Xquare_colors.slate[400]};
  }
`;

export const FilterSelect = styled.select`
  ${CONTROL}
  cursor: pointer;
  padding: 0 38px 0 16px;
  width: 196px;
`;

export const SearchButton = styled.button`
  ${BUTTON}
  background: ${Xquare_colors.white};
  border: ${STRONG_BORDER};
  color: ${Xquare_colors.slate[900]};
`;

export const Notice = styled.p`
  color: ${Xquare_colors.slate[600]};
  font-size: 14px;
  margin: 0 0 24px;
`;

export const StudentTable = styled.table`
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
    padding: 0 18px;
    text-align: left;
  }

  th:nth-of-type(1) {
    width: 13%;
  }
  th:nth-of-type(2) {
    width: 18%;
  }
  th:nth-of-type(3) {
    width: 12%;
  }
  th:nth-of-type(4) {
    width: 23%;
  }
  th:nth-of-type(5) {
    width: 16%;
  }
  th:nth-of-type(6) {
    width: 18%;
  }

  td {
    border-bottom: ${BORDER};
    color: ${Xquare_colors.slate[900]};
    font-size: 14px;
    height: 66px;
    overflow: hidden;
    padding: 0 18px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const Actions = styled.div`
  align-items: center;
  display: flex;
  gap: 12px;
`;

export const EditButton = styled.button`
  appearance: none;
  background: transparent;
  border: 0;
  color: ${Xquare_colors.purple[400]};
  cursor: pointer;
  font: inherit;
  padding: 8px 0;
`;

export const EditLink = styled(Link)`
  color: ${Xquare_colors.purple[400]};
  display: inline-block;
  font: inherit;
  padding: 8px 0;
`;

export const DeleteButton = styled(EditButton)`
  color: ${Xquare_colors.red[600]};
`;

export const EmptyCell = styled.td`
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
  background: transparent;
  border: 0;
  border-radius: 8px;
  color: ${Xquare_colors.slate[600]};
  cursor: pointer;
  font: inherit;
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

export const Modal = styled.dialog`
  border: 0;
  border-radius: 16px;
  box-shadow: 0 12px 40px ${Xquare_colors.black}24;
  padding: 32px;
  width: min(520px, calc(100vw - 40px));
  &::backdrop {
    background: ${Xquare_colors.black}80;
  }
`;

export const ModalTitle = styled.h2`
  color: ${Xquare_colors.slate[900]};
  font-size: 22px;
  margin: 0 0 24px;
`;

export const ModalForm = styled.form`
  display: grid;
  gap: 14px;
`;

export const ModalField = styled.label`
  color: ${Xquare_colors.slate[600]};
  display: grid;
  font-size: 13px;
  gap: 6px;
  input,
  select {
    ${CONTROL};
    padding: 0 12px;
    width: 100%;
  }
`;

export const ModalActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 12px;
`;

export const ModalButton = styled.button`
  ${BUTTON}
  background: ${Xquare_colors.white};
  border: ${STRONG_BORDER};
  color: ${Xquare_colors.slate[900]};
`;

export const ModalSubmit = styled(ModalButton)`
  background: ${Xquare_colors.purple[400]};
  border-color: ${Xquare_colors.purple[400]};
  color: ${Xquare_colors.white};
`;

export const DeleteModalOverlay = styled.div`
  align-items: center;
  background: ${Xquare_colors.black}80;
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 20px;
  position: fixed;
  z-index: 10;
`;

export const DeleteModal = styled.div`
  width: min(490px, 100%);
`;

export const DeleteModalDialog = styled.div`
  background: ${Xquare_colors.white};
  border-radius: 14px;
  box-shadow: 0 16px 48px ${Xquare_colors.black}24;
  padding: 28px 30px 22px;
`;

export const DeleteModalHeading = styled.h2`
  color: ${Xquare_colors.slate[900]};
  font-size: 20px;
  margin: 0 0 12px;
`;

export const DeleteModalDescription = styled.p`
  color: ${Xquare_colors.slate[600]};
  font-size: 14px;
  margin: 0 0 16px;
`;

export const DeleteModalRelations = styled.div`
  background: ${Xquare_colors.slate[50]};
  border-radius: 8px;
  display: grid;
  gap: 14px;
  padding: 14px 16px;
`;

export const DeleteModalRelation = styled.div`
  color: ${Xquare_colors.slate[600]};
  display: grid;
  font-size: 13px;
  gap: 4px;

  strong {
    color: ${Xquare_colors.slate[900]};
    font-size: 14px;
  }
`;

export const DeleteModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

export const DeleteModalCancel = styled.button`
  background: ${Xquare_colors.white};
  border: ${STRONG_BORDER};
  border-radius: 8px;
  color: ${Xquare_colors.slate[900]};
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  height: 40px;
  padding: 0 18px;
`;

export const DeleteModalConfirm = styled.button`
  background: ${Xquare_colors.red[600]};
  border: 0;
  border-radius: 8px;
  color: ${Xquare_colors.white};
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  height: 40px;
  padding: 0 18px;
`;
