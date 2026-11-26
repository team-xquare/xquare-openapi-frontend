import styled from "@emotion/styled";
import { Xquare_colors } from "../../styles/colors";

// API를 불러오거나 저장할 때의 상태 문구 (공지 관리와 같은 모양)

// 삭제 확인 모달 안의 실패 문구
export const ModalError = styled.p`
  color: ${Xquare_colors.red[500]};
  font-size: 13px;
  line-height: normal;
  margin: 12px 0 0;
`;

// 저장 실패 문구. 입력 카드와 버튼 사이에 둠
export const FormError = styled.p`
  color: ${Xquare_colors.red[500]};
  font-size: 13px;
  line-height: normal;
  margin: 16px 0 0;
`;

// 표 칸 · 목록 안의 불러오기 실패 문구와 다시 시도 버튼
export const CellStatus = styled.div`
  align-items: center;
  display: inline-flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
`;

// 수정 화면에서 데이터를 불러오는 중이거나 불러오지 못했을 때
export const LoadStatus = styled.div`
  align-items: flex-start;
  color: ${Xquare_colors.slate[600]};
  display: flex;
  flex-direction: column;
  font-size: 14px;
  gap: 16px;

  p {
    margin: 0;
  }
`;
