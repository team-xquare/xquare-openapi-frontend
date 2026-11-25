"use client";

import { useEffect, useState } from "react";
import {
  AccountDetails,
  AccountRow,
  ActionButton,
  AddProjectButton,
  ApiKeyCell,
  CardActions,
  DangerButton,
  FieldMeta,
  InfoText,
  MyPageContainer,
  PageHeader,
  PageLead,
  PageNotes,
  PageTitle,
  ProjectCard,
  ProjectCardHeader,
  ProjectMeta,
  ProjectName,
  ProjectNameEdit,
  ProjectArea,
  ProjectList,
  ProjectSectionHeader,
  ProjectStack,
  ProjectTable,
  ProjectTableWrap,
  EmptyProjectNote,
  SectionTitle,
  StatusBadge,
  TableCell,
  TableHeader,
  TableRow,
  TextLink,
} from "./page-style";
import { CreateProjectModal } from "../apply/project-selector";
import { addStoredProject, getStoredProjects } from "../apply/project-storage";
import { EmailVerificationModal } from "../apply/email-verification-modal";
import {
  ProjectDeleteModal,
  ProjectNameEditModal,
  ApiKeySuccessModal,
  ReissueConfirmModal,
} from "./mypage-modal";

type Status = "approved" | "pending" | "rejected";

interface Area {
  name: string;
  description: string;
  status: Status;
  api: string;
  appliedAt: string;
}

interface Project {
  name: string;
  apiKey: string;
  issuedAt: string;
  expiresAt: string;
  areas: Area[];
}

const DEFAULT_PROJECT: Project = {
  name: "team-xquare",
  apiKey: "xq_test_8f3a••••a0c9",
  issuedAt: "2026-10-21 14:32",
  expiresAt: "2026-12-20 (30일 남음)",
  areas: [
    {
      name: "동아리",
      description: "중간 · 조회 API 2개",
      status: "approved",
      api: "GET /clubs · GET /clubs/{clubId}",
      appliedAt: "2026-10-21 14:32",
    },
    {
      name: "일정",
      description: "중간 · 일정 조회 1개",
      status: "approved",
      api: "학교 통합 일정 조회",
      appliedAt: "2026-11-03 09:12",
    },
    {
      name: "학생",
      description: "제한 · 조회 API 2개",
      status: "pending",
      api: "GET /students · GET /students/{studentId}",
      appliedAt: "2026-11-19 16:40",
    },
  ],
};

const STATUS_LABELS: Record<Status, string> = {
  approved: "승인 완료",
  pending: "승인 대기",
  rejected: "반려",
};

