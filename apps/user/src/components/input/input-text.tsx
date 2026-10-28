"use client";

import { useId, type ChangeEvent, type HTMLAttributes, type Ref } from "react";
import {
  InputField,
  InputTitle,
  InputTitleBox,
  InputTitleLink,
  InputWrapper,
} from "./input-text-style";

// XQUARE 인프라 서비스의 Input_text와 같은 밑줄 입력칸
interface InputTextProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  // 화면에 라벨이 없어 스크린 리더에 읽어줄 이름
  label: string;
  placeholder?: string;
  disabled?: boolean;
  type?: "text" | "password" | "email" | "number";
  autoComplete?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  // 입력칸 오른쪽 아래 문구 (검증 오류, 안내 링크)
  title?: string;
  titleColor?: string;
  titleHref?: string;
  ref?: Ref<HTMLInputElement>;
}

export function Input_text({
  value,
  onChange,
  label,
  placeholder,
  disabled = false,
  type = "text",
  autoComplete,
  inputMode,
  title,
  titleColor,
  titleHref,
  ref,
}: InputTextProps) {
  const titleId = useId();
  const describesInput = Boolean(title) && !titleHref;

  return (
    <InputWrapper>
      <InputField
        ref={ref}
        value={value}
        onChange={onChange}
        aria-label={label}
        aria-describedby={describesInput ? titleId : undefined}
        placeholder={placeholder}
        disabled={disabled}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
      />
      <InputTitleBox>
        {title && titleHref ? (
          <InputTitleLink href={titleHref}>
            <InputTitle titleColor={titleColor}>{title}</InputTitle>
          </InputTitleLink>
        ) : title ? (
          <InputTitle id={titleId} titleColor={titleColor}>
            {title}
          </InputTitle>
        ) : null}
      </InputTitleBox>
    </InputWrapper>
  );
}
