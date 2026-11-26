"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@xquare/api";
import { api } from "@/lib/api";
import { Button_square } from "../../components/button";
import { Input_text } from "../../components/input";
import {
  AuthFormActions,
  AuthFormCard,
  AuthInputs,
  AuthLayout,
  AuthLink,
  AuthLinkButton,
  AuthLinkRow,
  AuthLiveMessage,
  AuthTitle,
} from "../../components/auth";
import { Xquare_colors } from "../../styles/colors";
import { VerifyInputWrap } from "../signup/page-style";
import {
  INITIAL_SIGNUP_FORM,
  SIGNUP_ERROR_MESSAGES,
  validateSignupForm,
  type SignupFormValues,
} from "../signup/signup-validation";

const FADE_DURATION = 180;
const ERROR_COLOR = String(Xquare_colors.red[500]);
const NOTICE_COLOR = String(Xquare_colors.gray[600]);

const DEFAULT_ERROR_MESSAGE =
  "요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.";
// 서버 메시지만으로는 왜 처음으로 돌아갔는지 알기 어려워 따로 씀
const VERIFY_EXPIRED_MESSAGE =
  "이메일 인증 시간이 지났습니다. 인증코드를 다시 받아주세요.";
const NOT_REGISTERED_MESSAGE = "가입되지 않은 이메일입니다. 회원가입 후 이용해주세요.";
const RESENT_MESSAGE = "인증코드를 다시 보냈습니다.";

type ValidatedField = "email" | "verifyCode" | "password";
// 서버 오류를 보여줄 입력칸
type ServerErrorField = keyof SignupFormValues;
type PendingAction = "send" | "resend" | "verify" | "reset";

const PENDING_LABELS: Partial<Record<PendingAction, string>> = {
  send: "발송 중...",
  verify: "검증 중...",
  reset: "변경 중...",
};

const messageOf = (error: unknown) =>
  error instanceof ApiError ? error.message : DEFAULT_ERROR_MESSAGE;

