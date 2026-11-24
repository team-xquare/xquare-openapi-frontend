import styled from "@emotion/styled";
import Link from "next/link";

export const NoticeHeading = styled.h2`
  color: #111;
  font-size: 21px;
  font-weight: 700;
  line-height: 1.4;
  margin: 0;
`;

export const NoticeDescription = styled.p`
  color: #7b8494;
  font-size: 13px;
  line-height: 1.5;
  margin: 0 0 20px;
`;

export const NoticeTable = styled.div`
  width: 100%;
`;

const TableGrid = `
  align-items: center;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 140px 180px;
  padding: 0 14px;

  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr) 80px 104px;
    padding: 0 10px;
  }
`;

export const NoticeTableHeader = styled.div`
  ${TableGrid}
  background: #f8f9fa;
  border-bottom: 1px solid #e1e4e8;
  border-top: 2px solid #222;
  color: #111;
  font-size: 12px;
  font-weight: 600;
  height: 42px;
`;

export const NoticeTableBody = styled.div``;

export const NoticeTableRow = styled.div`
  ${TableGrid}
  border-bottom: 1px solid #e1e4e8;
  color: #111;
  font-size: 14px;
  min-height: 50px;

  span:nth-child(2),
  span:nth-child(3) {
    color: #7b8494;
    font-size: 12px;
  }
`;

export const NoticeTitleLink = styled(Link)`
  &:hover,
  &:focus-visible {
    color: #9650fa;
    text-decoration: underline;
  }
`;

// 불러오는 중이거나 공지가 없을 때 표 아래에 보이는 문구
export const NoticeTableMessage = styled.p`
  border-bottom: 1px solid #e1e4e8;
  color: #7b8494;
  font-size: 14px;
  margin: 0;
  padding: 16px 14px;
  text-align: center;
`;

// 건수 · 페이지는 왼쪽, 이전 · 다음 버튼은 오른쪽
export const NoticePager = styled.div`
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-top: 18px;
`;

export const NoticePageCount = styled.p`
  color: #7b8494;
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
`;

export const NoticePagerButtons = styled.div`
  display: flex;
  gap: 8px;
`;

export const NoticePagerButton = styled.button`
  background: #fff;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  color: #111;
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  height: 30px;
  padding: 0 12px;

  &:hover:not(:disabled) {
    border-color: #9650fa;
    color: #9650fa;
  }

  &:focus-visible {
    outline: 2px solid #9650fa;
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
`;
