"use client";

import { useId, useLayoutEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "../../components/auth-layout/auth-layout";
import {
  LoginButton,
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

  // 다른 페이지로 이동해도 화면이 숨겨진 채 상태가 남으므로,
  // 다시 들어오면 빈 폼이 되도록 숨겨질 때 입력값을 비움
  useLayoutEffect(() => {
    return () => {
      setUsername("");
      setPassword("");
    };
  }, []);

  const canSubmit = username.trim() !== "" && password !== "";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    // 로그인 API 연동 전이라 입력만 확인하고 홈으로 이동
    router.push("/");
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
            onChange={(event) => setUsername(event.target.value)}
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
            onChange={(event) => setPassword(event.target.value)}
          />
        </LoginField>

        <LoginButton type="submit" disabled={!canSubmit}>
          로그인
        </LoginButton>

        <LoginNote id={`${id}-note`}>
          <p>ADMIN 권한이 있는 계정만 로그인할 수 있습니다.</p>
          <p>5회 실패하면 계정이 잠깁니다.</p>
        </LoginNote>
      </LoginForm>
    </AuthLayout>
  );
}
