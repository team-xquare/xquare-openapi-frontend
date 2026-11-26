"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  FormError,
  LoadStatus,
} from "@/components/request-status/request-status-style";
import { api } from "@/lib/api";
import { errorMessage, isAbortError, isNotFoundError } from "@/lib/api-error";
import {
  CLUB_LOGO_MAX_LENGTH,
  CLUB_MEMBER_MAX_COUNT,
  CLUB_NAME_MAX_LENGTH,
  CLUB_ROOMS,
  createClub,
  fetchClub,
  updateClub,
  type ClubRequest,
  type ClubResponse,
  type ClubRoom,
  type ClubStudentResponse,
  type ClubTeacherResponse,
} from "@/lib/clubs-api";
import type { StudentResponse } from "@/lib/students-api";
import type { TeacherResponse } from "@/lib/teachers-api";
import {
  fetchAllClubs,
  fetchAllTeachers,
  formatClubRoom,
  formatStudentNumber,
  getClubMembers,
  isLogoUrl,
  searchStudents,
  toClubRoom,
} from "../club-content";
import {
  ActionGroup,
  DangerOutlineButton,
  FieldLabel,
  FormCard,
  FormField,
  NoticePage as ClubPage,
  PageDescription,
  PageHead,
  PageHeading,
  PageTitle,
  PrimaryButton,
  PrimaryLink,
  RequiredMark,
  SecondaryButton,
  TitleInput,
  VisuallyHidden,
} from "../notice/page-style";
import { DeleteClubModal } from "./delete-club-modal";
import {
  AddButton,
  ClubFormActions,
  ClubFormBox,
  ErrorText,
  FileName,
  Hint,
  LeaderBadge,
  LeaderRadio,
  LogoBox,
  LogoField,
  LogoSide,
  MemberEmpty,
  MemberHead,
  MemberPicker,
  MemberSearch,
  MemberSearchInput,
  MemberTable,
  MemberTableBox,
  RemoveButton,
  ResultEmpty,
  ResultError,
  ResultItem,
  ResultList,
  ResultStatus,
  ResultText,
  Select,
  SelectBox,
  SmallButton,
} from "./page-style";

const LOGO_TYPES = ["image/png", "image/jpeg"];

// 로고 업로드 API가 아직 없어 동아리에는 로고 문자열만 저장됨.
// 새로 고른 파일은 파일 이름을, 그대로 두면 저장된 값을 다시 보냄
interface Logo {
  // API에 보내는 값 (새로 고른 파일 이름 또는 저장된 로고)
  fileName: string;
  // 새로 고른 파일만 미리보기 주소가 있음
  previewUrl?: string;
}

interface FormValues {
  name: string;
  room: ClubRoom | "";
  // 담당 선생님 id. 선택 목록 값이라 문자열이고 미지정이면 빈 값
  teacherId: string;
  logo: Logo | null;
  // 팀장을 포함한 구성원
  members: ClubStudentResponse[];
  leaderId: number | null;
}

const getInitialForm = (club?: ClubResponse): FormValues => ({
  name: club?.name ?? "",
  room: club?.room ?? "",
  teacherId: club?.teacher ? String(club.teacher.id) : "",
  logo: club?.logo ? { fileName: club.logo } : null,
  members: club ? getClubMembers(club) : [],
  leaderId: club?.manager?.id ?? null,
});

const sameMembers = (a: ClubStudentResponse[], b: ClubStudentResponse[]) =>
  a.length === b.length &&
  a.every((member) => b.some((item) => item.id === member.id));

