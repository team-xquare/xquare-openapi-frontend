"use client";

import styled from "@emotion/styled";

// 퍼블리싱 전 자리만 잡아 둔 홈
export default function AdminHome() {
  return (
    <Main>
      <Title>데이터 관리자</Title>
      <Lead>학교 데이터를 입력하고 관리하는 교직원 전용 화면입니다.</Lead>
    </Main>
  );
}

const Main = styled.main`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 48px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: 700;
`;

const Lead = styled.p`
  margin: 0;
  font-size: 15px;
  color: #5c646b;
`;