export default function MyPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [reissueProject, setReissueProject] = useState<Project | null>(null);
  const [reissueVerificationProject, setReissueVerificationProject] =
    useState<Project | null>(null);
  const [reissuedProject, setReissuedProject] = useState<Project | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const firstProjectName = getStoredProjects()[0] ?? DEFAULT_PROJECT.name;
      setProjects([{ ...DEFAULT_PROJECT, name: firstProjectName }]);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <MyPageContainer>
      <PageHeader>
        <PageTitle>마이페이지</PageTitle>
        <PageLead>전재준 · jaejun0210</PageLead>
      </PageHeader>

      <section aria-labelledby="account-title">
        <SectionTitle id="account-title">계정 정보</SectionTitle>
        <AccountDetails>
          <AccountRow>
            <dt>아이디</dt>
            <dd>jaejun0210</dd>
          </AccountRow>
          <AccountRow>
            <dt>이름</dt>
            <dd>전재준</dd>
          </AccountRow>
          <AccountRow>
            <dt>학교 이메일</dt>
            <dd>jaejun0210@dsm.hs.kr</dd>
          </AccountRow>
          <AccountRow>
            <dt>권한</dt>
            <dd>USER</dd>
          </AccountRow>
        </AccountDetails>
      </section>

      <ProjectArea>
        <section aria-labelledby="projects-title">
          <ProjectStack>
            <ProjectSectionHeader>
              <SectionTitle id="projects-title">
                내 프로젝트 {projects.length}개
              </SectionTitle>
              <CardActions>
                {projects.length > 0 && (
                  <ActionButton type="button">키 갱신</ActionButton>
                )}
                <AddProjectButton
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                >
                  + 프로젝트 만들기
                </AddProjectButton>
              </CardActions>
            </ProjectSectionHeader>

            {projects.length === 0 && (
              <EmptyProjectNote>
                아직 프로젝트가 없습니다. 위의 [+ 프로젝트 만들기]로 프로젝트를
                먼저 만들고, 프로젝트에서 [분야 추가]로 쓸 분야를 신청하세요.
                분야가 처음 승인되면 그 프로젝트의 API 키가 발급됩니다.
              </EmptyProjectNote>
            )}

            <ProjectList>
              {projects.map((project) => (
                <ProjectCard key={project.name}>
                  <ProjectCardHeader>
                    <ProjectName>
                      {project.name}{" "}
                      <ProjectNameEdit
                        href="#"
                        onClick={(event) => {
                          event.preventDefault();
                          setEditingProject(project.name);
                        }}
                      >
                        이름 수정
                      </ProjectNameEdit>
                    </ProjectName>
                    <CardActions>
                      <ActionButton type="button">분야 추가</ActionButton>
                      {project.apiKey && (
                        <ActionButton
                          type="button"
                          onClick={() => setReissueProject(project)}
                        >
                          키 재발급
                        </ActionButton>
                      )}
                      <DangerButton
                        type="button"
                        onClick={() => setDeletingProject(project)}
                      >
                        프로젝트 삭제
                      </DangerButton>
                    </CardActions>
                  </ProjectCardHeader>

                  <ProjectMeta>
                    <FieldMeta>
                      <dt>API 키</dt>
                      <dd>
                        {project.apiKey ? (
                          <ApiKeyCell>{project.apiKey}</ApiKeyCell>
                        ) : (
                          "아직 없음 — 분야가 처음 승인되면 발급됩니다"
                        )}
                      </dd>
                    </FieldMeta>
                    {project.apiKey && (
                      <>
                        <FieldMeta>
                          <dt>발급일</dt>
                          <dd>{project.issuedAt}</dd>
                        </FieldMeta>
                        <FieldMeta>
                          <dt>만료일</dt>
                          <dd>{project.expiresAt}</dd>
                        </FieldMeta>
                      </>
                    )}
                  </ProjectMeta>

                  {project.areas.length > 0 && (
                    <ProjectTableWrap>
                      <ProjectTable>
                        <thead>
                          <TableRow>
                            <TableHeader>분야</TableHeader>
                            <TableHeader>상태</TableHeader>
                            <TableHeader>호출할 수 있는 API</TableHeader>
                            <TableHeader>신청일시</TableHeader>
                            <TableHeader>관리</TableHeader>
                          </TableRow>
                        </thead>
                        <tbody>
                          {project.areas.map((area) => (
                            <TableRow key={area.name}>
                              <TableCell>
                                <strong>{area.name}</strong>
                                <InfoText
                                  $rejected={area.status === "rejected"}
                                >
                                  {area.status === "rejected"
                                    ? "반려 · 사용 목적 보완 필요"
                                    : area.description}
                                </InfoText>
                              </TableCell>
                              <TableCell>
                                <StatusBadge $status={area.status}>
                                  {STATUS_LABELS[area.status]}
                                </StatusBadge>
                              </TableCell>
                              <TableCell>
                                <code>{area.api}</code>
                              </TableCell>
                              <TableCell>{area.appliedAt}</TableCell>
                              <TableCell>
                                {area.status === "approved" ? (
                                  <TextLink href="/api-test">
                                    API 테스트
                                  </TextLink>
                                ) : area.status === "pending" ? (
                                  <TextLink href="#">신청 취소</TextLink>
                                ) : (
                                  <TextLink href="#">다시 신청</TextLink>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </tbody>
                      </ProjectTable>
                    </ProjectTableWrap>
                  )}
                  {project.areas.length === 0 && (
                    <EmptyProjectNote>
                      아직 신청한 분야가 없습니다. 오른쪽 위 [분야 추가]로 이
                      프로젝트에서 쓸 분야를 신청하세요.
                    </EmptyProjectNote>
                  )}
                </ProjectCard>
              ))}
            </ProjectList>
          </ProjectStack>
        </section>

        {isCreateOpen && (
          <CreateProjectModal
            onClose={() => setIsCreateOpen(false)}
            onCreate={(name) => {
              addStoredProject(name);
              setProjects((current) => [
                { name, apiKey: "", issuedAt: "", expiresAt: "", areas: [] },
                ...current,
              ]);
            }}
          />
        )}

        {editingProject && (
          <ProjectNameEditModal
            projectName={editingProject}
            onClose={() => setEditingProject(null)}
            onSave={(name) => {
              setProjects((current) =>
                current.map((project) =>
                  project.name === editingProject
                    ? { ...project, name }
                    : project,
                ),
              );
            }}
          />
        )}

        {deletingProject && (
          <ProjectDeleteModal
            projectName={deletingProject.name}
            apiKey={deletingProject.apiKey}
            areas={deletingProject.areas.map((area) => area.name)}
            onClose={() => setDeletingProject(null)}
            onDelete={() => {
              setProjects((current) =>
                current.filter(
                  (project) => project.name !== deletingProject.name,
                ),
              );
              setDeletingProject(null);
            }}
          />
        )}

        {reissueProject && (
          <ReissueConfirmModal
            projectName={reissueProject.name}
            apiKey={reissueProject.apiKey}
            onClose={() => setReissueProject(null)}
            onConfirm={() => {
              setReissueVerificationProject(reissueProject);
              setReissueProject(null);
            }}
          />
        )}

        {reissueVerificationProject && (
          <EmailVerificationModal
            category="restricted"
            mode="reissue"
            projectName={reissueVerificationProject.name}
            onClose={() => setReissueVerificationProject(null)}
            onVerify={() => {
              setReissuedProject(reissueVerificationProject);
              setReissueVerificationProject(null);
            }}
          />
        )}

        {reissuedProject && (
          <ApiKeySuccessModal
            projectName={reissuedProject.name}
            areas={reissuedProject.areas.map((area) => area.name)}
            onClose={() => setReissuedProject(null)}
          />
        )}

        {projects.length > 0 && (
          <PageNotes>
            <InfoText $noMargin>
              API 키는 프로젝트마다 하나이며, 발급할 때 한 번만 전체가
              표시됩니다. 유효기간은 60일입니다. [키 갱신]을 누르고 학교 이메일
              인증을 한 번 하면 모든 키의 만료일이 오늘부터 60일로 늘어나고, 키
              값은 그대로입니다. 재발급하면 프로젝트의 키 값이 바뀌며, 새로
              신청한 그 프로젝트의 키만 재발급됩니다.
            </InfoText>
            <InfoText $noMargin>
              프로젝트마다 [분야 추가]로 다른 분야를 신청할 수 있습니다. 중간
              분야는 바로 쓸 수 있고, 제한 분야는 관리자가 승인한 뒤에 쓸 수
              있습니다. 반려되면 사유를 확인하고 다시 신청하세요.
            </InfoText>
          </PageNotes>
        )}
      </ProjectArea>
    </MyPageContainer>
  );
}
