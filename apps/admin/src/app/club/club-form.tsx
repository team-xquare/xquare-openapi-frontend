"use client";

import {
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
  CLUB_NAME_MAX_LENGTH,
  CLUBS,
  ROOMS,
  TEACHERS,
  findClub,
  findStudent,
  formatStudentClass,
  getClubMembers,
  searchStudents,
  type Club,
  type Student,
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
  ResultItem,
  ResultList,
  ResultStatus,
  ResultText,
  Select,
  SelectBox,
  SmallButton,
} from "./page-style";

const LOGO_TYPES = ["image/png", "image/jpeg"];

interface Logo {
  fileName: string;
  // 새로 고른 파일만 미리보기 주소가 있음. 기존 로고는 API 연동 전이라 이름만 있음
  previewUrl?: string;
}

const getInitialForm = (club?: Club) => ({
  name: club?.name ?? "",
  room: club?.room ?? "",
  teacher: club?.teacher ?? "",
  logo: (club?.logoFileName
    ? { fileName: club.logoFileName }
    : null) as Logo | null,
  memberIds: club ? getClubMembers(club).map((student) => student.id) : [],
  leaderId: club?.leaderId ?? "",
});

const sameMembers = (a: string[], b: string[]) =>
  a.length === b.length && a.every((id) => b.includes(id));

