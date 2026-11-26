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
import { ApiError, STORAGE_ERROR } from "@xquare/api";
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
import { VerifyInputWrap } from "./page-style";
import {
  INITIAL_SIGNUP_FORM,
  SIGNUP_ERROR_MESSAGES,
  sanitizeStudentId,
  validateSignupForm,
  type SignupFormValues,
} from "./signup-validation";

const LAST_STEP = 4;
const FADE_DURATION = 180;
const ERROR_COLOR = String(Xquare_colors.red[500]);
const NOTICE_COLOR = String(Xquare_colors.gray[600]);

const DEFAULT_ERROR_MESSAGE =
  "요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.";
// 서버 메시지("이메일 인증이 완료되지 않았습니다.")만으로는 왜 처음으로 돌아갔는지 알기 어려워 따로 씀
const VERIFY_EXPIRED_MESSAGE =
  "이메일 인증 시간이 지났습니다. 인증코드를 다시 받아주세요.";
const EMAIL_TAKEN_MESSAGE = "이미 가입된 이메일입니다. 로그인하러 가기";
const RESENT_MESSAGE = "인증코드를 다시 보냈습니다.";
// 계정은 만들어졌는데 브라우저에 로그인 정보를 저장하지 못한 경우
const SIGNED_UP_LOGIN_MESSAGE = "가입은 완료됐습니다. 로그인하러 가기";

type ValidatedField = Exclude<keyof SignupFormValues, "passwordCheck">;
// 서버 오류를 보여줄 입력칸
type ServerErrorField = ValidatedField | "passwordCheck";
type PendingAction = "send" | "resend" | "verify" | "signup";

const PENDING_LABELS: Partial<Record<PendingAction, string>> = {
  send: "발송 중...",
  verify: "검증 중...",
  signup: "가입 중...",
};

const messageOf = (error: unknown) =>
  error instanceof ApiError ? error.message : DEFAULT_ERROR_MESSAGE;

