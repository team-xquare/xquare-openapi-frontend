"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_REQUEST,
  HTTP_METHODS,
  QUERY_FIELDS,
  type ApiResponse,
  type CallHistoryItem,
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
  CancelButton,
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
// 서버가 이 시간 안에 응답하지 않으면 요청을 멈춤
const REQUEST_TIMEOUT_MS = 30000;

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
  const base = queryIndex === -1 ? beforeHash : beforeHash.slice(0, queryIndex);
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

// 키를 입력하지 않았으면 X-API-KEY 헤더는 보내지 않음
function getHeaders(apiKey: string, hasBody: boolean) {
  return [
    ...(apiKey ? [`X-API-KEY: ${apiKey}`] : []),
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

// JSON이면 보기 좋게 들여쓰고, 아니면 받은 글자 그대로 보여줌
function formatBody(text: string) {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

function formatSize(bytes: number) {
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
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
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [history, setHistory] = useState<CallHistoryItem[]>([]);
  const [isSending, setIsSending] = useState(false);
  // 지금 진행 중인 요청 (취소·시간 초과·화면 이동 때 멈추고, 늦게 온 이전 응답을 가려내는 데 씀)
  const abortRef = useRef<AbortController | null>(null);

  // 화면을 떠나면 진행 중인 요청을 멈추고 이후 상태 변경은 무시
  useEffect(
    () => () => {
      abortRef.current?.abort();
      abortRef.current = null;
    },
    [],
  );

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

  // 보내는 요청에 사용자가 입력한 값만 담기 위해 공용 api 클라이언트 대신 fetch를 씀
  const handleSend = async () => {
    const target = parseUrl(url.trim());
    if (!target || isSending) return;

    const failure = (errorLabel: string, errorMessage: string, startedAt = 0) =>
      ({
        status: 0,
        statusText: "",
        duration: startedAt ? Math.round(performance.now() - startedAt) : 0,
        size: 0,
        body: "",
        headers: [],
        errorMessage,
        errorLabel,
      }) satisfies ApiResponse;

    const requestHeaders: Record<string, string> = {};
    if (apiKey) requestHeaders["X-API-KEY"] = apiKey;
    if (requestBody) requestHeaders["Content-Type"] = "application/json";

    // 한글·줄바꿈처럼 헤더에 쓸 수 없는 값은 보내기 전에 걸러 냄 (네트워크 오류와 구분)
    let fetchHeaders: Headers;
    try {
      fetchHeaders = new Headers(requestHeaders);
    } catch {
      setResponse(
        failure(
          "입력 오류",
          "API 키에 쓸 수 없는 문자가 있습니다. 한글이나 줄바꿈이 섞이지 않았는지 확인해주세요.",
        ),
      );
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    let isTimedOut = false;
    const timer = setTimeout(() => {
      isTimedOut = true;
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    setIsSending(true);
    const startedAt = performance.now();
    let result: ApiResponse;
    try {
      const res = await fetch(target.href, {
        method,
        headers: fetchHeaders,
        body: requestBody || undefined,
        credentials: "omit",
        signal: controller.signal,
      });
      const text = await res.text();
      const resHeaders: string[] = [];
      res.headers.forEach((value, key) => resHeaders.push(`${key}: ${value}`));
      result = {
        status: res.status,
        statusText: res.statusText,
        duration: Math.round(performance.now() - startedAt),
        size: new TextEncoder().encode(text).length,
        body: formatBody(text),
        headers: resHeaders,
      };
    } catch {
      if (isTimedOut) {
        result = failure(
          "시간 초과",
          `서버가 ${REQUEST_TIMEOUT_MS / 1000}초 안에 응답하지 않았습니다. 잠시 후 다시 시도해주세요.`,
          startedAt,
        );
      } else if (controller.signal.aborted) {
        result = failure("취소됨", "요청을 취소했습니다.", startedAt);
      } else {
        result = failure(
          "연결 실패",
          "서버에 연결하지 못했습니다. 네트워크 상태나 URL을 확인해주세요. 서버가 이 주소의 요청(CORS)을 허용하지 않을 수도 있습니다.",
          startedAt,
        );
      }
    } finally {
      clearTimeout(timer);
    }

    // 화면을 떠났거나 다른 요청으로 바뀌었으면 이 결과는 버림
    if (abortRef.current !== controller) return;
    abortRef.current = null;

    setResponse(result);
    setHistory((prev) =>
      [
        {
          id: `${Date.now()}`,
          method,
          path: `${target.pathname}${target.search}`,
          status: result.status,
          calledAt: new Date().toLocaleTimeString("ko-KR", { hour12: false }),
        },
        ...prev,
      ].slice(0, 20),
    );
    setIsSending(false);
  };

  // cURL 탭은 오류여도 cURL을 보여줌
  const responseText = !response
    ? "아직 보낸 요청이 없습니다. 보내기를 눌러 응답을 확인하세요."
    : responseTab === "cURL"
      ? curlLines.join("\n")
      : response.errorMessage
        ? response.errorMessage
        : responseTab === "Headers"
          ? response.headers.join("\n")
          : response.body || "(본문 없음)";

  const copyText = (text: string) => {
    // 권한이 없거나 보안 컨텍스트가 아니면 복사를 건너뜀
    navigator.clipboard?.writeText(text).catch(() => {});
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
        <SendButton
          type="button"
          disabled={!parsedUrl || isSending}
          onClick={handleSend}
        >
          {isSending ? "보내는 중" : "보내기"}
        </SendButton>
        {isSending && (
          <CancelButton type="button" onClick={() => abortRef.current?.abort()}>
            취소
          </CancelButton>
        )}
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
                프로젝트에서 활용신청해 승인된 분야의 API만 호출할 수 있고, 공개
                API(급식 등)는 키 없이 호출할 수 있습니다.
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
              {response && (
                <>
                  <Chip
                    tone={
                      response.status >= 200 && response.status < 300
                        ? "green"
                        : "red"
                    }
                  >
                    {response.status === 0
                      ? (response.errorLabel ?? "연결 실패")
                      : `${response.status} ${response.statusText}`.trim()}
                  </Chip>
                  <ResponseMeta>
                    {response.duration} ms · {formatSize(response.size)}
                  </ResponseMeta>
                </>
              )}
            </CardHead>
            <CardBody>
              <Tabs
                label="응답 항목"
                tabs={RESPONSE_TABS}
                selected={responseTab}
                onSelect={setResponseTab}
              />
              <ResponseCodePanel>{responseText}</ResponseCodePanel>
              <ActionList>
                <ActionButton
                  type="button"
                  disabled={!response?.body}
                  onClick={() => copyText(response?.body ?? "")}
                >
                  응답 복사
                </ActionButton>
                <ActionButton
                  type="button"
                  onClick={() => copyText(copyCurlLines.join("\n"))}
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
                {history.length === 0 && (
                  <FieldHint>아직 보낸 요청이 없습니다.</FieldHint>
                )}
                {history.map((item) => (
                  <HistoryItem key={item.id}>
                    <Chip tone={item.method === "POST" ? "purple" : "blue"}>
                      {item.method}
                    </Chip>
                    <HistoryPath>{item.path}</HistoryPath>
                    <HistoryStatus
                      isError={item.status === 0 || item.status >= 400}
                    >
                      {item.status === 0 ? "실패" : item.status}
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
