"use client";

import { useState } from "react";
import {
  DEFAULT_REQUEST,
  HTTP_METHODS,
  type HttpMethod,
} from "../api-test-content";
import {
  ApiTestColumns,
  ApiTestContainer,
  ApiTestHeader,
  ApiTestLead,
  ApiTestPanel,
  ApiTestTitle,
  Card,
  CardBody,
  CardHead,
  CodePanel,
  Field,
  FieldHint,
  FieldLabel,
  FillCard,
  MethodSelect,
  MethodSelectWrap,
  RequestBar,
  SendButton,
  TabButton,
  TabList,
  TextInput,
  UrlInput,
} from "./page-style";

const REQUEST_TABS = ["Params", "Headers", "Body"];

function getQueryLines(url: string) {
  try {
    const params = Array.from(new URL(url).searchParams);
    if (params.length === 0) return ["쿼리 파라미터가 없습니다."];
    return params.map(([key, value]) => `${key}=${value}`);
  } catch {
    return ["올바른 URL을 입력해주세요."];
  }
}

function Tabs({
  label,
  tabs,
  selected,
  onSelect,
}: {
  label: string;
  tabs: string[];
  selected: string;
  onSelect: (tab: string) => void;
}) {
  return (
    <TabList role="group" aria-label={label}>
      {tabs.map((tab) => (
        <TabButton
          key={tab}
          type="button"
          aria-pressed={tab === selected}
          onClick={() => onSelect(tab)}
        >
          {tab}
        </TabButton>
      ))}
    </TabList>
  );
}

export default function ApiTestPage() {
  const [method, setMethod] = useState(DEFAULT_REQUEST.method);
  const [url, setUrl] = useState(DEFAULT_REQUEST.url);
  const [apiKey, setApiKey] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [requestTab, setRequestTab] = useState("Body");

  const hasBody = method !== "GET";
  const maskedPassword = "•".repeat(password.length);
  const headers = [
    `X-API-KEY: ${apiKey}`,
    ...(hasBody ? ["Content-Type: application/json"] : []),
  ];

  const bodyLines = [
    "{",
    `  "username": ${JSON.stringify(username)},`,
    `  "password": ${JSON.stringify(maskedPassword)}`,
    "}",
  ];

  return (
    <ApiTestContainer>
      <ApiTestHeader>
        <ApiTestTitle>API 테스트</ApiTestTitle>
        <ApiTestLead>
          발급받은 키로 실제 요청을 보내보고 응답을 바로 확인할 수 있습니다.
        </ApiTestLead>
      </ApiTestHeader>

      <RequestBar>
        <MethodSelectWrap>
          <MethodSelect
            aria-label="HTTP 메서드"
            value={method}
            onChange={(event) => setMethod(event.target.value as HttpMethod)}
          >
            {HTTP_METHODS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </MethodSelect>
        </MethodSelectWrap>
        <UrlInput
          type="url"
          aria-label="요청 URL"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
        />
        <SendButton type="button">보내기</SendButton>
      </RequestBar>

      <ApiTestColumns>
        <ApiTestPanel>
          <Card aria-labelledby="api-test-auth">
            <CardHead>
              <h2 id="api-test-auth">인증</h2>
            </CardHead>
            <CardBody>
              <Field>
                <FieldLabel>X-API-KEY</FieldLabel>
                <TextInput
                  value={apiKey}
                  placeholder="발급받은 API 키를 입력하세요"
                  autoComplete="off"
                  onChange={(event) => setApiKey(event.target.value)}
                />
              </Field>
              <FieldHint>
                키는 브라우저에만 저장되며 서버로 전송되지 않습니다.
              </FieldHint>
            </CardBody>
          </Card>

          <FillCard aria-labelledby="api-test-request">
            <CardHead>
              <h2 id="api-test-request">요청</h2>
            </CardHead>
            <CardBody>
              <Tabs
                label="요청 항목"
                tabs={REQUEST_TABS}
                selected={requestTab}
                onSelect={setRequestTab}
              />
              {requestTab === "Params" && (
                <CodePanel>{getQueryLines(url).join("\n")}</CodePanel>
              )}
              {requestTab === "Headers" && (
                <CodePanel>{headers.join("\n")}</CodePanel>
              )}
              {requestTab === "Body" && (
                <>
                  <Field>
                    <FieldLabel>username</FieldLabel>
                    <TextInput
                      value={username}
                      placeholder="로그인 아이디 입력"
                      autoComplete="off"
                      onChange={(event) => setUsername(event.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>password</FieldLabel>
                    <TextInput
                      type="password"
                      value={password}
                      placeholder="비밀번호 입력"
                      autoComplete="new-password"
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </Field>
                  <CodePanel>{bodyLines.join("\n")}</CodePanel>
                </>
              )}
            </CardBody>
          </FillCard>
        </ApiTestPanel>
      </ApiTestColumns>
    </ApiTestContainer>
  );
}
