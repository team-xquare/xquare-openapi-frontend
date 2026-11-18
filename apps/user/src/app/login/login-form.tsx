"use client";

import { useLayoutEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@xquare/api";
import { api } from "@/lib/api";
import { Button_square } from "../../components/button";
import { Input_text } from "../../components/input";
import { Xquare_colors } from "../../styles/colors";
import {
  AuthFormActions,
  AuthFormCard,
  AuthInputs,
  AuthLayout,
  AuthLink,
  AuthLinkRow,
  AuthLiveMessage,
  AuthTitle,
  PasswordHelpLink,
} from "../../components/auth";

const ERROR_COLOR = String(Xquare_colors.red[500]);

// XQUARE 인프라 서비스 로그인 화면과 같은 구성
export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 다른 페이지로 이동해도 화면이 숨겨진 채 상태가 남으므로,
  // 인프라 서비스처럼 다시 들어오면 빈 폼이 되도록 숨겨질 때 입력값을 비움
  useLayoutEffect(() => {
    return () => {
      setUsername("");
      setPassword("");
      setError("");
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username.trim() || !password || submitting) return;

    setSubmitting(true);
    setError("");
    try {
      await api.auth.login({ username: username.trim(), password });
      router.push("/");
    } catch (loginError) {
      // 서버 메시지(아이디·비밀번호 불일치, 5회 실패 잠금 등)를 그대로 보여줌
      setError(
        loginError instanceof ApiError
          ? loginError.message
          : "로그인하지 못했습니다. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout label="로그인 영역">
      <AuthFormCard onSubmit={handleSubmit} aria-label="로그인 폼">
        <AuthTitle>XQUARE LOGIN</AuthTitle>

        <AuthInputs>
          <Input_text
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              setError("");
            }}
            label="아이디"
            placeholder="아이디를 입력해주세요"
            autoComplete="username"
          />
          <Input_text
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
            }}
            label="비밀번호"
            placeholder="비밀번호를 입력해주세요"
            type="password"
            autoComplete="current-password"
            title={error}
            titleColor={ERROR_COLOR}
          />
          <PasswordHelpLink href="/forgot-password">
            비밀번호 찾기
          </PasswordHelpLink>
        </AuthInputs>

        <AuthLiveMessage role="alert">{error}</AuthLiveMessage>

        <AuthFormActions>
          <Button_square
            type="submit"
            disabled={!username.trim() || !password || submitting}
          >
            {submitting ? "로그인 중..." : "로그인"}
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
