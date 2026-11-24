"use client";

import { useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { EmailVerificationModal } from "../email-verification-modal";
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
  FieldSelect,
  StepTitle,
} from "../page-style";

const CATEGORY_CONFIG = {
  club: {
    title: "동아리 분야 활용신청",
    description:
      "동아리 분야는 학교 구성원이 쓸 수 있는 중간 단계 API입니다. 간단한 사용 내용을 적고 이메일 인증을 하면 바로 승인되어, 동아리 조회 API 2개 (GET /clubs, GET /clubs/{clubId})를 이 프로젝트의 API 키로 호출할 수 있습니다.",
    example: "동아리 소개 앱",
  },
  schedule: {
    title: "일정 분야 활용신청",
    description:
      "일정 분야는 학교 구성원이 쓸 수 있는 중간 단계 API입니다. 간단한 사용 내용을 적고 이메일 인증을 하면 바로 승인되어, 일정 조회 API 2개 (GET /schedules, GET /schedules/{scheduleId})를 이 프로젝트의 API 키로 호출할 수 있습니다.",
    example: "학교 일정 안내 앱",
  },
} as const;

export default function IntermediateApplyPage() {
  const params = useParams<{ category: string }>();
  const router = useRouter();
  const category = params.category as keyof typeof CATEGORY_CONFIG;
  const config = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.club;
  const [project, setProject] = useState("team-xquare");
  const [purpose, setPurpose] = useState("");
  const [serviceUrl, setServiceUrl] = useState("TEST.TEST.COM");
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);

  const canSubmit =
    project.trim().length > 0 &&
    purpose.trim().length > 0 &&
    serviceUrl.trim().length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setIsVerificationOpen(true);
  };

  return (
    <ApplyContainer>
      <ApplyHeader>
        <ApplyTitle>{config.title}</ApplyTitle>
        <ApplyBadge>중간 API · 자동 승인</ApplyBadge>
        <ApplyDescription>{config.description}</ApplyDescription>
      </ApplyHeader>

      <ApplyForm onSubmit={handleSubmit}>
        <ApplySection aria-labelledby="project-purpose-step">
          <StepTitle id="project-purpose-step">
            1단계 · 프로젝트와 사용 목적
          </StepTitle>
          <FieldRow>
            <FieldLabel htmlFor="project">프로젝트</FieldLabel>
            <FieldSelect
              id="project"
              value={project}
              onChange={(event) => setProject(event.target.value)}
              aria-label="프로젝트 선택"
            >
              <option value="team-xquare">team-xquare</option>
              <option value="new-project">새 프로젝트 만들기</option>
            </FieldSelect>
          </FieldRow>
          <ApplyLead>
            목록에서 이 분야를 쓸 프로젝트를 고르거나, ‘새 프로젝트 만들기’로
            이름을 정하세요. API 키는 프로젝트마다 따로 발급됩니다.
          </ApplyLead>
          <FieldRow>
            <FieldLabel htmlFor="usage-purpose">사용 목적 (필수)</FieldLabel>
            <FieldInput
              id="usage-purpose"
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              placeholder={`어디에 쓰는지 간단히 적어 주세요. (예: ${config.example})`}
              required
            />
          </FieldRow>
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
      {isVerificationOpen && (
        <EmailVerificationModal
          category={category === "schedule" ? "schedule" : "club"}
          onClose={() => setIsVerificationOpen(false)}
          onVerify={() =>
            router.push(
              `/apply/success?serviceName=${encodeURIComponent(project.trim())}&category=${category}&firstApproval=${String(project === "new-project")}`,
            )
          }
        />
      )}
    </ApplyContainer>
  );
}
