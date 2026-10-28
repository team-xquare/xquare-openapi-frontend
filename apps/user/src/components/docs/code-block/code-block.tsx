import { memo } from "react";
import {
  CodeBlockCode,
  CodeBlockLabel,
  CodeBlockLine,
  CodeBlockPre,
  CodeBlockWrap,
} from "./code-block-style";

interface CodeBlockProps {
  label?: string;
  lines: string[];
  // 강조색으로 표시할 줄 번호 (0부터 시작)
  highlightLines?: number[];
}

function CodeBlockComponent({
  label,
  lines,
  highlightLines = [],
}: CodeBlockProps) {
  return (
    <CodeBlockWrap>
      {label && <CodeBlockLabel>{label}</CodeBlockLabel>}
      <CodeBlockPre>
        <CodeBlockCode>
          {lines.map((line, index) => (
            <CodeBlockLine
              key={index}
              isHighlighted={highlightLines.includes(index)}
            >
              {line}
            </CodeBlockLine>
          ))}
        </CodeBlockCode>
      </CodeBlockPre>
    </CodeBlockWrap>
  );
}

export const CodeBlock = memo(CodeBlockComponent);
