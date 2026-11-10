import styled from "@emotion/styled";
import { Xquare_colors } from "../../styles/colors";

export const ForbiddenBox = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 24px;
  line-height: normal;
  text-align: center;
`;

export const StatusCode = styled.p`
  color: ${Xquare_colors.purple[400]};
  font-size: 72px;
  font-weight: 700;
  margin: 0;
`;

export const ForbiddenTitle = styled.h1`
  color: ${Xquare_colors.slate[900]};
  font-size: 28px;
  font-weight: 700;
  margin: 0;
`;

export const ForbiddenDescription = styled.div`
  color: ${Xquare_colors.slate[600]};
  font-size: 16px;
  max-width: 420px;

  p {
    margin: 0;
  }
`;

export const ForbiddenActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
`;
