"use client";

import { useState } from "react";
import {
  CALL_HISTORY,
  DEFAULT_REQUEST,
  HTTP_METHODS,
  SAMPLE_RESPONSE,
  type HttpMethod,
} from "../api-test-content";
import {
  ActionButton,
  ActionList,
  ApiTestColumns,
  ApiTestContainer,
  ApiTestHeader,
  ApiTestLead,
  ApiTestPanel,
  ApiTestTitle,
  Card,
  CardBody,
  CardHead,
  Chip,
  CodePanel,
  Field,
  FieldHint,
  FieldLabel,
  FillCard,
  HistoryItem,
  HistoryList,
  HistoryPath,
  HistoryStatus,
  HistoryTime,
  MethodSelect,
  MethodSelectWrap,
  RequestBar,
  ResponseCodePanel,
  ResponseMeta,
  SendButton,
  TabButton,
  TabList,
  TextInput,
  UrlInput,
} from "./page-style";

const REQUEST_TABS = ["Params", "Headers", "Body"];
const RESPONSE_TABS = ["Body", "Headers", "cURL"];

function getQueryLines(url: string) {
  try {
    const params = Array.from(new URL(url).searchParams);
    if (params.length === 0) return ["쿼리 파라미터가 없습니다."];
    return params.map(([key, value]) => `${key}=${value}`);
  } catch {
    return ["올바른 URL을 입력해주세요."];
  }
}

// 셸에 붙여넣어도 값이 그대로 전달되도록 작은따옴표로 감쌈
function quoteShell(value: string) {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

function getCurlLines(
  method: HttpMethod,
  url: string,
  headers: string[],
  body?: string,
) {
  const lines = [
    `curl -X ${method} ${quoteShell(url)}`,
    ...headers.map((header) => `  -H ${quoteShell(header)}`),
  ];
  if (body) lines.push(`  -d ${quoteShell(body)}`);

  return lines.map((line, index) =>
    index < lines.length - 1 ? `${line} \\` : line,
  );
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
  const [responseTab, setResponseTab] = useState("Body");

  const hasBody = method !== "GET";
  const maskedPassword = "•".repeat(password.length);
  const headers = [
    `X-API-KEY: ${apiKey}`,
    ...(hasBody ? ["Content-Type: application/json"] : []),
  ];

  // 화면에는 비밀번호를 가리고, 복사할 때만 실제 값을 사용
  const bodyLines = [
    "{",
    `  "username": ${JSON.stringify(username)},`,
    `  "password": ${JSON.stringify(maskedPassword)}`,
    "}",
  ];
  const curlLines = getCurlLines(
    method,
    url,
    headers,
    hasBody
      ? JSON.stringify({ username, password: maskedPassword })
      : undefined,
  );
  const copyCurlLines = getCurlLines(
    method,
    url,
    headers,
    hasBody ? JSON.stringify({ username, password }) : undefined,
  );

  const responseLines =
    responseTab === "Headers"
      ? SAMPLE_RESPONSE.headers
      : responseTab === "cURL"
        ? curlLines
        : SAMPLE_RESPONSE.body;

  const copyLines = (lines: string[]) => {
    // 권한이 없거나 보안 컨텍스트가 아니면 복사를 건너뜀
    navigator.clipboard?.writeText(lines.join("\n")).catch(() => {});
  };

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

        <ApiTestPanel>
          <Card aria-labelledby="api-test-response">
            <CardHead>
              <h2 id="api-test-response">응답</h2>
              <Chip tone="green">{SAMPLE_RESPONSE.status}</Chip>
              <ResponseMeta>
                {SAMPLE_RESPONSE.duration} · {SAMPLE_RESPONSE.size}
              </ResponseMeta>
            </CardHead>
            <CardBody>
              <Tabs
                label="응답 항목"
                tabs={RESPONSE_TABS}
                selected={responseTab}
                onSelect={setResponseTab}
              />
              <ResponseCodePanel>{responseLines.join("\n")}</ResponseCodePanel>
              <ActionList>
                <ActionButton
                  type="button"
                  onClick={() => copyLines(SAMPLE_RESPONSE.body)}
                >
                  응답 복사
                </ActionButton>
                <ActionButton
                  type="button"
                  onClick={() => copyLines(copyCurlLines)}
                >
                  cURL 복사
                </ActionButton>
              </ActionList>
            </CardBody>
          </Card>

          <Card aria-labelledby="api-test-history">
            <CardHead>
              <h2 id="api-test-history">호출 히스토리</h2>
            </CardHead>
            <CardBody>
              <HistoryList>
                {CALL_HISTORY.map((item) => (
                  <HistoryItem key={item.id}>
                    <Chip tone={item.method === "POST" ? "purple" : "blue"}>
                      {item.method}
                    </Chip>
                    <HistoryPath>{item.path}</HistoryPath>
                    <HistoryStatus isError={item.status >= 400}>
                      {item.status}
                    </HistoryStatus>
                    <HistoryTime>{item.calledAt}</HistoryTime>
                  </HistoryItem>
                ))}
              </HistoryList>
            </CardBody>
          </Card>
        </ApiTestPanel>
      </ApiTestColumns>
    </ApiTestContainer>
  );
}
