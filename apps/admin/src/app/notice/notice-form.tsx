"use client";

import { useId, useLayoutEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  NOTICE_CONTENT_MAX_LENGTH,
  NOTICE_TITLE_MAX_LENGTH,
  type Notice,
} from "../notice-content";
import { DeleteNoticeModal } from "./delete-notice-modal";
import {
  ActionGroup,
  ContentTextarea,
  DangerOutlineButton,
  FieldCount,
  FieldLabel,
  FieldLabelRow,
  FormActions,
  FormCard,
  FormField,
  FormNote,
  NoticeFormBox,
  NoticePage,
  PageDescription,
  PageHead,
  PageHeading,
  PageTitle,
  PrimaryButton,
  RequiredMark,
  SecondaryButton,
  TitleInput,
} from "./page-style";

// 등록과 수정이 같은 폼을 씀. notice가 있으면 수정 화면
export function NoticeForm({ notice }: { notice?: Notice }) {
  const router = useRouter();
  const id = useId();
  const initialTitle = notice?.title ?? "";
  const initialContent = notice?.content ?? "";
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // 앞뒤 공백만 바꾼 것은 바뀐 내용으로 보지 않음
  const isChanged =
    title.trim() !== initialTitle.trim() ||
    content.trim() !== initialContent.trim();
  const canSave = title.trim() !== "" && content.trim() !== "" && isChanged;

  // 다른 페이지로 이동해도 화면이 숨겨진 채 상태가 남으므로,
  // 다시 들어오면 처음 값으로 보이도록 숨겨질 때 초기화
  useLayoutEffect(() => {
    return () => {
      setTitle(initialTitle);
      setContent(initialContent);
      setIsDeleteOpen(false);
    };
  }, [initialTitle, initialContent]);

  const goToList = () => router.push("/notice");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;

    // 공지 저장 API 연동 전이라 목록으로만 이동
    goToList();
  };

  return (
    <NoticePage>
      <PageHead>
        <PageHeading>
          <PageTitle>{notice ? "공지 수정" : "공지 등록"}</PageTitle>
          <PageDescription>
            {notice
              ? `${notice.title} · ${notice.author} 작성`
              : "새 공지사항을 등록합니다."}
          </PageDescription>
        </PageHeading>
      </PageHead>

      <NoticeFormBox onSubmit={handleSubmit}>
        <FormCard>
          <FormField>
            <FieldLabelRow>
              <FieldLabel htmlFor={`${id}-title`}>
                제목<RequiredMark aria-hidden="true">*</RequiredMark>
              </FieldLabel>
              <FieldCount id={`${id}-title-count`}>
                {title.length} / {NOTICE_TITLE_MAX_LENGTH}
              </FieldCount>
            </FieldLabelRow>
            <TitleInput
              id={`${id}-title`}
              aria-describedby={`${id}-title-count`}
              value={title}
              placeholder="제목을 입력하세요"
              maxLength={NOTICE_TITLE_MAX_LENGTH}
              required
              onChange={(event) => setTitle(event.target.value)}
            />
          </FormField>

          <FormField>
            <FieldLabelRow>
              <FieldLabel htmlFor={`${id}-content`}>
                본문<RequiredMark aria-hidden="true">*</RequiredMark>
              </FieldLabel>
              <FieldCount id={`${id}-content-count`}>
                {content.length} / {NOTICE_CONTENT_MAX_LENGTH}
              </FieldCount>
            </FieldLabelRow>
            <ContentTextarea
              id={`${id}-content`}
              aria-describedby={`${id}-content-count ${id}-note`}
              value={content}
              placeholder="공지 본문을 입력하세요"
              maxLength={NOTICE_CONTENT_MAX_LENGTH}
              required
              onChange={(event) => setContent(event.target.value)}
            />
          </FormField>

          <FormNote id={`${id}-note`}>
            {notice ? (
              <>
                <p>작성자는 처음 작성한 사람으로 유지됩니다.</p>
                <p>바꾼 내용이 없으면 저장 버튼이 눌리지 않습니다.</p>
              </>
            ) : (
              <p>작성자는 로그인한 관리자 계정으로 자동 설정됩니다.</p>
            )}
          </FormNote>
        </FormCard>

        <FormActions>
          {notice && (
            <DangerOutlineButton
              type="button"
              onClick={() => setIsDeleteOpen(true)}
            >
              삭제
            </DangerOutlineButton>
          )}
          <ActionGroup>
            <SecondaryButton type="button" onClick={goToList}>
              취소
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={!canSave}>
              저장
            </PrimaryButton>
          </ActionGroup>
        </FormActions>
      </NoticeFormBox>

      {notice && isDeleteOpen && (
        <DeleteNoticeModal
          title={notice.title}
          onClose={() => setIsDeleteOpen(false)}
          // 공지 삭제 API 연동 전이라 목록으로만 이동
          onConfirm={goToList}
        />
      )}
    </NoticePage>
  );
}