// 등록과 수정이 같은 폼을 씀. club이 있으면 수정 화면
export function ClubForm({ club }: { club?: Club }) {
  const router = useRouter();
  const id = useId();
  const initial = getInitialForm(club);
  const [name, setName] = useState(initial.name);
  const [room, setRoom] = useState(initial.room);
  const [teacher, setTeacher] = useState(initial.teacher);
  const [logo, setLogo] = useState(initial.logo);
  const [logoError, setLogoError] = useState("");
  const [memberIds, setMemberIds] = useState(initial.memberIds);
  const [leaderId, setLeaderId] = useState(initial.leaderId);
  const [memberQuery, setMemberQuery] = useState("");
  const [searchedQuery, setSearchedQuery] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // 다른 페이지로 이동해도 화면이 숨겨진 채 상태가 남으므로,
  // 다시 들어오면 처음 값으로 보이도록 숨겨질 때 초기화
  useLayoutEffect(() => {
    return () => {
      const reset = getInitialForm(club);
      setName(reset.name);
      setRoom(reset.room);
      setTeacher(reset.teacher);
      setLogo(reset.logo);
      setLogoError("");
      setMemberIds(reset.memberIds);
      setLeaderId(reset.leaderId);
      setMemberQuery("");
      setSearchedQuery("");
      setIsDeleteOpen(false);
    };
  }, [club]);

  // 한 교실·한 선생님은 한 동아리만 맡으므로 다른 동아리 것은 목록에서 뺌
  const otherClubs = CLUBS.filter((item) => item.id !== club?.id);
  const roomOptions = ROOMS.filter(
    (option) => !otherClubs.some((item) => item.room === option),
  );
  const teacherOptions = TEACHERS.filter(
    (option) => !otherClubs.some((item) => item.teacher === option),
  );

  const members = memberIds.flatMap((memberId) => {
    const student = findStudent(memberId);
    return student ? [student] : [];
  });
  const results = searchStudents(searchedQuery);

  // 앞뒤 공백만 바꾼 것은 바뀐 내용으로 보지 않음
  const isChanged =
    name.trim() !== initial.name ||
    room !== initial.room ||
    teacher !== initial.teacher ||
    logo?.fileName !== initial.logo?.fileName ||
    leaderId !== initial.leaderId ||
    !sameMembers(memberIds, initial.memberIds);
  const canSave =
    name.trim() !== "" &&
    room !== "" &&
    memberIds.length > 0 &&
    memberIds.includes(leaderId) &&
    isChanged;

  const goToList = () => router.push("/club");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;

    // 동아리 저장 API 연동 전이라 목록으로만 이동
    goToList();
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

    // 미리보기는 data URL로 만들어 따로 해제할 주소가 남지 않게 함
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      setLogo({ fileName: file.name, previewUrl: reader.result });
      setLogoError("");
    };
    reader.readAsDataURL(file);
  };

  const searchMembers = () => setSearchedQuery(memberQuery.trim());

  // 폼 안에 폼을 둘 수 없어 Enter를 직접 받아 학생 검색만 함
  const handleMemberQueryKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
    event.preventDefault();
    searchMembers();
  };

  const addMember = (student: Student) => {
    setMemberIds((prev) => [...prev, student.id]);
    // 처음 추가한 학생은 바로 팀장으로 지정
    if (memberIds.length === 0) setLeaderId(student.id);
  };

  const removeMember = (student: Student) => {
    setMemberIds((prev) => prev.filter((memberId) => memberId !== student.id));
    if (leaderId === student.id) setLeaderId("");
  };

  const renderResult = (student: Student) => {
    const isAdded = memberIds.includes(student.id);
    const otherClub =
      student.clubId && student.clubId !== club?.id
        ? findClub(student.clubId)
        : undefined;
    const affiliation = isAdded
      ? "이미 추가됨"
      : student.clubId
        ? `${findClub(student.clubId)?.name ?? ""} 소속`
        : "소속 없음";

    return (
      <ResultItem key={student.id}>
        <ResultText data-added={isAdded ? "" : undefined}>
          <strong>{student.name}</strong>
          <span>
            {formatStudentClass(student)} · {affiliation}
          </span>
        </ResultText>
        {isAdded ? (
          <ResultStatus>추가됨</ResultStatus>
        ) : otherClub ? (
          // 한 학생은 한 동아리에만 들어갈 수 있음
          <ResultStatus>추가 불가</ResultStatus>
        ) : (
          <AddButton
            type="button"
            aria-label={`${student.name} 구성원으로 추가`}
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
              ? `${club.name} · ${club.room} · 구성원 ${initial.memberIds.length}명`
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
                ) : logo ? (
                  "로고"
                ) : (
                  "미등록"
                )}
              </LogoBox>
              <LogoSide>
                <SmallButton
                  type="button"
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
                aria-describedby={`${id}-room-hint`}
                data-empty={room === "" ? "" : undefined}
                onChange={(event) => setRoom(event.target.value)}
              >
                <option value="" disabled>
                  비어 있는 교실을 선택하세요
                </option>
                {roomOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </SelectBox>
            <Hint id={`${id}-room-hint`}>
              XQUARE가 쓰는 세미나 2-3처럼 이미 배정된 교실은 목록에 나오지
              않습니다.
            </Hint>
          </FormField>

          <FormField>
            <FieldLabel htmlFor={`${id}-teacher`}>담당 선생님</FieldLabel>
            <SelectBox>
              <Select
                id={`${id}-teacher`}
                value={teacher}
                aria-describedby={`${id}-teacher-hint`}
                data-empty={teacher === "" ? "" : undefined}
                onChange={(event) => setTeacher(event.target.value)}
              >
                {/* 선택하지 않아도 되므로 안내 문구를 골라 지정을 풀 수 있게 둠 */}
                <option value="">교직원을 검색해 선택하세요</option>
                {teacherOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </SelectBox>
            <Hint id={`${id}-teacher-hint`}>
              선택하지 않아도 됩니다. 지정하면 교직원 관리의 담당 동아리에
              반영되며, 이미 다른 동아리를 맡은 교직원은 목록에 나오지 않습니다.
            </Hint>
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
                  onChange={(event) => setMemberQuery(event.target.value)}
                  onKeyDown={handleMemberQueryKeyDown}
                />
                <SecondaryButton type="button" onClick={searchMembers}>
                  검색
                </SecondaryButton>
              </MemberSearch>

              {searchedQuery && (
                <ResultList aria-label="학생 검색 결과" aria-live="polite">
                  {results.map(renderResult)}
                  {results.length === 0 && (
                    <ResultEmpty>검색 결과가 없습니다.</ResultEmpty>
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
                    {members.map((student) => {
                      const isLeader = student.id === leaderId;

                      return (
                        <tr
                          key={student.id}
                          data-leader={isLeader ? "" : undefined}
                        >
                          <td>
                            <LeaderRadio
                              type="radio"
                              name={`${id}-leader`}
                              checked={isLeader}
                              aria-label={`${student.name} 팀장으로 지정`}
                              onChange={() => setLeaderId(student.id)}
                            />
                          </td>
                          <td>{student.name}</td>
                          <td>{formatStudentClass(student)}</td>
                          <td>{isLeader && <LeaderBadge>팀장</LeaderBadge>}</td>
                          <td>
                            <RemoveButton
                              type="button"
                              aria-label={`${student.name} 구성원에서 제거`}
                              onClick={() => removeMember(student)}
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

        <ClubFormActions>
          {club && (
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
        </ClubFormActions>
      </ClubFormBox>

      {club && isDeleteOpen && (
        <DeleteClubModal
          name={club.name}
          room={club.room}
          memberCount={initial.memberIds.length}
          teacher={club.teacher}
          onClose={() => setIsDeleteOpen(false)}
          // 동아리 삭제 API 연동 전이라 목록으로만 이동
          onConfirm={goToList}
        />
      )}
    </ClubPage>
  );
}
