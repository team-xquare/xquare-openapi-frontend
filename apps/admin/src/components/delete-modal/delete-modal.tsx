"use client";

import { useEffect, useRef } from "react";
import styled from "@emotion/styled";
import { Xquare_colors } from "../../styles/colors";

export type DeleteModalRelation = {
  title: string;
  description: string;
};

type DeleteModalProps = {
  title: string;
  description?: string;
  relations: DeleteModalRelation[];
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteModal({
  title,
  description = "삭제하면 되돌릴 수 없습니다. 아래 연결이 함께 정리됩니다.",
  relations,
  onCancel,
  onConfirm,
}: DeleteModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    panel?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
        return;
      }

      if (event.key !== "Tab" || !panel) return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [onCancel]);

  return (
    <Overlay>
      <Dialog
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) onCancel();
        }}
      >
        <Panel ref={panelRef} tabIndex={-1}>
          <Heading id="delete-modal-title">{title}</Heading>
          <Description>{description}</Description>
          <Relations>
            {relations.map((relation) => (
              <Relation key={relation.title}>
                <strong>· {relation.title}</strong>
                <span>{relation.description}</span>
              </Relation>
            ))}
          </Relations>
          <Actions>
            <CancelButton type="button" onClick={onCancel}>취소</CancelButton>
            <ConfirmButton type="button" onClick={onConfirm}>삭제</ConfirmButton>
          </Actions>
        </Panel>
      </Dialog>
    </Overlay>
  );
}

const Overlay = styled.div`
  align-items: center;
  background: ${Xquare_colors.black}80;
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 20px;
  position: fixed;
  z-index: 10;
`;

const Dialog = styled.div`
  width: min(600px, 100%);
`;

const Panel = styled.div`
  background: ${Xquare_colors.white};
  border-radius: 16px;
  box-shadow: 0 16px 48px ${Xquare_colors.black}24;
  padding: 34px 36px 28px;
`;

const Heading = styled.h2`
  color: ${Xquare_colors.slate[900]};
  font-size: 22px;
  margin: 0 0 12px;
`;

const Description = styled.p`
  color: ${Xquare_colors.slate[600]};
  font-size: 15px;
  margin: 0 0 18px;
`;

const Relations = styled.div`
  background: ${Xquare_colors.slate[50]};
  border-radius: 10px;
  display: grid;
  gap: 14px;
  padding: 16px 18px;
`;

const Relation = styled.div`
  color: ${Xquare_colors.slate[600]};
  display: grid;
  font-size: 13px;
  gap: 4px;

  strong {
    color: ${Xquare_colors.slate[900]};
    font-size: 14px;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 26px;
`;

const CancelButton = styled.button`
  background: ${Xquare_colors.white};
  border: 1px solid ${Xquare_colors.slate[400]};
  border-radius: 8px;
  color: ${Xquare_colors.slate[900]};
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  height: 40px;
  padding: 0 20px;
`;

const ConfirmButton = styled.button`
  background: ${Xquare_colors.red[600]};
  border: 0;
  border-radius: 8px;
  color: ${Xquare_colors.white};
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  height: 40px;
  padding: 0 20px;
`;
