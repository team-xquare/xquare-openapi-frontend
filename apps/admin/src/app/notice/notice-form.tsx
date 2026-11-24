"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  NOTICE_CONTENT_MAX_LENGTH,
  NOTICE_TITLE_MAX_LENGTH,
  errorMessage,
  fetchNotice,
  isAbortError,
  isNotFoundError,
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
  FormError,
  FormField,
  FormNote,
  LoadStatus,
  NoticeFormBox,
  NoticePage,
  PageDescription,
  PageHead,
  PageHeading,
  PageTitle,
  PrimaryButton,
  PrimaryLink,
  RequiredMark,
  SecondaryButton,
  TitleInput,
} from "./page-style";

// 등록과 수정이 같은 폼을 씀. notice가 있으면 수정 화면
export function NoticeForm({
  notice,
  onSaved,
}: {
  notice?: Notice;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const id = useId();
  const initialTitle = notice?.title ?? "";
  const initialContent = notice?.content ?? "";
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  // 진행 중인 저장 요청. 화면을 떠나면 취소해서 다른 화면을 목록으로 덮어쓰지 않게 함
  const requestRef = useRef<AbortController | null>(null);

  // 앞뒤 공백만 바꾼 것은 바뀐 내용으로 보지 않음
  const isChanged =
    title.trim() !== initialTitle.trim() ||
    content.trim() !== initialContent.trim();
  const canSave =
    title.trim() !== "" && content.trim() !== "" && isChanged && !submitting;

  // 다른 페이지로 이동해도 화면이 숨겨진 채 상태가 남으므로,
  // 다시 들어오면 처음 값으로 보이도록 숨겨질 때 초기화
  useLayoutEffect(() => {
    return () => {
      requestRef.current?.abort();
      requestRef.current = null;
      setTitle(initialTitle);
      setContent(initialContent);
      setIsDeleteOpen(false);
      setSubmitting(false);
      setError("");
    };
  }, [initialTitle, initialContent]);

  const goToList = () => router.push("/notice");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;

    const request = new AbortController();
    requestRef.current = request;
    setSubmitting(true);
    setError("");
    // 앞뒤 공백은 바뀐 내용으로 보지 않으므로 빼고 보냄
    const body = { title: title.trim(), content: content.trim() };
    try {
      if (notice) {
        await api.patch(`/notices/${encodeURIComponent(notice.id)}`, body, {
          signal: request.signal,
        });
      } else {
        await api.post("/notices", body, { signal: request.signal });
      }
      if (!request.signal.aborted) {
        goToList();
        onSaved?.();
      }
    } catch (saveError) {
      if (isAbortError(saveError) || request.signal.aborted) return;
      setError(errorMessage(saveError, "공지를 저장하지 못했습니다."));
    } finally {
      if (requestRef.current === request) {
        requestRef.current = null;
        setSubmitting(false);
      }
    }
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
              disabled={submitting}
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
              disabled={submitting}
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

        {error && <FormError role="alert">{error}</FormError>}

        <FormActions>
          {notice && (
            <DangerOutlineButton
              type="button"
              disabled={submitting}
              onClick={() => setIsDeleteOpen(true)}
            >
              삭제
            </DangerOutlineButton>
          )}
          <ActionGroup>
            <SecondaryButton
              type="button"
              disabled={submitting}
              onClick={goToList}
            >
              취소
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={!canSave}>
              {submitting ? "저장 중…" : "저장"}
            </PrimaryButton>
          </ActionGroup>
        </FormActions>
      </NoticeFormBox>

      {notice && isDeleteOpen && (
        <DeleteNoticeModal
          notice={notice}
          onClose={() => setIsDeleteOpen(false)}
          onDeleted={goToList}
        />
      )}
    </NoticePage>
  );
}

// 수정 화면. 공지를 불러온 뒤 같은 폼을 띄움
export function NoticeEditForm({ id }: { id: string }) {
  const router = useRouter();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loadError, setLoadError] = useState<{
    message: string;
    notFound: boolean;
  } | null>(null);
  // 바뀌면 공지를 다시 불러옴 (다시 시도)
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // 로그인 여부는 저장소를 읽어야 해서 렌더 중이 아니라 effect에서 확인
    if (!api.auth.isLoggedIn()) {
      router.replace("/login");
      return;
    }
    const request = new AbortController();
    fetchNotice(id, request.signal)
      .then((loaded) => {
        setNotice(loaded);
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (isAbortError(error) || request.signal.aborted) return;
        setLoadError({
          message: errorMessage(error, "공지를 불러오지 못했습니다."),
          notFound: isNotFoundError(error),
        });
      });
    return () => request.abort();
  }, [id, router, reloadKey]);

  // 같은 공지를 다시 불러와도 입력 중인 폼이 초기화되지 않도록 id와 수정일시로 폼을 구분
  if (notice && !loadError) {
    return (
      <NoticeForm
        key={`${notice.id}-${notice.updatedAt ?? ""}`}
        notice={notice}
        // 화면 상태가 남아 있어서, 저장한 뒤 다시 들어오면 불러오는 동안 저장 전 내용의 폼이 보이고
        // 그 폼으로 저장할 수 있었음. 저장했으면 비워서 다시 불러올 때까지 불러오는 중 화면을 보여 줌.
        // 저장하지 않고 잠깐 나갔다 오는 경우에는 입력 중인 내용을 그대로 둠
        onSaved={() => setNotice(null)}
      />
    );
  }

  return (
    <NoticePage>
      <PageHead>
        <PageHeading>
          <PageTitle>공지 수정</PageTitle>
        </PageHeading>
      </PageHead>
      {loadError ? (
        <LoadStatus role="alert">
          <p>{loadError.message}</p>
          <ActionGroup>
            {/* 없는 공지(404)는 다시 불러와도 같으므로 목록으로만 보냄 */}
            {!loadError.notFound && (
              <SecondaryButton
                type="button"
                onClick={() => {
                  setLoadError(null);
                  setReloadKey((key) => key + 1);
                }}
              >
                다시 시도
              </SecondaryButton>
            )}
            <PrimaryLink href="/notice">목록으로</PrimaryLink>
          </ActionGroup>
        </LoadStatus>
      ) : (
        <LoadStatus role="status">
          <p>공지를 불러오는 중입니다.</p>
        </LoadStatus>
      )}
    </NoticePage>
  );
}
