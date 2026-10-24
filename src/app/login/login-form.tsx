"use client";

import { useLayoutEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button_square } from "../../components/button";
import { Input_text } from "../../components/input";
import {
  AuthFormActions,
  AuthFormCard,
  AuthInputs,
  AuthLayout,
  AuthLink,
  AuthLinkRow,
  AuthTitle,
  PasswordHelpButton,
} from "../../components/auth";

// XQUARE 인프라 서비스 로그인 화면과 같은 구성
export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // 다른 페이지로 이동해도 화면이 숨겨진 채 상태가 남으므로,
  // 인프라 서비스처럼 다시 들어오면 빈 폼이 되도록 숨겨질 때 입력값을 비움
  useLayoutEffect(() => {
    return () => {
      setUsername("");
      setPassword("");
    };
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username || !password) return;

    // 로그인 API 연동 전이라 입력만 확인하고 Overview로 이동
    router.push("/");
  };

  return (
    <AuthLayout label="로그인 영역">
      <AuthFormCard onSubmit={handleSubmit} aria-label="로그인 폼">
        <AuthTitle>XQUARE LOGIN</AuthTitle>

        <AuthInputs>
          <Input_text
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            label="아이디"
            placeholder="아이디를 입력해주세요"
            autoComplete="username"
          />
          <Input_text
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            label="비밀번호"
            placeholder="비밀번호를 입력해주세요"
            type="password"
            autoComplete="current-password"
          />
          <PasswordHelpButton
            type="button"
            disabled
            title="비밀번호 찾기 페이지 준비 중"
          >
            비밀번호 찾기
          </PasswordHelpButton>
        </AuthInputs>

        <AuthFormActions>
          <Button_square type="submit" disabled={!username || !password}>
            로그인
          </Button_square>

          <AuthLinkRow>
            XQUARE계정이 없으신가요?
            <AuthLink href="/signup">가입하기</AuthLink>
          </AuthLinkRow>
        </AuthFormActions>
      </AuthFormCard>
    </AuthLayout>
  );
}
