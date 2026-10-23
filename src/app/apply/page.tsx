"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ApplyConfirmModal } from "./apply-confirm-modal";
import {
  ApplyContainer,
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
} from "./page-style";

export default function ApplyPage() {
  const router = useRouter();
  const [serviceName, setServiceName] = useState("team-xquare");
  const [purpose, setPurpose] = useState("");
  const [serviceUrl, setServiceUrl] = useState("TEST.TEST.COM");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const canSubmit =
    serviceName.trim().length > 0 &&
    purpose.trim().length > 0 &&
    serviceUrl.trim().length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSubmit) setIsConfirmOpen(true);
  };

  return (
    <ApplyContainer>
      <ApplyHeader>
        <ApplyTitle>학생 정보 조회</ApplyTitle>
        <ApplyLead>학생 정보를 조회하는 api 입니다.</ApplyLead>
      </ApplyHeader>

      <ApplyForm onSubmit={handleSubmit}>
        <ApplySection aria-labelledby="applicant-step">
          <StepTitle id="applicant-step">1단계 · 신청자 정보 입력</StepTitle>
          <FieldRow>
            <FieldLabel htmlFor="service-name">서비스명</FieldLabel>
            <FieldInput
              autoComplete="organization"
              id="service-name"
              value={serviceName}
              onChange={(event) => setServiceName(event.target.value)}
              placeholder="서비스명을 입력해주세요."
              required
            />
          </FieldRow>
          <FieldRow>
            <FieldLabel htmlFor="usage-purpose">활용 목적</FieldLabel>
            <FieldInput
              id="usage-purpose"
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              placeholder="활용 목적을 입력해주세요."
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
      {isConfirmOpen && (
        <ApplyConfirmModal
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={() =>
            router.push(
              `/apply/success?serviceName=${encodeURIComponent(serviceName.trim())}`,
            )
          }
        />
      )}
    </ApplyContainer>
  );
}
