import styled from "@emotion/styled";
import Link from "next/link";
import { Xquare_colors } from "../../styles/colors";

export const MyPageContainer = styled.main`
  color: ${Xquare_colors.slate[900]};
  display: flex;
  flex-direction: column;
  gap: 40px;
  min-height: 100%;
  padding: 54px 46px 80px;
  word-break: keep-all;

  @media (max-width: 800px) {
    gap: 32px;
    padding: 32px 20px 60px;
  }
`;

export const PageHeader = styled.header``;

export const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  line-height: 1.35;
  margin: 0 0 10px;
`;

export const PageLead = styled.p`
  color: ${Xquare_colors.gray[600]};
  font-size: 16px;
  margin: 0;
`;

export const PageNotes = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const ProjectArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  margin: 0;
`;

export const AccountDetails = styled.dl`
  border-block: 1px solid ${Xquare_colors.slate[400]};
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 12px 0 0;
  padding: 18px 0 20px;
`;

export const AccountRow = styled.div`
  display: grid;
  font-size: 16px;
  grid-template-columns: 140px minmax(0, 1fr);
  line-height: 1.5;

  dt {
    font-weight: 700;
  }
  dd {
    margin: 0;
  }

  @media (max-width: 560px) {
    grid-template-columns: 100px minmax(0, 1fr);
  }
`;

export const ProjectSectionHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0;

  @media (max-width: 640px) {
    align-items: flex-start;
    flex-direction: column;
    gap: 14px;
  }
`;

export const ProjectStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const CardActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ButtonBase = `
  background: ${Xquare_colors.white};
  border: 1px solid ${Xquare_colors.slate[400]};
  border-radius: 8px;
  color: ${Xquare_colors.slate[900]};
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  min-height: 44px;
  padding: 0 18px;
`;

export const ActionButton = styled.button`
  ${ButtonBase}
`;
export const AddProjectButton = styled.button`
  ${ButtonBase}
`;

export const DangerButton = styled.button`
  ${ButtonBase}
  color: ${Xquare_colors.red[600]};
`;

export const ProjectCard = styled.article`
  background: ${Xquare_colors.slate[50]};
  border: 1px solid ${Xquare_colors.slate[200]};
  border-radius: 10px;
  margin-bottom: 0;
  padding: 20px 22px;
`;

export const ProjectList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const ProjectCardHeader = styled.header`
  align-items: center;
  border-bottom: 1px solid ${Xquare_colors.slate[400]};
  display: flex;
  justify-content: space-between;
  padding-bottom: 14px;

  @media (max-width: 760px) {
    align-items: flex-start;
    flex-direction: column;
    gap: 14px;
  }
`;

export const ProjectName = styled.h3`
  font-size: 18px;
  margin: 0;
`;

export const ProjectNameEdit = styled(Link)`
  background: transparent;
  border: 0;
  color: ${Xquare_colors.blue[500]};
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  margin-left: 8px;
  padding: 0;
`;

export const ProjectMeta = styled.dl`
  border-bottom: 1px solid ${Xquare_colors.slate[400]};
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 18px 0 20px;
`;

export const FieldMeta = styled.div`
  display: grid;
  font-size: 15px;
  grid-template-columns: 140px minmax(0, 1fr);

  dt {
    font-weight: 700;
  }
  dd {
    margin: 0;
  }
`;

export const ApiKeyCell = styled.span`
  color: ${Xquare_colors.gray[700]};
  font-size: 14px;
`;

export const ProjectTableWrap = styled.div`
  margin-top: 14px;
  overflow-x: auto;
`;

export const ProjectTable = styled.table`
  border: 1px solid ${Xquare_colors.slate[400]};
  border-collapse: separate;
  border-radius: 8px;
  border-spacing: 0;
  font-size: 14px;
  min-width: 860px;
  overflow: hidden;
  width: 100%;
`;

export const TableRow = styled.tr``;

export const TableHeader = styled.th`
  background: ${Xquare_colors.slate[100]};
  border-bottom: 1px solid ${Xquare_colors.slate[400]};
  color: ${Xquare_colors.gray[600]};
  font-weight: 600;
  padding: 12px 14px;
  text-align: left;
  white-space: nowrap;
`;

export const TableCell = styled.td`
  border-bottom: 1px solid ${Xquare_colors.slate[400]};
  padding: 12px 14px;
  vertical-align: middle;

  &:first-child {
    min-width: 210px;
  }
  &:nth-child(3) {
    min-width: 310px;
  }
  &:last-child {
    white-space: nowrap;
  }
  tr:last-child & {
    border-bottom: 0;
  }
  code {
    font-size: 13px;
  }
`;

export const StatusBadge = styled.span<{
  $status: "approved" | "pending" | "rejected";
}>`
  background: ${(props) =>
    props.$status === "approved"
      ? Xquare_colors.green[100]
      : props.$status === "pending"
        ? "#fff0db"
        : "#ffe5e5"};
  border-radius: 999px;
  color: ${(props) =>
    props.$status === "approved"
      ? Xquare_colors.green[500]
      : props.$status === "pending"
        ? "#c46700"
        : Xquare_colors.red[600]};
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  white-space: nowrap;
`;

export const InfoText = styled.p<{ $rejected?: boolean; $noMargin?: boolean }>`
  color: ${(props) =>
    props.$rejected ? Xquare_colors.red[600] : Xquare_colors.gray[600]};
  font-size: 14px;
  margin: ${(props) => (props.$noMargin ? 0 : "4px 0 0")};
`;

export const EmptyProjectNote = styled.p`
  color: ${Xquare_colors.gray[600]};
  font-size: 14px;
  line-height: 1.5;
  margin: 16px 0 0;
`;

export const TextLink = styled(Link)`
  color: ${Xquare_colors.blue[500]};
  font-weight: 600;
  white-space: nowrap;
`;
