"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ApplyBadge,
  ApplyContainer,
  ApplyDescription,
  ApplyForm,
  ApplyHeader,
  ApplyLead,
  ApplySection,
  ApplyTitle,
  CompleteButton,
  FieldInput,
  FieldLabel,
  FieldRow,
  StepTitle,
} from "../page-style";
import { ProjectSelector } from "../project-selector";

export default function MealApplyPage() {
  const router = useRouter();
  const [project, setProject] = useState("team-xquare");
  const [serviceUrl, setServiceUrl] = useState("TEST.TEST.COM");

  const canSubmit = project.trim().length > 0 && serviceUrl.trim().length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSubmit) {
      router.push(
        `/apply/meal/success?project=${encodeURIComponent(project.trim())}&serviceUrl=${encodeURIComponent(serviceUrl.trim())}`,
      );
    }
  };

  return (
    <ApplyContainer>
      <ApplyHeader>
        <ApplyTitle>급식 분야 활용신청</ApplyTitle>
        <ApplyBadge>공개 API · 바로 사용</ApplyBadge>
        <ApplyDescription>
          급식 분야는 누구나 쓸 수 있는 공개 API입니다. 프로젝트를 고르고
          신청하면 이메일 인증이나 관리자 승인 없이 바로, 급식 조회 API 2개(GET
          /meals, GET /meals/{"{mealId}"})를 이 프로젝트의 API 키로 호출할 수
          있습니다.
        </ApplyDescription>
      </ApplyHeader>

      <ApplyForm onSubmit={handleSubmit}>
        <ApplySection aria-labelledby="project-step">
          <StepTitle id="project-step">1단계 · 프로젝트 고르기</StepTitle>
          <FieldRow>
            <FieldLabel htmlFor="project">프로젝트</FieldLabel>
            <ProjectSelector value={project} onChange={setProject} />
          </FieldRow>
          <ApplyLead>
            목록에서 이 분야를 쓸 프로젝트를 고르거나, ‘새 프로젝트 만들기’로
            이름을 정하세요. API 키는 프로젝트마다 따로 발급됩니다.
          </ApplyLead>
        </ApplySection>

        <ApplySection aria-labelledby="service-url-step">
          <StepTitle id="service-url-step">2단계 · 서비스 URL 입력</StepTitle>
          <FieldRow>
            <FieldLabel htmlFor="service-url">서비스 URL</FieldLabel>
            <FieldInput
              autoComplete="url"
              id="service-url"
              value={serviceUrl}
              onChange={(event) => setServiceUrl(event.target.value)}
              placeholder="서비스 URL을 입력해주세요."
              required
            />
          </FieldRow>
        </ApplySection>

        <CompleteButton type="submit" disabled={!canSubmit}>
          완료 <span aria-hidden="true">→</span>
        </CompleteButton>
      </ApplyForm>
    </ApplyContainer>
  );
}
