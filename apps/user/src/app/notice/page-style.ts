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

export const NoticePageCount = styled.p`
  color: #7b8494;
  font-size: 12px;
  line-height: 1.5;
  margin: 18px 0 0;
`;
