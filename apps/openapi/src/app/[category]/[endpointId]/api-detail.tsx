"use client";

import { useId, useState, type ReactNode } from "react";
import { InfoList, type InfoListItem } from "../../../components";
import { API_LICENSE_INFO, type ApiDetail } from "../../api-detail-content";
import {
  ApiBadge,
  ApiBadgeList,
  ApiDetailBody,
  ApiDetailContainer,
  ApiDetailHeader,
  ApiDetailTitle,
  BackLink,
  BackLinkGroup,
  CodeBox,
  DetailListStack,
  DetailReport,
  DetailReportGroup,
  DetailReportTitle,
  DetailSectionContainer,
  DetailSectionTitle,
  ResponseCodeBox,
  SendButton,
  TestEndpoint,
  TestHeaders,
  TestInput,
  TestStatus,
} from "./page-style";

const LABEL_WIDTH = 160;

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const titleId = useId();

  return (
    <DetailSectionContainer aria-labelledby={titleId}>
      <DetailSectionTitle id={titleId}>{title}</DetailSectionTitle>
      {children}
    </DetailSectionContainer>
  );
}

function DetailList({ items }: { items: InfoListItem[] }) {
  return <InfoList items={items} labelWidth={LABEL_WIDTH} isLabelCentered />;
}

function Report({ title, items }: { title: string; items: InfoListItem[] }) {
  return (
    <DetailReport>
      <DetailReportTitle>{title}</DetailReportTitle>
      <DetailList items={items} />
    </DetailReport>
  );
}

export function ApiDetailView({ detail }: { detail: ApiDetail }) {
  const [apiKey, setApiKey] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const { test } = detail;

  const authItems: InfoListItem[] = [
    {
      label: "X-API-KEY",
      value: (
        <TestInput
          type="password"
          aria-label="X-API-KEY"
          value={apiKey}
          placeholder="발급받은 API 키를 입력하세요"
          autoComplete="new-password"
          onChange={(event) => setApiKey(event.target.value)}
        />
      ),
    },
  ];

  const requestItems: InfoListItem[] = [
    {
      label: "Endpoint",
      value: (
        <TestEndpoint>
          <span>{test.method}</span>
          <span>{test.url}</span>
        </TestEndpoint>
      ),
    },
    ...test.fields.map((field) => ({
      label: field.name,
      value: (
        <TestInput
          aria-label={field.name}
          value={fieldValues[field.name] ?? ""}
          placeholder={field.placeholder}
          autoComplete="off"
          onChange={(event) =>
            setFieldValues((values) => ({
              ...values,
              [field.name]: event.target.value,
            }))
          }
        />
      ),
    })),
    // 버튼은 이름 없이 값 칸에 맞춰 둠
    { label: "", value: <SendButton type="button">요청 보내기</SendButton> },
  ];

  const responseItems: InfoListItem[] = [
    { label: "Status", value: <TestStatus>{test.response.status}</TestStatus> },
    {
      label: "Headers",
      value: <TestHeaders>{test.response.headers.join("\n")}</TestHeaders>,
    },
    {
      label: "Body",
      value: <ResponseCodeBox>{test.response.body.join("\n")}</ResponseCodeBox>,
    },
  ];

  return (
    <ApiDetailContainer>
      <ApiDetailHeader>
        <ApiBadgeList>
          {detail.badges.map((badge) => (
            <ApiBadge key={badge}>{badge}</ApiBadge>
          ))}
        </ApiBadgeList>
        <ApiDetailTitle>{detail.title}</ApiDetailTitle>
      </ApiDetailHeader>

      <ApiDetailBody>
        <DetailSection title="오픈 API 정보">
          <DetailReportGroup>
            <Report title="기본 정보" items={detail.basicInfo} />
            <Report title="상세 및 제공정보" items={detail.detailInfo} />
          </DetailReportGroup>
        </DetailSection>

        <DetailSection title="이용 조건 및 라이선스 정보">
          <DetailList items={API_LICENSE_INFO} />
        </DetailSection>

        <DetailSection title="Parameters">
          <DetailList items={detail.parameters} />
        </DetailSection>

        <DetailSection title="Responses">
          <DetailListStack>
            {detail.responses.map((response) => (
              <DetailList
                key={response.code}
                items={[
                  { label: "CODE", value: response.code },
                  { label: "Description", value: response.description },
                  {
                    label: "Example",
                    value: <CodeBox>{response.example.join("\n")}</CodeBox>,
                  },
                ]}
              />
            ))}
          </DetailListStack>
        </DetailSection>

        <DetailSection title="API 테스트">
          <DetailReportGroup>
            <Report title="인증" items={authItems} />
            <Report title="요청" items={requestItems} />
            <Report title="응답" items={responseItems} />
          </DetailReportGroup>
        </DetailSection>
      </ApiDetailBody>

      <BackLinkGroup>
        <BackLink href={`/${detail.category}`}>목록으로 돌아가기</BackLink>
      </BackLinkGroup>
    </ApiDetailContainer>
  );
}
