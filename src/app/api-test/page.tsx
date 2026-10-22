"use client";

import { useState } from "react";
import {
  DEFAULT_REQUEST,
  HTTP_METHODS,
  type HttpMethod,
} from "../api-test-content";
import {
  ApiTestContainer,
  ApiTestHeader,
  ApiTestLead,
  ApiTestTitle,
  MethodSelect,
  MethodSelectWrap,
  RequestBar,
  SendButton,
  UrlInput,
} from "./page-style";

export default function ApiTestPage() {
  const [method, setMethod] = useState(DEFAULT_REQUEST.method);
  const [url, setUrl] = useState(DEFAULT_REQUEST.url);

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
    </ApiTestContainer>
  );
}
