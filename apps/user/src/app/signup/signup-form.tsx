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

type ValidatedField = Exclude<keyof SignupFormValues, "passwordCheck">;

// XQUARE 인프라 서비스 회원가입과 같은 4단계 구성
// 1 이메일·인증코드 → 2 학번·이름 → 3 아이디 → 4 비밀번호
export function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showVerifyInput, setShowVerifyInput] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [form, setForm] = useState(INITIAL_SIGNUP_FORM);

  const fadeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const emailRef = useRef<HTMLInputElement>(null);
  const verifyCodeRef = useRef<HTMLInputElement>(null);
  const studentIdRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const validations = validateSignupForm(form);

  const isNextDisabled = {
    1: !validations.email || (showVerifyInput && !validations.verifyCode),
    2: !validations.studentId || !validations.name,
    3: !validations.username,
    4: !validations.password || !validations.passwordMatch,
  }[step];

  const submitLabel =
    step === 1
      ? showVerifyInput
        ? "인증코드 검증"
        : "인증코드 발송"
      : step === LAST_STEP
        ? "회원가입 완료"
        : "다음으로";

  // 입력값이 있는데 규칙에 맞지 않을 때만 오류 문구를 보여줌
  const errorFor = (key: ValidatedField) =>
    form[key] && !validations[key] ? SIGNUP_ERROR_MESSAGES[key] : "";

  const passwordCheckError =
    form.password && form.passwordCheck && !validations.passwordMatch
      ? SIGNUP_ERROR_MESSAGES.passwordMatch
      : "";

  // 다른 페이지로 이동해도 화면이 숨겨진 채 상태가 남으므로,
  // 인프라 서비스처럼 다시 들어오면 1단계부터 시작하도록 숨겨질 때 초기화
  useLayoutEffect(() => {
    return () => {
      clearTimeout(fadeTimerRef.current);
      setStep(1);
      setShowVerifyInput(false);
      setIsEmailVerified(false);
      setIsFading(false);
      setForm(INITIAL_SIGNUP_FORM);
    };
  }, []);

  useEffect(() => {
    if (isFading) return;

    const focusMap: Record<number, typeof emailRef> = {
      1: showVerifyInput ? verifyCodeRef : emailRef,
      2: studentIdRef,
      3: usernameRef,
      4: passwordRef,
    };

    focusMap[step]?.current?.focus();
  }, [step, isFading, showVerifyInput]);

  const handleChange =
    (key: keyof SignupFormValues) => (event: ChangeEvent<HTMLInputElement>) => {
      let value = event.target.value;

      if (key === "email") {
        setShowVerifyInput(false);
        setIsEmailVerified(false);
      }

      if (key === "studentId") {
        value = sanitizeStudentId(value);
      }

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

  // 이메일 인증을 마친 뒤에는 1단계로 돌아갈 수 없음
  const canGoBack = step > 1 && !(step === 2 && isEmailVerified);

  const handlePrev = () => {
    if (!canGoBack || isFading) return;
    changeStepSmooth(step - 1);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isNextDisabled || isFading) return;

    // 인증코드 발송·검증 API 연동 전이라 형식만 확인하고 다음으로 넘어감
    if (step === 1 && !showVerifyInput) {
      setShowVerifyInput(true);
      return;
    }

    if (step === 1) {
      setIsEmailVerified(true);
    }

    if (step < LAST_STEP) {
      changeStepSmooth(step + 1);
      return;
    }

    // 회원가입 API 연동 전이라 Overview로 이동
    router.push("/");
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
                title={errorFor("verifyCode")}
                titleColor={ERROR_COLOR}
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

        <AuthFormActions>
          <Button_square type="submit" disabled={isNextDisabled}>
            {submitLabel}
          </Button_square>

          {canGoBack && (
            <AuthLinkRow>
              잘못입력하셨나요?
              <AuthLinkButton type="button" onClick={handlePrev}>
                뒤로가기
              </AuthLinkButton>
            </AuthLinkRow>
          )}

          {step === 1 && (
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