// XQUARE 인프라 서비스 회원가입과 같은 4단계 구성
// 1 이메일·인증코드 → 2 학번·이름 → 3 아이디 → 4 비밀번호
export function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showVerifyInput, setShowVerifyInput] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [form, setForm] = useState(INITIAL_SIGNUP_FORM);
  // 인증코드 검증으로 받은 토큰. 가입 요청에 같이 보냄 (서버에서 10분 동안 유효)
  const [emailVerifiedToken, setEmailVerifiedToken] = useState("");
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [serverErrors, setServerErrors] = useState<
    Partial<Record<ServerErrorField, string>>
  >({});
  // 이미 가입된 이메일이거나 가입은 됐는데 로그인 정보를 저장하지 못했으면 마지막 칸 문구를 로그인 링크로 보여줌
  const [loginLinkShown, setLoginLinkShown] = useState(false);
  const [notice, setNotice] = useState("");
  // 계정은 만들어졌는데 로그인 정보 저장만 실패한 상태. 다시 가입 요청을 보내지 않고 로그인으로만 보냄
  const [isSignedUp, setIsSignedUp] = useState(false);

  const fadeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  // 진행 중인 요청. 화면을 떠나면 취소해서 숨겨진 화면의 상태를 바꾸지 않게 함
  const attemptRef = useRef<AbortController | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const verifyCodeRef = useRef<HTMLInputElement>(null);
  const studentIdRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const validations = validateSignupForm(form);
  const isPending = pending !== null;

  const isNextDisabled = {
    1: !validations.email || (showVerifyInput && !validations.verifyCode),
    2: !validations.studentId || !validations.name,
    // 서버가 거절한 아이디(중복)는 고치기 전까지 다시 보내지 않음
    3: !validations.username || Boolean(serverErrors.username),
    4: !validations.password || !validations.passwordMatch,
  }[step];

  const submitLabel = isSignedUp
    ? "로그인하러 가기"
    : ((pending && PENDING_LABELS[pending]) ??
      (step === 1
        ? showVerifyInput
          ? "인증코드 검증"
          : "인증코드 발송"
        : step === LAST_STEP
          ? "회원가입 완료"
          : "다음으로"));

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
  const liveError = Object.values(serverErrors).find(Boolean) ?? "";

  // 다른 페이지로 이동해도 화면이 숨겨진 채 상태가 남으므로,
  // 인프라 서비스처럼 다시 들어오면 1단계부터 시작하도록 숨겨질 때 초기화
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
      setLoginLinkShown(false);
      setNotice("");
      setIsSignedUp(false);
    };
  }, []);

  useEffect(() => {
    if (isFading || isPending) return;

    const focusMap: Record<number, typeof emailRef> = {
      1: showVerifyInput ? verifyCodeRef : emailRef,
      2: studentIdRef,
      3: usernameRef,
      4: passwordRef,
    };

    focusMap[step]?.current?.focus();
  }, [step, isFading, isPending, showVerifyInput]);

  const clearServerError = (key: ServerErrorField) => {
    setServerErrors((prev) => {
      if (!prev[key] && !prev.passwordCheck) return prev;
      // 마지막 칸의 오류(이미 가입된 이메일 등)는 어느 칸을 고쳐도 지움
      const next = { ...prev };
      delete next[key];
      delete next.passwordCheck;
      return next;
    });
    setLoginLinkShown(false);
  };

  const handleChange =
    (key: keyof SignupFormValues) => (event: ChangeEvent<HTMLInputElement>) => {
      // 요청 중에는 보낸 값과 화면 값이 달라지지 않게 입력을 무시함 (포커스는 그대로 둠)
      // 가입이 끝난 뒤에는 고칠 것이 없으므로 입력을 막아 로그인 링크가 지워지지 않게 함
      if (isPending || isSignedUp) return;
      let value = event.target.value;

      if (key === "email") {
        setShowVerifyInput(false);
        setIsEmailVerified(false);
        setEmailVerifiedToken("");
      }

      if (key === "studentId") {
        value = sanitizeStudentId(value);
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
  // task가 true를 돌려주면 (가입 성공 뒤 이동 중) 잠근 채로 둠. 숨겨질 때 초기화에서 풀림
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

  const signup = () =>
    runAttempt(
      "signup",
      async (signal) => {
        await api.auth.signup(
          {
            username: form.username,
            password: form.password,
            studentNumber: Number(form.studentId),
            name: form.name,
            email: form.email,
            emailVerifiedToken,
          },
          { signal },
        );
        if (signal.aborted) return;
        router.push("/");
        return true;
      },
      (error) => {
        const code = error instanceof ApiError ? error.code : "";

        if (code === "USERNAME_ALREADY_EXISTS") {
          setServerErrors({ username: messageOf(error) });
          changeStepSmooth(3);
          return;
        }

        // 인증 토큰이 만료됐으면 이메일 인증만 다시 받게 하고 나머지 입력값은 남김
        if (code === "EMAIL_NOT_VERIFIED") {
          setShowVerifyInput(false);
          setIsEmailVerified(false);
          setEmailVerifiedToken("");
          setForm((prev) => ({ ...prev, verifyCode: "" }));
          setServerErrors({ email: VERIFY_EXPIRED_MESSAGE });
          changeStepSmooth(1);
          return;
        }

        if (code === "EMAIL_ALREADY_EXISTS") {
          setLoginLinkShown(true);
          setServerErrors({ passwordCheck: EMAIL_TAKEN_MESSAGE });
          return;
        }

        // 계정은 이미 만들어져서 다시 시도하면 엉뚱한 오류가 나므로 로그인으로 보냄
        if (code === STORAGE_ERROR) {
          setIsSignedUp(true);
          setLoginLinkShown(true);
          setServerErrors({ passwordCheck: SIGNED_UP_LOGIN_MESSAGE });
          return;
        }

        setServerErrors({ passwordCheck: messageOf(error) });
      },
    );

  // 이메일 인증을 마친 뒤에는 1단계로 돌아갈 수 없음
  const canGoBack = step > 1 && !(step === 2 && isEmailVerified) && !isSignedUp;

  const handlePrev = () => {
    if (!canGoBack || isFading || isPending) return;
    changeStepSmooth(step - 1);
  };

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
    if (isFading || isPending) return;

    // 가입은 이미 됐으므로 다시 보내지 않고 로그인 화면으로 보냄
    if (isSignedUp) {
      router.push("/login");
      return;
    }

    if (isNextDisabled) return;

    if (step === 1) {
      setServerErrors({});
      void (showVerifyInput ? verifyCode() : sendCode("send"));
      return;
    }

    if (step < LAST_STEP) {
      changeStepSmooth(step + 1);
      return;
    }

    setServerErrors({});
    setLoginLinkShown(false);
    void signup();
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
              ref={studentIdRef}
              value={form.studentId}
              onChange={handleChange("studentId")}
              label="학번"
              placeholder="학번을 입력해주세요"
              inputMode="numeric"
              autoComplete="off"
              title={errorFor("studentId")}
              titleColor={ERROR_COLOR}
            />

            <Input_text
              value={form.name}
              onChange={handleChange("name")}
              label="이름"
              placeholder="이름을 입력해주세요"
              autoComplete="name"
              title={errorFor("name")}
              titleColor={ERROR_COLOR}
            />
          </>
        );

      case 3:
        return (
          <>
            <Input_text
              value={form.email}
              onChange={handleChange("email")}
              label="이메일"
              placeholder="이메일을 입력해주세요"
              type="email"
              disabled
            />

            <Input_text
              ref={usernameRef}
              value={form.username}
              onChange={handleChange("username")}
              label="아이디"
              placeholder="사용할 아이디를 입력해주세요"
              autoComplete="username"
              title={errorFor("username")}
              titleColor={ERROR_COLOR}
            />
          </>
        );

      case 4:
        return (
          <>
            <Input_text
              ref={passwordRef}
              value={form.password}
              onChange={handleChange("password")}
              label="비밀번호"
              placeholder="비밀번호를 입력해주세요"
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
              titleHref={loginLinkShown ? "/login" : undefined}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <AuthLayout label="회원가입 영역">
      <AuthFormCard onSubmit={handleSubmit} aria-label="회원가입 폼">
        <AuthTitle>XQUARE SIGNUP</AuthTitle>

        {/* 사라지는 동안 입력을 막아 이전 단계 값이 바뀌지 않게 함 */}
        <AuthInputs isFading={isFading} inert={isFading}>
          {renderStep()}
        </AuthInputs>

        <AuthLiveMessage role="alert">{liveError}</AuthLiveMessage>
        {/* 재발송 같은 안내는 오류처럼 끊고 읽지 않도록 따로 둠 */}
        <AuthLiveMessage role="status">{notice}</AuthLiveMessage>

        <AuthFormActions>
          <Button_square
            type="submit"
            disabled={(isNextDisabled && !isSignedUp) || isPending}
          >
            {submitLabel}
          </Button_square>

          {canGoBack && (
            <AuthLinkRow>
              잘못입력하셨나요?
              <AuthLinkButton
                type="button"
                onClick={handlePrev}
                disabled={isPending}
              >
                뒤로가기
              </AuthLinkButton>
            </AuthLinkRow>
          )}

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
              XQUARE계정이 있으신가요?
              <AuthLink href="/login">로그인하기</AuthLink>
            </AuthLinkRow>
          )}
        </AuthFormActions>
      </AuthFormCard>
    </AuthLayout>
  );
}
