"use client";

import { useId, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@xquare/api";
import { api } from "@/lib/api";
import { AuthLayout } from "../../components/auth-layout/auth-layout";
import {
  LoginButton,
  LoginError,
  LoginField,
  LoginForm,
  LoginInput,
  LoginLabel,
  LoginNote,
  LoginTitle,
} from "./page-style";

export default function AdminLoginPage() {
  const router = useRouter();
  const id = useId();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // 진행 중인 로그인 요청. 화면을 떠나면 취소해서 다른 화면을 홈으로 덮어쓰지 않게 함
  const attemptRef = useRef<AbortController | null>(null);

  // 다른 페이지로 이동해도 화면이 숨겨진 채 상태가 남으므로,
  // 다시 들어오면 빈 폼이 되도록 숨겨질 때 입력값을 비움
  useLayoutEffect(() => {
    return () => {
      attemptRef.current?.abort();
      attemptRef.current = null;
      setUsername("");
      setPassword("");
      setError("");
      setSubmitting(false);
    };
  }, []);

  const canSubmit = username.trim() !== "" && password !== "" && !submitting;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    const attempt = new AbortController();
    attemptRef.current = attempt;
    setSubmitting(true);
    setError("");
    try {
      // ADMIN 권한 확인과 권한 없음(403) 이동은 OPN-78에서 붙임
      await api.auth.login(
        { username: username.trim(), password },
        { signal: attempt.signal },
      );
      if (!attempt.signal.aborted) router.push("/");
    } catch (loginError) {
      if (attempt.signal.aborted) return;
      setError(
        loginError instanceof ApiError
          ? loginError.message
          : "로그인하지 못했습니다. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      if (attemptRef.current === attempt) {
        attemptRef.current = null;
        setSubmitting(false);
      }
    }
  };

  return (
    <AuthLayout>
      <LoginForm
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-note`}
        onSubmit={handleSubmit}
      >
        <LoginTitle id={`${id}-title`}>관리자 로그인</LoginTitle>

        <LoginField>
          <LoginLabel htmlFor={`${id}-username`}>아이디</LoginLabel>
          <LoginInput
            id={`${id}-username`}
            value={username}
            placeholder="아이디를 입력하세요"
            autoComplete="username"
            required
            disabled={submitting}
            onChange={(event) => {
              setUsername(event.target.value);
              setError("");
            }}
          />
        </LoginField>

        <LoginField>
          <LoginLabel htmlFor={`${id}-password`}>비밀번호</LoginLabel>
          <LoginInput
            id={`${id}-password`}
            type="password"
            value={password}
            placeholder="비밀번호를 입력하세요"
            autoComplete="current-password"
            required
            disabled={submitting}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
            }}
          />
        </LoginField>

        {error && (
          <LoginError id={`${id}-error`} role="alert">
            {error}
          </LoginError>
        )}

        <LoginButton type="submit" disabled={!canSubmit}>
          {submitting ? "로그인 중..." : "로그인"}
        </LoginButton>

        <LoginNote id={`${id}-note`}>
          <p>ADMIN 권한이 있는 계정만 로그인할 수 있습니다.</p>
          <p>5회 실패하면 계정이 잠깁니다.</p>
        </LoginNote>
      </LoginForm>
    </AuthLayout>
  );
}