// 등록과 수정이 같은 폼을 씀. club이 있으면 수정 화면
export function ClubForm({ club }: { club?: ClubResponse }) {
  const router = useRouter();
  const id = useId();
  const initial = getInitialForm(club);
  const [name, setName] = useState(initial.name);
  const [room, setRoom] = useState(initial.room);
  const [teacherId, setTeacherId] = useState(initial.teacherId);
  const [logo, setLogo] = useState(initial.logo);
  const [logoError, setLogoError] = useState("");
  const [members, setMembers] = useState(initial.members);
  const [leaderId, setLeaderId] = useState(initial.leaderId);
  const [memberQuery, setMemberQuery] = useState("");
  const [searchedQuery, setSearchedQuery] = useState("");
  // 검색 결과. 검색 중이면 null
  const [results, setResults] = useState<StudentResponse[] | null>(null);
  const [searchError, setSearchError] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  // 다른 동아리가 쓰는 교실 · 선생님을 목록에서 빼는 데 씀. 불러오기 전에는 null
  const [clubs, setClubs] = useState<ClubResponse[] | null>(null);
  const [clubsError, setClubsError] = useState("");
  const [teachers, setTeachers] = useState<TeacherResponse[] | null>(null);
  const [teachersError, setTeachersError] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);
  // 진행 중인 저장 요청. 화면을 떠나면 취소해서 다른 화면을 목록으로 덮어쓰지 않게 함
  const requestRef = useRef<AbortController | null>(null);
  // 진행 중인 학생 검색. 다시 검색하거나 화면을 떠나면 취소함
  const searchRef = useRef<AbortController | null>(null);

  // 다른 화면에서 돌아와 다시 보일 때도 다시 받아 그사이 배정된 교실 · 선생님을 반영함
  useEffect(() => {
    // 로그인 여부는 저장소를 읽어야 해서 렌더 중이 아니라 effect에서 확인
    if (!api.auth.isLoggedIn()) {
      router.replace("/login");
      return;
    }
    const request = new AbortController();
    const isCancelled = (loadError: unknown) =>
      isAbortError(loadError) || request.signal.aborted;
    fetchAllClubs(request.signal)
      .then((list) => {
        setClubs(list);
        setClubsError("");
      })
      .catch((loadError: unknown) => {
        if (isCancelled(loadError)) return;
        setClubsError(errorMessage(loadError, "동아리 목록을 불러오지 못했습니다."));
      });
    // 실패해도 담당 선생님을 바꾸지 않으면 저장할 수 있어 필드 아래에만 알림
    fetchAllTeachers(request.signal)
      .then((list) => {
        setTeachers(list);
        setTeachersError("");
      })
      .catch((loadError: unknown) => {
        if (isCancelled(loadError)) return;
        setTeachersError(errorMessage(loadError, "교직원 목록을 불러오지 못했습니다."));
      });
    return () => request.abort();
  }, [router]);

  // 다른 페이지로 이동해도 화면이 숨겨진 채 상태가 남으므로,
  // 다시 들어오면 처음 값으로 보이도록 숨겨질 때 초기화
  useLayoutEffect(() => {
    return () => {
      requestRef.current?.abort();
      requestRef.current = null;
      searchRef.current?.abort();
      searchRef.current = null;
      const reset = getInitialForm(club);
      setName(reset.name);
      setRoom(reset.room);
      setTeacherId(reset.teacherId);
      setLogo(reset.logo);
      setLogoError("");
      setMembers(reset.members);
      setLeaderId(reset.leaderId);
      setMemberQuery("");
      setSearchedQuery("");
      setResults(null);
      setSearchError("");
      setIsDeleteOpen(false);
      setSubmitting(false);
      setError("");
    };
  }, [club]);

  // 한 교실 · 한 선생님은 한 동아리만 맡으므로 다른 동아리 것은 목록에서 뺌.
  // 지금 고른 값은 그사이 다른 동아리에 배정됐어도 선택이 풀려 보이지 않게 남김
  const otherClubs = (clubs ?? []).filter((item) => item.id !== club?.id);
  const roomOptions = CLUB_ROOMS.filter(
    (option) =>
      option === room || !otherClubs.some((item) => item.room === option),
  );
  const isTakenTeacher = (teacher: TeacherResponse) =>
    (!!teacher.club && teacher.club.id !== club?.id) ||
    otherClubs.some((item) => item.teacher?.id === teacher.id);
  // 교직원 목록을 못 받았으면 지금 담당 선생님만 남겨 그대로 저장하거나 지정을 풀 수 있게 함
  const teacherOptions: ClubTeacherResponse[] = teachers
    ? teachers.filter(
        (teacher) =>
          String(teacher.id) === teacherId || !isTakenTeacher(teacher),
      )
    : club?.teacher
      ? [club.teacher]
      : [];

  const isFull = members.length >= CLUB_MEMBER_MAX_COUNT;

  // 앞뒤 공백만 바꾼 것은 바뀐 내용으로 보지 않음
  const isChanged =
    name.trim() !== initial.name ||
    room !== initial.room ||
    teacherId !== initial.teacherId ||
    logo?.fileName !== initial.logo?.fileName ||
    leaderId !== initial.leaderId ||
    !sameMembers(members, initial.members);
  const canSave =
    name.trim() !== "" &&
    room !== "" &&
    members.length > 0 &&
    members.length <= CLUB_MEMBER_MAX_COUNT &&
    members.some((member) => member.id === leaderId) &&
    isChanged &&
    !submitting;

  const goToList = () => router.push("/club");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave || leaderId === null) return;

    const request = new AbortController();
    requestRef.current = request;
    setSubmitting(true);
    setError("");
    const body: ClubRequest = {
      // 앞뒤 공백은 바뀐 내용으로 보지 않으므로 빼고 보냄
      name: name.trim(),
      logo: logo?.fileName ?? "",
      room,
      manager: leaderId,
      // 팀장도 구성원이라 같이 보냄
      member: members.map((member) => member.id),
      teacher: teacherId ? Number(teacherId) : null,
    };
    try {
      if (club) {
        await updateClub(club.id, body, request.signal);
      } else {
        await createClub(body, request.signal);
      }
      if (!request.signal.aborted) {
        // 목록으로 가는 동안 저장을 한 번 더 누르지 않도록 잠금을 풀지 않음
        requestRef.current = null;
        goToList();
      }
    } catch (saveError) {
      if (isAbortError(saveError) || request.signal.aborted) return;
      setError(errorMessage(saveError, "동아리를 저장하지 못했습니다."));
    } finally {
      if (requestRef.current === request) {
        requestRef.current = null;
        setSubmitting(false);
      }
    }
  };

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // 같은 파일을 다시 골라도 change가 일어나도록 비움
    event.target.value = "";
    if (!file) return;

    if (!LOGO_TYPES.includes(file.type)) {
      setLogoError("PNG 또는 JPG 파일만 올릴 수 있습니다.");
      return;
    }
    // 파일 이름을 로고 값으로 보내므로 서버 길이 한도를 넘으면 받지 않음
    if (file.name.length > CLUB_LOGO_MAX_LENGTH) {
      setLogoError(`파일 이름은 ${CLUB_LOGO_MAX_LENGTH}자까지 쓸 수 있습니다.`);
      return;
    }

    // 미리보기는 data URL로 만들어 따로 해제할 주소가 남지 않게 함
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      setLogo({ fileName: file.name, previewUrl: reader.result });
      setLogoError("");
    };
    reader.readAsDataURL(file);
  };

  const searchMembers = async () => {
    const keyword = memberQuery.trim();
    searchRef.current?.abort();
    searchRef.current = null;
    setSearchedQuery(keyword);
    setResults(null);
    setSearchError("");
    if (!keyword) return;

    const request = new AbortController();
    searchRef.current = request;
    try {
      const found = await searchStudents(keyword, request.signal);
      if (!request.signal.aborted) setResults(found);
    } catch (searchFailure) {
      if (isAbortError(searchFailure) || request.signal.aborted) return;
      setSearchError(errorMessage(searchFailure, "학생을 검색하지 못했습니다."));
    } finally {
      if (searchRef.current === request) searchRef.current = null;
    }
  };

  // 폼 안에 폼을 둘 수 없어 Enter를 직접 받아 학생 검색만 함
  const handleMemberQueryKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
    event.preventDefault();
    searchMembers();
  };

  const addMember = (student: StudentResponse) => {
    if (isFull) return;
    setMembers((prev) => [
      ...prev,
      {
        id: student.id,
        studentNumber: student.studentNumber,
        name: student.name,
      },
    ]);
    // 처음 추가한 학생은 바로 팀장으로 지정
    if (members.length === 0) setLeaderId(student.id);
  };

  const removeMember = (member: ClubStudentResponse) => {
    setMembers((prev) => prev.filter((item) => item.id !== member.id));
    if (leaderId === member.id) setLeaderId(null);
  };

  const renderResult = (student: StudentResponse) => {
    const isAdded = members.some((member) => member.id === student.id);
    // 한 학생은 한 동아리에만 들어갈 수 있음
    const isInOtherClub = !!student.club && student.club.id !== club?.id;
    const affiliation = isAdded
      ? "이미 추가됨"
      : student.club
        ? `${student.club.name} 소속`
        : "소속 없음";

    return (
      <ResultItem key={student.id}>
        <ResultText data-added={isAdded ? "" : undefined}>
          <strong>{student.name}</strong>
          <span>
            {formatStudentNumber(student.studentNumber)} · {affiliation}
          </span>
        </ResultText>
        {isAdded ? (
          <ResultStatus>추가됨</ResultStatus>
        ) : isInOtherClub ? (
          <ResultStatus>추가 불가</ResultStatus>
        ) : isFull ? (
          // 서버가 구성원을 최대 50명까지만 받음
          <ResultStatus>최대 {CLUB_MEMBER_MAX_COUNT}명</ResultStatus>
        ) : (
          <AddButton
            type="button"
            aria-label={`${student.name} 구성원으로 추가`}
            disabled={submitting}
            onClick={() => addMember(student)}
          >
            + 추가
          </AddButton>
        )}
      </ResultItem>
    );
  };

  return (
    <ClubPage>
      <PageHead>
        <PageHeading>
          <PageTitle>{club ? "동아리 수정" : "동아리 등록"}</PageTitle>
          <PageDescription>
            {club
              ? [
                  club.name,
                  club.room && formatClubRoom(club.room),
                  `구성원 ${initial.members.length}명`,
                ]
                  .filter(Boolean)
                  .join(" · ")
              : "새 동아리를 만들고 구성원을 추가합니다."}
          </PageDescription>
        </PageHeading>
      </PageHead>

      <ClubFormBox onSubmit={handleSubmit}>
        <FormCard>
          <FormField>
            <FieldLabel htmlFor={`${id}-name`}>
              동아리명<RequiredMark aria-hidden="true">*</RequiredMark>
            </FieldLabel>
            <TitleInput
              id={`${id}-name`}
              value={name}
              placeholder="동아리명을 입력하세요"
              maxLength={CLUB_NAME_MAX_LENGTH}
              required
              disabled={submitting}
              onChange={(event) => setName(event.target.value)}
            />
          </FormField>

          <FormField role="group" aria-labelledby={`${id}-logo-label`}>
            <FieldLabel as="span" id={`${id}-logo-label`}>
              로고
            </FieldLabel>
            <LogoField>
              <LogoBox>
                {logo?.previewUrl ? (
                  // 사용자가 고른 파일의 data URL 미리보기라 next/image 최적화 대상이 아님
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo.previewUrl} alt={`${name || "동아리"} 로고 미리보기`} />
                ) : logo && isLogoUrl(logo.fileName) ? (
                  // 저장된 로고가 어느 서버 주소일지 몰라 next/image 대신 그대로 보여 줌
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo.fileName} alt={`${name || "동아리"} 로고`} />
                ) : logo ? (
                  "로고"
                ) : (
                  "미등록"
                )}
              </LogoBox>
              <LogoSide>
                <SmallButton
                  type="button"
                  disabled={submitting}
                  onClick={() => logoInputRef.current?.click()}
                >
                  {logo ? "이미지 변경" : "이미지 업로드"}
                </SmallButton>
                {/* 파일 선택 창은 위 버튼으로 엶 */}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                  aria-label="동아리 로고 이미지 파일"
                  hidden
                  onChange={handleLogoChange}
                />
                <Hint>PNG·JPG</Hint>
                {logo && <FileName>{logo.fileName}</FileName>}
                {logoError && <ErrorText role="alert">{logoError}</ErrorText>}
              </LogoSide>
            </LogoField>
          </FormField>

          <FormField>
            <FieldLabel htmlFor={`${id}-room`}>
              사용 교실<RequiredMark aria-hidden="true">*</RequiredMark>
            </FieldLabel>
            <SelectBox>
              <Select
                id={`${id}-room`}
                value={room}
                required
                disabled={submitting}
                aria-describedby={`${id}-room-hint`}
                data-empty={room === "" ? "" : undefined}
                onChange={(event) =>
                  setRoom(toClubRoom(event.target.value) ?? "")
                }
              >
                <option value="" disabled>
                  비어 있는 교실을 선택하세요
                </option>
                {roomOptions.map((option) => (
                  <option key={option} value={option}>
                    {formatClubRoom(option)}
                  </option>
                ))}
              </Select>
            </SelectBox>
            <Hint id={`${id}-room-hint`}>
              다른 동아리가 쓰고 있는 교실은 목록에 나오지 않습니다.
            </Hint>
            {clubsError && <ErrorText role="alert">{clubsError}</ErrorText>}
          </FormField>

          <FormField>
            <FieldLabel htmlFor={`${id}-teacher`}>담당 선생님</FieldLabel>
            <SelectBox>
              <Select
                id={`${id}-teacher`}
                value={teacherId}
                disabled={submitting}
                aria-describedby={`${id}-teacher-hint`}
                data-empty={teacherId === "" ? "" : undefined}
                onChange={(event) => setTeacherId(event.target.value)}
              >
                {/* 선택하지 않아도 되므로 안내 문구를 골라 지정을 풀 수 있게 둠 */}
                <option value="">교직원을 검색해 선택하세요</option>
                {teacherOptions.map((option) => (
                  <option key={option.id} value={String(option.id)}>
                    {option.name}
                  </option>
                ))}
              </Select>
            </SelectBox>
            <Hint id={`${id}-teacher-hint`}>
              선택하지 않아도 됩니다. 지정하면 교직원 관리의 담당 동아리에
              반영되며, 이미 다른 동아리를 맡은 교직원은 목록에 나오지 않습니다.
            </Hint>
            {teachersError && <ErrorText role="alert">{teachersError}</ErrorText>}
          </FormField>

          <FormField role="group" aria-labelledby={`${id}-member-label`}>
            <FieldLabel as="span" id={`${id}-member-label`}>
              구성원 · 팀장<RequiredMark aria-hidden="true">*</RequiredMark>
            </FieldLabel>
            <MemberPicker>
              <MemberSearch>
                <MemberSearchInput
                  type="search"
                  value={memberQuery}
                  placeholder="이름 또는 학번으로 학생 검색 (예: 장윤호, 2315)"
                  aria-label="구성원으로 추가할 학생 검색"
                  disabled={submitting}
                  onChange={(event) => setMemberQuery(event.target.value)}
                  onKeyDown={handleMemberQueryKeyDown}
                />
                <SecondaryButton
                  type="button"
                  disabled={submitting}
                  onClick={searchMembers}
                >
                  검색
                </SecondaryButton>
              </MemberSearch>

              {searchedQuery && (
                <ResultList aria-label="학생 검색 결과" aria-live="polite">
                  {searchError ? (
                    <ResultError>{searchError}</ResultError>
                  ) : results === null ? (
                    <ResultEmpty>학생을 검색하는 중입니다.</ResultEmpty>
                  ) : results.length === 0 ? (
                    <ResultEmpty>검색 결과가 없습니다.</ResultEmpty>
                  ) : (
                    results.map(renderResult)
                  )}
                </ResultList>
              )}

              <MemberHead>
                <strong>구성원 {members.length}명</strong>
                <span>팀장은 구성원 중에서만 지정할 수 있습니다</span>
              </MemberHead>
              <MemberTableBox>
                <MemberTable aria-label="구성원 목록">
                  <thead>
                    <tr>
                      <th scope="col">팀장</th>
                      <th scope="col">이름</th>
                      <th scope="col">학년/반/번호</th>
                      <th scope="col">
                        <VisuallyHidden>표시</VisuallyHidden>
                      </th>
                      <th scope="col">
                        <VisuallyHidden>관리</VisuallyHidden>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => {
                      const isLeader = member.id === leaderId;

                      return (
                        <tr
                          key={member.id}
                          data-leader={isLeader ? "" : undefined}
                        >
                          <td>
                            <LeaderRadio
                              type="radio"
                              name={`${id}-leader`}
                              checked={isLeader}
                              disabled={submitting}
                              aria-label={`${member.name} 팀장으로 지정`}
                              onChange={() => setLeaderId(member.id)}
                            />
                          </td>
                          <td>{member.name}</td>
                          <td>{formatStudentNumber(member.studentNumber)}</td>
                          <td>{isLeader && <LeaderBadge>팀장</LeaderBadge>}</td>
                          <td>
                            <RemoveButton
                              type="button"
                              aria-label={`${member.name} 구성원에서 제거`}
                              disabled={submitting}
                              onClick={() => removeMember(member)}
                            >
                              제거
                            </RemoveButton>
                          </td>
                        </tr>
                      );
                    })}
                    {members.length === 0 && (
                      <tr>
                        <MemberEmpty colSpan={5}>
                          학생을 검색해 구성원을 추가하세요.
                        </MemberEmpty>
                      </tr>
                    )}
                  </tbody>
                </MemberTable>
              </MemberTableBox>
            </MemberPicker>
            <Hint>
              학생을 검색해 추가한 뒤 그중 한 명을 팀장으로 지정합니다. 한
              학생은 한 동아리에만 들어갈 수 있어 다른 동아리 소속 학생은 추가할
              수 없습니다.
            </Hint>
          </FormField>
        </FormCard>

        {error && <FormError role="alert">{error}</FormError>}

        <ClubFormActions>
          {club && (
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
        </ClubFormActions>
      </ClubFormBox>

      {club && isDeleteOpen && (
        <DeleteClubModal
          club={club}
          onClose={() => setIsDeleteOpen(false)}
          onDeleted={goToList}
        />
      )}
    </ClubPage>
  );
}