// 입력 규칙이 회원가입과 같아 폼 값과 검증을 그대로 씀 (아이디 칸은 쓰지 않음)
// 1 이메일·인증코드 → 2 새 비밀번호
export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showVerifyInput, setShowVerifyInput] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [form, setForm] = useState(INITIAL_SIGNUP_FORM);
  // 인증코드 검증으로 받은 토큰. 비밀번호 변경 요청에 같이 보냄 (서버에서 10분 동안 유효)
  const [emailVerifiedToken, setEmailVerifiedToken] = useState("");
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [serverErrors, setServerErrors] = useState<
    Partial<Record<ServerErrorField, string>>
  >({});
  const [notice, setNotice] = useState("");
  // 인증은 가입 여부와 상관없이 통과하므로 변경 요청에서야 알게 됨
  const [isNotRegistered, setIsNotRegistered] = useState(false);

  const fadeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  // 진행 중인 요청. 화면을 떠나면 취소해서 숨겨진 화면의 상태를 바꾸지 않게 함
  const attemptRef = useRef<AbortController | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const verifyCodeRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const validations = validateSignupForm(form);
  const isPending = pending !== null;

  const isNextDisabled = {
    1: !validations.email || (showVerifyInput && !validations.verifyCode),
    2: !validations.password || !validations.passwordMatch,
  }[step];

  const submitLabel =
    (pending && PENDING_LABELS[pending]) ??
    (step === 1
      ? showVerifyInput
        ? "인증코드 검증"
        : "인증코드 발송"
      : "비밀번호 변경");

  // 서버 오류를 먼저 보여주고, 없으면 입력값이 규칙에 맞지 않을 때만 형식 오류를 보여줌
  const errorFor = (key: ValidatedField) =>
    serverErrors[key] ||
    (form[key] && !validations[key] ? SIGNUP_ERROR_MESSAGES[key] : "");

  const passwordCheckError =
    serverErrors.passwordCheck ||
    (form.password && form.passwordCheck && !validations.passwordMatch
      ? SIGNUP_ERROR_MESSAGES.passwordMatch
      : "");

  const verifyCodeError = errorFor("verifyCode");

  // 스크린 리더가 바로 읽어줄 서버 오류
  const liveError =
    Object.values(serverErrors).find(Boolean) ||
    (isNotRegistered ? NOT_REGISTERED_MESSAGE : "");

  // 다른 페이지로 이동해도 화면이 숨겨진 채 상태가 남으므로,
  // 다시 들어오면 1단계부터 시작하도록 숨겨질 때 초기화
  useLayoutEffect(() => {
    return () => {
      clearTimeout(fadeTimerRef.current);
      attemptRef.current?.abort();
      attemptRef.current = null;
      setStep(1);
      setShowVerifyInput(false);
      setIsEmailVerified(false);
      setIsFading(false);
      setForm(INITIAL_SIGNUP_FORM);
      setEmailVerifiedToken("");
      setPending(null);
      setServerErrors({});
      setNotice("");
      setIsNotRegistered(false);
    };
  }, []);

  useEffect(() => {
    if (isFading || isPending) return;

    const focusMap: Record<number, typeof emailRef> = {
      1: showVerifyInput ? verifyCodeRef : emailRef,
      2: passwordRef,
    };

    focusMap[step]?.current?.focus();
  }, [step, isFading, isPending, showVerifyInput]);

  const clearServerError = (key: ServerErrorField) => {
    setServerErrors((prev) => {
      if (!prev[key] && !prev.passwordCheck) return prev;
      // 마지막 칸의 오류는 어느 칸을 고쳐도 지움
      const next = { ...prev };
      delete next[key];
      delete next.passwordCheck;
      return next;
    });
  };

  const handleChange =
    (key: keyof SignupFormValues) => (event: ChangeEvent<HTMLInputElement>) => {
      // 요청 중에는 보낸 값과 화면 값이 달라지지 않게 입력을 무시함 (포커스는 그대로 둠)
      if (isPending) return;
      const value = event.target.value;

      if (key === "email") {
        setShowVerifyInput(false);
        setIsEmailVerified(false);
        setEmailVerifiedToken("");
      }

      clearServerError(key);
      if (key === "verifyCode") setNotice("");

      setForm((prev) => ({
        ...prev,
        [key]: value,
        ...(key === "email" ? { verifyCode: "" } : {}),
      }));
    };

  const changeStepSmooth = (nextStep: number) => {
    setIsFading(true);

    fadeTimerRef.current = setTimeout(() => {
      setStep(nextStep);
      setIsFading(false);
    }, FADE_DURATION);
  };

  // 요청 하나를 보내는 동안 버튼과 입력을 막고, 화면을 떠나 취소되면 결과를 버림
  // task가 true를 돌려주면 (변경 성공 뒤 이동 중) 잠근 채로 둠. 숨겨질 때 초기화에서 풀림
  const runAttempt = async (
    action: PendingAction,
    task: (signal: AbortSignal) => Promise<boolean | void>,
    onError: (error: unknown) => void,
  ) => {
    const attempt = new AbortController();
    attemptRef.current = attempt;
    setPending(action);
    let keepLocked = false;
    try {
      keepLocked = (await task(attempt.signal)) === true;
    } catch (error) {
      if (!attempt.signal.aborted) onError(error);
    } finally {
      if (attemptRef.current === attempt) {
        attemptRef.current = null;
        if (!keepLocked) setPending(null);
      }
    }
  };

  const sendCode = (action: "send" | "resend") =>
    runAttempt(
      action,
      async (signal) => {
        await api.auth.sendEmailOtp({ email: form.email }, { signal });
        if (signal.aborted) return;
        setShowVerifyInput(true);
        if (action === "resend") {
          setForm((prev) => ({ ...prev, verifyCode: "" }));
          setNotice(RESENT_MESSAGE);
        }
      },
      // 처음 보낼 때는 이메일 칸에, 다시 보낼 때는 인증코드 칸에 (너무 자주 요청 등)
      (error) =>
        setServerErrors({
          [action === "send" ? "email" : "verifyCode"]: messageOf(error),
        }),
    );

  const verifyCode = () =>
    runAttempt(
      "verify",
      async (signal) => {
        const token = await api.auth.verifyEmailOtp(
          { email: form.email, otp: form.verifyCode },
          { signal },
        );
        if (signal.aborted) return;
        setEmailVerifiedToken(token);
        setIsEmailVerified(true);
        setNotice("");
        changeStepSmooth(2);
      },
      // 코드 불일치, 만료, 입력 횟수 초과
      (error) => setServerErrors({ verifyCode: messageOf(error) }),
    );

  const resetPassword = () =>
    runAttempt(
      "reset",
      async (signal) => {
        await api.auth.resetPassword(
          { emailVerifiedToken, newPassword: form.password },
          { signal },
        );
        if (signal.aborted) return;
        // 변경만 되고 로그인되지는 않으므로 안내가 보이게 로그인 화면으로 보냄
        router.push("/login?reset=done");
        return true;
      },
      (error) => {
        // 인증 토큰이 만료됐으면 이메일 인증만 다시 받게 하고 나머지 입력값은 남김
        if (error instanceof ApiError && error.code === "EMAIL_NOT_VERIFIED") {
          setShowVerifyInput(false);
          setIsEmailVerified(false);
          setEmailVerifiedToken("");
          setForm((prev) => ({ ...prev, verifyCode: "" }));
          setServerErrors({ email: VERIFY_EXPIRED_MESSAGE });
          changeStepSmooth(1);
          return;
        }

        // 가입되지 않은 이메일은 비밀번호 확인 오류가 아니므로 따로 안내하고 입력값은 남김
        if (
          error instanceof ApiError &&
          (error.code === "USER_NOT_FOUND" || error.status === 404)
        ) {
          setIsNotRegistered(true);
          return;
        }

        setServerErrors({ passwordCheck: messageOf(error) });
      },
    );

  const handleResend = () => {
    if (isPending || isFading || isEmailVerified) return;
    setServerErrors({});
    setNotice("");
    void sendCode("resend");
  };

  const handleChangeEmail = () => {
    if (isPending || isFading || isEmailVerified) return;
    setShowVerifyInput(false);
    setForm((prev) => ({ ...prev, verifyCode: "" }));
    setServerErrors({});
    setNotice("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isNextDisabled || isFading || isPending) return;

    if (step === 1) {
      setServerErrors({});
      void (showVerifyInput ? verifyCode() : sendCode("send"));
      return;
    }

    setServerErrors({});
    setIsNotRegistered(false);
    void resetPassword();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Input_text
              ref={emailRef}
              value={form.email}
              onChange={handleChange("email")}
              label="이메일"
              placeholder="이메일을 입력해주세요"
              type="email"
              autoComplete="email"
              title={errorFor("email")}
              titleColor={ERROR_COLOR}
              disabled={showVerifyInput}
            />

            <VerifyInputWrap
              isVisible={showVerifyInput}
              inert={!showVerifyInput}
            >
              <Input_text
                ref={verifyCodeRef}
                value={form.verifyCode}
                onChange={handleChange("verifyCode")}
                label="인증코드"
                placeholder="인증코드를 입력해주세요"
                inputMode="numeric"
                autoComplete="one-time-code"
                disabled={!showVerifyInput}
                title={verifyCodeError || notice}
                titleColor={verifyCodeError ? ERROR_COLOR : NOTICE_COLOR}
              />
            </VerifyInputWrap>
          </>
        );

      case 2:
        return (
          <>
            <Input_text
              ref={passwordRef}
              value={form.password}
              onChange={handleChange("password")}
              label="새 비밀번호"
              placeholder="새로운 비밀번호를 입력해주세요"
              type="password"
              autoComplete="new-password"
              title={errorFor("password")}
              titleColor={ERROR_COLOR}
            />

            <Input_text
              value={form.passwordCheck}
              onChange={handleChange("passwordCheck")}
              label="비밀번호 확인"
              placeholder="비밀번호를 다시 입력해주세요"
              type="password"
              autoComplete="new-password"
              title={passwordCheckError}
              titleColor={ERROR_COLOR}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <AuthLayout label="비밀번호 찾기 영역">
      <AuthFormCard onSubmit={handleSubmit} aria-label="비밀번호 찾기 폼">
        <AuthTitle>Forgot Password</AuthTitle>

        {/* 사라지는 동안 입력을 막아 이전 단계 값이 바뀌지 않게 함 */}
        <AuthInputs isFading={isFading} inert={isFading}>
          {renderStep()}
        </AuthInputs>

        <AuthLiveMessage role="alert">{liveError}</AuthLiveMessage>
        {/* 재발송 같은 안내는 오류처럼 끊고 읽지 않도록 따로 둠 */}
        <AuthLiveMessage role="status">{notice}</AuthLiveMessage>

        {isNotRegistered && (
          <AuthLinkRow style={{ color: ERROR_COLOR }}>
            {NOT_REGISTERED_MESSAGE}
            <AuthLink href="/signup">회원가입</AuthLink>
          </AuthLinkRow>
        )}

        <AuthFormActions>
          <Button_square type="submit" disabled={isNextDisabled || isPending}>
            {submitLabel}
          </Button_square>

          {/* 인증코드를 보낸 뒤에는 이메일 칸이 잠기므로 다시 보내거나 이메일을 고칠 수 있게 함 */}
          {step === 1 && showVerifyInput && !isEmailVerified && (
            <>
              <AuthLinkRow>
                인증코드를 못 받으셨나요?
                <AuthLinkButton
                  type="button"
                  onClick={handleResend}
                  disabled={isPending}
                >
                  {pending === "resend" ? "보내는 중..." : "다시 보내기"}
                </AuthLinkButton>
              </AuthLinkRow>
              <AuthLinkRow>
                이메일을 잘못 입력하셨나요?
                <AuthLinkButton
                  type="button"
                  onClick={handleChangeEmail}
                  disabled={isPending}
                >
                  이메일 바꾸기
                </AuthLinkButton>
              </AuthLinkRow>
            </>
          )}

          {step === 1 && !showVerifyInput && (
            <AuthLinkRow>
              계정에 다시 로그인하시겠어요?
              <AuthLink href="/login">로그인하기</AuthLink>
            </AuthLinkRow>
          )}
        </AuthFormActions>
      </AuthFormCard>
    </AuthLayout>
  );
}
