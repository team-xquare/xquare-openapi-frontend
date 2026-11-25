"use client";

import { useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { Modal } from "../../../components/modal";
import { EmailVerificationModal } from "../email-verification-modal";
import {
  ApplyBadge,
  ApplyContainer,
  ApplyDescription,
  ApplyForm,
  ApplyHeader,
  ApplyLead,
  ApplyRestrictedBadge,
  ApplySection,
  ApplyTitle,
  CompleteButton,
  FieldInput,
  FieldLabel,
  FieldRow,
  FieldSelect,
  FieldTextarea,
  StepTitle,
  TextareaFieldRow,
} from "../page-style";

const CATEGORY_CONFIG = {
  club: {
    title: "동아리 분야 활용신청",
    description:
      "동아리 분야는 학교 구성원이 쓸 수 있는 중간 단계 API입니다. 간단한 사용 내용을 적고 이메일 인증을 하면 바로 승인되어, 동아리 조회 API 2개 (GET /clubs, GET /clubs/{clubId})를 이 프로젝트의 API 키로 호출할 수 있습니다.",
    example: "동아리 소개 앱",
    restricted: false,
  },
  schedule: {
    title: "일정 분야 활용신청",
    description:
      "일정 분야는 학교 구성원이 쓸 수 있는 중간 단계 API입니다. 간단한 사용 내용을 적고 이메일 인증을 하면 바로 승인되어, 일정 조회 API 2개 (GET /schedules, GET /schedules/{scheduleId})를 이 프로젝트의 API 키로 호출할 수 있습니다.",
    example: "학교 일정 안내 앱",
    restricted: false,
  },
  student: {
    title: "학생 분야 활용신청",
    description:
      "학생 분야는 개인정보가 들어간 제한 API입니다. 사용 목적을 적어 신청하면 관리자가 승인한 뒤, 학생 조회 API 2개 (GET /students, GET /students/{studentId})를 이 프로젝트의 API 키로 호출할 수 있습니다.",
    example: "학생 데이터 분석 서비스",
    restricted: true,
  },
  teacher: {
    title: "교직원 분야 활용신청",
    description:
      "교직원 분야는 개인정보가 들어간 제한 API입니다. 사용 목적을 적어 신청하면 관리자가 승인한 뒤, 교직원 조회 API를 이 프로젝트의 API 키로 호출할 수 있습니다.",
    example: "교직원 연락처 안내 서비스",
    restricted: true,
  },
  supervisor: {
    title: "자습감독 분야 활용신청",
    description:
      "자습감독 분야는 개인정보가 들어간 제한 API입니다. 사용 목적을 적어 신청하면 관리자가 승인한 뒤, 자습감독 조회 API를 이 프로젝트의 API 키로 호출할 수 있습니다.",
    example: "자습감독 일정 안내 서비스",
    restricted: true,
  },
} as const;

export default function IntermediateApplyPage() {
  const params = useParams<{ category: string }>();
  const router = useRouter();
  const category = params.category as keyof typeof CATEGORY_CONFIG;
  const config = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.student;
  const [project, setProject] = useState("team-xquare");
  const [purpose, setPurpose] = useState("");
  const [serviceUrl, setServiceUrl] = useState("TEST.TEST.COM");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);

  const canSubmit =
    project.trim().length > 0 &&
    purpose.trim().length > 0 &&
    serviceUrl.trim().length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    if (config.restricted) {
      setIsConfirmOpen(true);
    } else {
      setIsVerificationOpen(true);
    }
  };

  return (
    <ApplyContainer>
      <ApplyHeader>
        <ApplyTitle>{config.title}</ApplyTitle>
        {config.restricted ? (
          <ApplyRestrictedBadge>
            제한 API · 관리자 승인 필요
          </ApplyRestrictedBadge>
        ) : (
          <ApplyBadge>중간 API · 자동 승인</ApplyBadge>
        )}
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
          {config.restricted ? (
            <TextareaFieldRow>
              <FieldLabel htmlFor="usage-purpose">사용 목적 (필수)</FieldLabel>
              <FieldTextarea
                id="usage-purpose"
                rows={2}
                value={purpose}
                onChange={(event) => setPurpose(event.target.value)}
                placeholder={`누가, 무슨 목적으로 ${category === "student" ? "학생" : category === "teacher" ? "교직원" : "자습감독"} 데이터를 쓰는지 적어 주세요.`}
                required
              />
            </TextareaFieldRow>
          ) : (
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
          )}
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
      {isConfirmOpen && (
        <Modal
          title="이 내용으로 신청할까요?"
          description={
            <>
              {config.title.replace(" 활용신청", "")} · 제한 API · 프로젝트{" "}
              {project}
              <br />
              신청하기를 누르면 학교 이메일로 인증 코드를 보냅니다.
              <br />
              인증하면 신청이 접수되고, 관리자가 승인하면 이 프로젝트 키로 쓸 수
              있습니다.
            </>
          }
          confirmLabel="신청하기"
          cancelLabel="다시 확인"
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={() => {
            setIsConfirmOpen(false);
            setIsVerificationOpen(true);
          }}
        />
      )}
      {isVerificationOpen && (
        <EmailVerificationModal
          category={
            config.restricted
              ? "restricted"
              : category === "schedule"
                ? "schedule"
                : "club"
          }
          onClose={() => setIsVerificationOpen(false)}
          onVerify={() =>
            router.push(
              `/apply/success?serviceName=${encodeURIComponent(project.trim())}&category=${category}&purpose=${encodeURIComponent(purpose.trim())}&firstApproval=${String(project === "new-project")}`,
            )
          }
        />
      )}
    </ApplyContainer>
  );
}
