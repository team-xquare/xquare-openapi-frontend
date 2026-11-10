"use client";

import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import {
  CLUBS,
  findStudent,
  getClubMembers,
  type Club,
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

// 담당 선생님 필터에서 '미지정'만 고르는 값 (교직원 이름과 겹치지 않게)
const NO_TEACHER = "__none__";

const EMPTY_FILTER = { keyword: "", room: "", teacher: "" };

export default function ClubListPage() {
  // API 연동 전이라 삭제는 화면의 더미 목록에서만 빠짐
  const [clubs, setClubs] = useState(CLUBS);
  const [keyword, setKeyword] = useState("");
  const [room, setRoom] = useState("");
  const [teacher, setTeacher] = useState("");
  const [filter, setFilter] = useState(EMPTY_FILTER);
  const [deleteTarget, setDeleteTarget] = useState<Club | null>(null);
  const keywordInputRef = useRef<HTMLInputElement>(null);

  // 다른 페이지로 이동해도 화면이 숨겨진 채 상태가 남으므로,
  // 열려 있던 삭제 모달이 돌아왔을 때 배경 없이 남지 않도록 숨겨질 때 닫음
  useLayoutEffect(() => {
    return () => setDeleteTarget(null);
  }, []);

  const roomOptions = clubs.map((club) => club.room);
  const teacherOptions = clubs.flatMap((club) =>
    club.teacher ? [club.teacher] : [],
  );
  const hasNoTeacher = clubs.some((club) => !club.teacher);

  const normalizedKeyword = filter.keyword.toLowerCase();
  const rows = clubs.filter(
    (club) =>
      club.name.toLowerCase().includes(normalizedKeyword) &&
      (!filter.room || club.room === filter.room) &&
      (!filter.teacher ||
        (filter.teacher === NO_TEACHER
          ? !club.teacher
          : club.teacher === filter.teacher)),
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
                {option}
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
              <option key={option} value={option}>
                {option}
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
              <td>{club.room}</td>
              <td>{findStudent(club.leaderId)?.name ?? "—"}</td>
              <td>{getClubMembers(club).length}명</td>
              <td>{club.teacher ?? <Muted>미지정</Muted>}</td>
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
                {isFiltered ? "검색 결과가 없습니다." : "등록된 동아리가 없습니다."}
              </EmptyCell>
            </tr>
          )}
        </tbody>
      </ClubTable>

      {deleteTarget && (
        <DeleteClubModal
          name={deleteTarget.name}
          room={deleteTarget.room}
          memberCount={getClubMembers(deleteTarget).length}
          teacher={deleteTarget.teacher}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            setClubs((prev) => prev.filter((club) => club.id !== deleteTarget.id));
            // 지운 행의 삭제 버튼이 사라져 포커스가 갈 곳이 없으므로 검색창으로 옮김
            keywordInputRef.current?.focus();
          }}
        />
      )}
    </ClubPage>
  );
}