// 수정 화면. 동아리를 불러온 뒤 같은 폼을 띄움
export function ClubEditForm({ id }: { id: string }) {
  const router = useRouter();
  // 서버 id는 숫자라 그 밖의 주소는 서버에 묻지 않고 없는 동아리로 봄
  const isValidId = /^\d+$/.test(id);
  // version은 다시 불러온 내용이 바뀌었을 때만 올려 폼을 새로 그림
  const [loaded, setLoaded] = useState<{
    club: ClubResponse;
    version: number;
  } | null>(null);
  const [loadError, setLoadError] = useState<{
    message: string;
    notFound: boolean;
  } | null>(null);
  // 바뀌면 동아리를 다시 불러옴 (다시 시도)
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // 로그인 여부는 저장소를 읽어야 해서 렌더 중이 아니라 effect에서 확인
    if (!api.auth.isLoggedIn()) {
      router.replace("/login");
      return;
    }
    if (!isValidId) return;
    const request = new AbortController();
    fetchClub(id, request.signal)
      .then((club) => {
        // 같은 동아리를 다시 불러와도 입력 중인 폼이 초기화되지 않도록 내용이 같으면 그대로 둠
        setLoaded((prev) =>
          prev && JSON.stringify(prev.club) === JSON.stringify(club)
            ? prev
            : { club, version: (prev?.version ?? 0) + 1 },
        );
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (isAbortError(error) || request.signal.aborted) return;
        setLoadError({
          message: errorMessage(error, "동아리를 불러오지 못했습니다."),
          notFound: isNotFoundError(error),
        });
      });
    return () => request.abort();
  }, [id, isValidId, router, reloadKey]);

  const status = isValidId
    ? loadError
    : { message: "동아리를 찾을 수 없습니다.", notFound: true };

  if (loaded && !status) {
    return <ClubForm key={loaded.version} club={loaded.club} />;
  }

  return (
    <ClubPage>
      <PageHead>
        <PageHeading>
          <PageTitle>동아리 수정</PageTitle>
        </PageHeading>
      </PageHead>
      {status ? (
        <LoadStatus role="alert">
          <p>{status.message}</p>
          <ActionGroup>
            {/* 없는 동아리(404)는 다시 불러와도 같으므로 목록으로만 보냄 */}
            {!status.notFound && (
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
            <PrimaryLink href="/club">목록으로</PrimaryLink>
          </ActionGroup>
        </LoadStatus>
      ) : (
        <LoadStatus role="status">
          <p>동아리를 불러오는 중입니다.</p>
        </LoadStatus>
      )}
    </ClubPage>
  );
}
