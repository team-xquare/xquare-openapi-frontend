"use client";

import { useState } from "react";
import {
  CALL_HISTORY,
  DEFAULT_REQUEST,
  HTTP_METHODS,
  QUERY_FIELDS,
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
  BodyInput,
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

function parseUrl(url: string) {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

// URL 객체로 다시 만들면 한글·공백이 인코딩되고 주소 끝에 /가 붙으므로,
// 사용자가 쓴 나머지 부분은 그대로 두고 해당 키만 바꿈
function setQueryParam(url: string, key: string, value: string) {
  const hashIndex = url.indexOf("#");
  const hash = hashIndex === -1 ? "" : url.slice(hashIndex);
  const beforeHash = hashIndex === -1 ? url : url.slice(0, hashIndex);
  const queryIndex = beforeHash.indexOf("?");
  const base =
    queryIndex === -1 ? beforeHash : beforeHash.slice(0, queryIndex);
  const pairs =
    queryIndex === -1
      ? []
      : beforeHash
          .slice(queryIndex + 1)
          .split("&")
          .filter(Boolean);

  // 같은 키가 여러 번 있으면 첫 번째 자리만 바꾸고 나머지는 지움
  const nextPair = `${key}=${encodeURIComponent(value)}`;
  let isReplaced = false;
  const nextPairs = pairs.flatMap((pair) => {
    if (pair.split("=")[0] !== key) return [pair];
    if (!value || isReplaced) return [];
    isReplaced = true;
    return [nextPair];
  });
  if (value && !isReplaced) nextPairs.push(nextPair);

  const query = nextPairs.join("&");
  return `${base}${query ? `?${query}` : ""}${hash}`;
}

// 셸에 붙여넣어도 값이 그대로 전달되도록 작은따옴표로 감쌈
function quoteShell(value: string) {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

function getHeaders(apiKey: string, hasBody: boolean) {
  return [
    `X-API-KEY: ${apiKey}`,
    ...(hasBody ? ["Content-Type: application/json"] : []),
  ];
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
  const [body, setBody] = useState("");
  const [requestTab, setRequestTab] = useState("Params");
  const [responseTab, setResponseTab] = useState("Body");

  const hasBody = method !== "GET";
  const requestBody = hasBody ? body : undefined;
  const parsedUrl = parseUrl(url);
  const requestLine = parsedUrl
    ? `${method} ${parsedUrl.pathname}${parsedUrl.search}`
    : `${method} ${url}`;

  // 화면에는 API 키를 가리고, 복사할 때만 실제 값을 사용
  const maskedApiKey = "•".repeat(apiKey.length);
  const headers = getHeaders(maskedApiKey, Boolean(requestBody));
  const curlLines = getCurlLines(method, url, headers, requestBody);
  const copyCurlLines = getCurlLines(
    method,
    url,
    getHeaders(apiKey, Boolean(requestBody)),
    requestBody,
  );

  // 쿼리 파라미터 입력값은 URL에 바로 반영해 요청 바와 항상 같게 유지
  const handleParamChange = (key: string, value: string) => {
    if (!parsedUrl) return;
    setUrl(setQueryParam(url, key, value));
  };

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
                  type="password"
                  value={apiKey}
                  placeholder="발급받은 API 키를 입력하세요"
                  autoComplete="new-password"
                  onChange={(event) => setApiKey(event.target.value)}
                />
              </Field>
              <FieldHint>
                입력한 키는 이 요청의 헤더로만 보내고 저장하지 않습니다.
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
                <>
                  {QUERY_FIELDS.map((field) => (
                    <Field key={field.key}>
                      <FieldLabel>{field.key}</FieldLabel>
                      <TextInput
                        value={parsedUrl?.searchParams.get(field.key) ?? ""}
                        placeholder={field.placeholder}
                        autoComplete="off"
                        disabled={!parsedUrl}
                        onChange={(event) =>
                          handleParamChange(field.key, event.target.value)
                        }
                      />
                    </Field>
                  ))}
                  {!parsedUrl && (
                    <FieldHint>올바른 URL을 입력해주세요.</FieldHint>
                  )}
                  <CodePanel>{[requestLine, ...headers].join("\n")}</CodePanel>
                </>
              )}
              {requestTab === "Headers" && (
                <CodePanel>{headers.join("\n")}</CodePanel>
              )}
              {requestTab === "Body" && (
                <Field>
                  <FieldLabel>JSON</FieldLabel>
                  <BodyInput
                    value={requestBody ?? ""}
                    placeholder={
                      hasBody
                        ? '{ "key": "value" }'
                        : "GET 요청은 본문을 보내지 않습니다."
                    }
                    disabled={!hasBody}
                    spellCheck={false}
                    onChange={(event) => setBody(event.target.value)}
                  />
                </Field>
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
