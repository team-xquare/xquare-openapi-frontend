"use client";

import { useEffect, useRef, useState } from "react";
import {
  ModalDialog,
  ModalTitle,
  PrimaryButton,
  SecondaryButton,
} from "../../components/modal/modal-style";
import {
  ProjectCheck,
  ProjectChevron,
  ProjectMenu,
  ProjectOption,
  ProjectOptionDescription,
  ProjectOptionName,
  ProjectSelectorWrap,
  ProjectTrigger,
  ProjectTriggerName,
} from "./project-selector-style";
import styled from "@emotion/styled";
import { Xquare_colors } from "../../styles/colors";
import { addStoredProject, getStoredProjects } from "./project-storage";

interface ProjectSelectorProps {
  value: string;
  onChange: (value: string) => void;
  onCreated?: () => void;
}

interface ProjectOptionData {
  name: string;
  description: string;
}

const PROJECTS: ProjectOptionData[] = [
  { name: "team-xquare", description: "키 있음 · 동아리, 일정" },
  { name: "dsm-timetable", description: "키 있음 · 일정" },
] as const;

const CreateProjectInput = styled.input`
  border: 1px solid ${Xquare_colors.slate[400]};
  border-radius: 8px;
  color: ${Xquare_colors.slate[900]};
  font: inherit;
  font-size: 16px;
  outline: none;
  padding: 12px 14px;
  width: 100%;

  &:focus {
    border-color: ${Xquare_colors.blue[500]};
  }

  &::placeholder {
    color: ${Xquare_colors.slate[400]};
  }
`;

const CreateProjectDescription = styled.p`
  color: ${Xquare_colors.gray[600]};
  font-size: 14px;
  line-height: 1.45;
  margin: 12px 0 0;
  text-align: left;
`;

const CreateProjectActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-start;
  margin-top: 24px;
`;

export function CreateProjectModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <ModalDialog
      ref={dialogRef}
      onClose={(event) => {
        if (event.currentTarget.returnValue === "create" && name.trim()) {
          onCreate(name.trim());
        }
        onClose();
      }}
      aria-labelledby="create-project-title"
    >
      <ModalTitle id="create-project-title">새 프로젝트 만들기</ModalTitle>
      <CreateProjectInput
        autoFocus
        aria-label="프로젝트 이름"
        placeholder="프로젝트 이름 (예: dsm-dorm)"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <CreateProjectDescription>
        이름을 정하면 빈 프로젝트가 만들어집니다. 만든 뒤 [분야 추가]로 쓸
        분야를 신청하고, 처음 승인될 때 이 프로젝트의 API 키가 발급됩니다.
      </CreateProjectDescription>
      <CreateProjectActions>
        <PrimaryButton
          type="button"
          disabled={!name.trim()}
          onClick={() => dialogRef.current?.close("create")}
        >
          만들기
        </PrimaryButton>
        <SecondaryButton
          type="button"
          onClick={() => dialogRef.current?.close("cancel")}
        >
          취소
        </SecondaryButton>
      </CreateProjectActions>
    </ModalDialog>
  );
}

export function ProjectSelector({
  value,
  onChange,
  onCreated,
}: ProjectSelectorProps) {
  const [open, setOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [projects, setProjects] = useState([...PROJECTS]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedProjects = getStoredProjects();
      setProjects((current) => [
        ...current,
        ...storedProjects
          .filter((name) => !current.some((project) => project.name === name))
          .map((name) => ({ name, description: "키 없음 · 분야 신청 필요" })),
      ]);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <ProjectSelectorWrap>
        <ProjectTrigger
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          <ProjectTriggerName>{value}</ProjectTriggerName>
          <ProjectChevron open={open}>▾</ProjectChevron>
        </ProjectTrigger>
        {open && (
          <ProjectMenu role="listbox" aria-label="프로젝트 목록">
            {projects.map((project) => (
              <ProjectOption
                key={project.name}
                type="button"
                role="option"
                aria-selected={value === project.name}
                selected={value === project.name}
                onClick={() => {
                  onChange(project.name);
                  setOpen(false);
                }}
              >
                <ProjectOptionName>
                  {project.name}
                  {value === project.name && <ProjectCheck>✓</ProjectCheck>}
                </ProjectOptionName>
                <ProjectOptionDescription>
                  {project.description}
                </ProjectOptionDescription>
              </ProjectOption>
            ))}
            <ProjectOption
              type="button"
              onClick={() => {
                setOpen(false);
                setIsCreateOpen(true);
              }}
            >
              <ProjectOptionName>+ 새 프로젝트 만들기</ProjectOptionName>
              <ProjectOptionDescription>
                이름을 정하면 승인될 때 새 키가 발급됩니다
              </ProjectOptionDescription>
            </ProjectOption>
          </ProjectMenu>
        )}
      </ProjectSelectorWrap>
      {isCreateOpen && (
        <CreateProjectModal
          onClose={() => setIsCreateOpen(false)}
          onCreate={(name) => {
            addStoredProject(name);
            setProjects((current) =>
              current.some((project) => project.name === name)
                ? current
                : [
                    ...current,
                    { name, description: "키 없음 · 분야 신청 필요" },
                  ],
            );
            onChange(name);
            onCreated?.();
          }}
        />
      )}
    </>
  );
}
