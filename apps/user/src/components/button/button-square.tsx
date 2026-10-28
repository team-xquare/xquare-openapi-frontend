import type { ReactNode } from "react";
import { SquareButton } from "./button-square-style";

// XQUARE 인프라 서비스의 Button_square와 같은 테두리 버튼
interface ButtonSquareProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function Button_square({
  children,
  onClick,
  disabled = false,
  type = "button",
}: ButtonSquareProps) {
  return (
    <SquareButton type={type} onClick={onClick} disabled={disabled}>
      {children}
    </SquareButton>
  );
}
