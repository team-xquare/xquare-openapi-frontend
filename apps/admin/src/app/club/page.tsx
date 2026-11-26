"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { CellStatus } from "@/components/request-status/request-status-style";
import { api } from "@/lib/api";
import { errorMessage, isAbortError } from "@/lib/api-error";
import { CLUB_ROOMS, type ClubResponse } from "@/lib/clubs-api";
import {
  fetchAllClubs,
  formatClubRoom,
  getClubMembers,
} from "../club-content";
import {
  EmptyCell,
  NoticePage as ClubPage,
  PageDescription,
  PageHead,
  PageHeading,
  PageTitle,
  PrimaryLink,
  RowActions,
  RowDeleteButton,
  RowEditLink,
  SecondaryButton,
  VisuallyHidden,
} from "../notice/page-style";
import { DeleteClubModal } from "./delete-club-modal";
import {
  ClubTable,
  FilterBar,
  KeywordInput,
  ListHint,
  Muted,
  Select,
  SelectBox,
} from "./page-style";

// 담당 선생님 필터에서 '미지정'만 고르는 값 (교직원 id와 겹치지 않게)
const NO_TEACHER = "__none__";

const EMPTY_FILTER = { keyword: "", room: "", teacher: "" };

export default function ClubListPage() {
  const router = useRouter();
  // 처음 불러오기 전에는 null
  const [clubs, setClubs] = useState<ClubResponse[] | null>(null);
  const [loadError, setLoadError] = useState("");
  // 바뀌면 목록을 다시 불러옴 (다시 시도 · 삭제 후)
  const [reloadKey, setReloadKey] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [room, setRoom] = useState("");
  const [teacher, setTeacher] = useState("");
  const [filter, setFilter] = useState(EMPTY_FILTER);
  const [deleteTarget, setDeleteTarget] = useState<ClubResponse | null>(null);
  const keywordInputRef = useRef<HTMLInputElement>(null);

  // 다른 화면에서 돌아와 다시 보일 때도 effect가 다시 돌아 최신 목록을 받음
  useEffect(() => {
    // 로그인 여부는 저장소를 읽어야 해서 렌더 중이 아니라 effect에서 확인
    if (!api.auth.isLoggedIn()) {
      router.replace("/login");
      return;
    }
    const request = new AbortController();
    fetchAllClubs(request.signal)
      .then((list) => {
        setClubs(list);
        setLoadError("");
      })
      .catch((error: unknown) => {
        if (isAbortError(error) || request.signal.aborted) return;
        setLoadError(errorMessage(error, "동아리 목록을 불러오지 못했습니다."));
      });
    return () => request.abort();
  }, [router, reloadKey]);

  // 다른 페이지로 이동해도 화면이 숨겨진 채 상태가 남으므로,
  // 열려 있던 삭제 모달이 돌아왔을 때 배경 없이 남지 않도록 숨겨질 때 닫음
  useLayoutEffect(() => {
    return () => setDeleteTarget(null);
  }, []);

  const list = clubs ?? [];
  // 교실은 층 · 번호 순으로, 선생님은 이름이 같아도 구분되도록 id로 고름
  const roomOptions = CLUB_ROOMS.filter((option) =>
    list.some((club) => club.room === option),
  );
  const teacherOptions = list
    .flatMap((club) => (club.teacher ? [club.teacher] : []))
    .filter(
      (option, index, all) =>
        all.findIndex((item) => item.id === option.id) === index,
    );
  const hasNoTeacher = list.some((club) => !club.teacher);

  const normalizedKeyword = filter.keyword.toLowerCase();
  const rows = list.filter(
    (club) =>
      club.name.toLowerCase().includes(normalizedKeyword) &&
      (!filter.room || club.room === filter.room) &&
      (!filter.teacher ||
        (filter.teacher === NO_TEACHER
          ? !club.teacher
          : String(club.teacher?.id) === filter.teacher)),
  );
  const isFiltered = Object.values(filter).some(Boolean);

  // 입력할 때마다가 아니라 검색 버튼(또는 Enter)을 눌렀을 때 거름
  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFilter({ keyword: keyword.trim(), room, teacher });
  };

  return (
    <ClubPage>
      <PageHead>
        <PageHeading>
          <PageTitle>동아리 관리</PageTitle>
          <PageDescription>동아리 정보와 구성원을 관리합니다.</PageDescription>
        </PageHeading>
        <PrimaryLink href="/club/new">동아리 등록</PrimaryLink>
      </PageHead>

      <FilterBar role="search" onSubmit={handleSearch}>
        <KeywordInput
          ref={keywordInputRef}
          type="search"
          value={keyword}
          placeholder="동아리명으로 검색"
          aria-label="동아리명 검색"
          onChange={(event) => setKeyword(event.target.value)}
        />
        <SelectBox width={200}>
          <Select
            value={room}
            aria-label="사용 교실"
            data-empty={room === "" ? "" : undefined}
            onChange={(event) => setRoom(event.target.value)}
          >
            <option value="">사용 교실 전체</option>
            {roomOptions.map((option) => (
              <option key={option} value={option}>
                {formatClubRoom(option)}
              </option>
            ))}
          </Select>
        </SelectBox>
        <SelectBox width={220}>
          <Select
            value={teacher}
            aria-label="담당 선생님"
            data-empty={teacher === "" ? "" : undefined}
            onChange={(event) => setTeacher(event.target.value)}
          >
            <option value="">담당 선생님 전체</option>
            {teacherOptions.map((option) => (
              <option key={option.id} value={String(option.id)}>
                {option.name}
              </option>
            ))}
            {hasNoTeacher && <option value={NO_TEACHER}>미지정</option>}
          </Select>
        </SelectBox>
        <SecondaryButton type="submit">검색</SecondaryButton>
      </FilterBar>
      <ListHint>
        사용 교실은 한 동아리만 쓸 수 있습니다. 이미 배정된 교실은 등록·수정 화면
        목록에 나오지 않습니다.
      </ListHint>

      <ClubTable aria-label="동아리 목록">
        <thead>
          <tr>
            <th scope="col">동아리명</th>
            <th scope="col">사용 교실</th>
            <th scope="col">팀장</th>
            <th scope="col">구성원</th>
            <th scope="col">담당 선생님</th>
            <th scope="col">
              <VisuallyHidden>관리</VisuallyHidden>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((club) => (
            <tr key={club.id}>
              <td title={club.name}>{club.name}</td>
              <td>{club.room ? formatClubRoom(club.room) : "—"}</td>
              <td>{club.manager?.name ?? "—"}</td>
              <td>{getClubMembers(club).length}명</td>
              <td>{club.teacher?.name ?? <Muted>미지정</Muted>}</td>
              <td>
                <RowActions>
                  <RowEditLink
                    href={`/club/${club.id}/edit`}
                    aria-label={`${club.name} 수정`}
                  >
                    수정
                  </RowEditLink>
                  <RowDeleteButton
                    type="button"
                    aria-label={`${club.name} 삭제`}
                    onClick={() => setDeleteTarget(club)}
                  >
                    삭제
                  </RowDeleteButton>
                </RowActions>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <EmptyCell colSpan={6}>
                {loadError ? (
                  <CellStatus role="alert">
                    {loadError}
                    <SecondaryButton
                      type="button"
                      onClick={() => {
                        setLoadError("");
                        setReloadKey((key) => key + 1);
                      }}
                    >
                      다시 시도
                    </SecondaryButton>
                  </CellStatus>
                ) : clubs === null ? (
                  "동아리 목록을 불러오는 중입니다."
                ) : isFiltered ? (
                  "검색 결과가 없습니다."
                ) : (
                  "등록된 동아리가 없습니다."
                )}
              </EmptyCell>
            </tr>
          )}
        </tbody>
      </ClubTable>

      {deleteTarget && (
        <DeleteClubModal
          club={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => {
            // 지운 행은 바로 빼고, 그 사이 바뀐 내용까지 맞추도록 목록을 다시 받음
            setClubs(
              (prev) => prev && prev.filter((club) => club.id !== deleteTarget.id),
            );
            setReloadKey((key) => key + 1);
            // 지운 행의 삭제 버튼이 사라져 포커스가 갈 곳이 없으므로 검색창으로 옮김
            keywordInputRef.current?.focus();
          }}
        />
      )}
    </ClubPage>
  );
}
