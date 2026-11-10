"use client";

import { useState, type FormEvent } from "react";
import { TEACHERS } from "./teacher-content";
import { DeleteModal } from "@/components/delete-modal";
import {
  DeleteButton,
  EditLink,
  EmptyCell,
  FilterBar,
  FilterSelect,
  Heading,
  LeaderBadge,
  Notice,
  OfficeInput,
  PageButton,
  PageDescription,
  PageHead,
  PageList,
  PageTitle,
  Pager,
  PrimaryLink,
  RowActions,
  SearchButton,
  SearchInput,
  TeacherPage,
  TeacherTable,
  Total,
  Unassigned,
} from "./page-style";

const PAGE_SIZE = 5;

export default function TeacherListPage() {
  const [teachers, setTeachers] = useState(TEACHERS);
  const [keyword, setKeyword] = useState("");
  const [grade, setGrade] = useState("all");
  const [classNumber, setClassNumber] = useState("all");
  const [subject, setSubject] = useState("all");
  const [office, setOffice] = useState("");
  const [query, setQuery] = useState({
    keyword: "",
    grade: "all",
    classNumber: "all",
    subject: "all",
    office: "",
  });
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<
    (typeof TEACHERS)[number] | null
  >(null);

  const filtered = teachers.filter(
    (teacher) =>
      (!query.keyword || teacher.name.includes(query.keyword)) &&
      (query.grade === "all" || String(teacher.grade) === query.grade) &&
      (query.classNumber === "all" ||
        String(teacher.classNumber) === query.classNumber) &&
      (query.subject === "all" || teacher.subject === query.subject) &&
      (!query.office || teacher.office.includes(query.office)),
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuery({
      keyword: keyword.trim(),
      grade,
      classNumber,
      subject,
      office: office.trim(),
    });
    setPage(1);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setTeachers((current) =>
      current.filter((teacher) => teacher.id !== deleteTarget.id),
    );
    setDeleteTarget(null);
  };

  return (
    <TeacherPage>
      <PageHead>
        <Heading>
          <PageTitle>교직원 관리</PageTitle>
          <PageDescription>교직원 정보를 관리합니다.</PageDescription>
        </Heading>
        <PrimaryLink href="/teacher/new">교직원 등록</PrimaryLink>
      </PageHead>

      <FilterBar role="search" onSubmit={handleSearch}>
        <SearchInput
          type="search"
          value={keyword}
          placeholder="이름으로 검색"
          aria-label="교직원 이름 검색"
          onChange={(event) => setKeyword(event.target.value)}
        />
        <FilterSelect
          aria-label="학년 필터"
          value={grade}
          onChange={(event) => setGrade(event.target.value)}
        >
          <option value="all">학년 전체</option>
          <option value="1">1학년</option>
          <option value="2">2학년</option>
          <option value="3">3학년</option>
        </FilterSelect>
        <FilterSelect
          aria-label="반 필터"
          value={classNumber}
          onChange={(event) => setClassNumber(event.target.value)}
        >
          <option value="all">반 전체</option>
          <option value="1">1반</option>
          <option value="2">2반</option>
          <option value="3">3반</option>
        </FilterSelect>
        <FilterSelect
          aria-label="과목 필터"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
        >
          <option value="all">과목 전체</option>
          <option value="수학">수학</option>
          <option value="자바">자바</option>
          <option value="영어">영어</option>
          <option value="대수">대수</option>
          <option value="음악">음악</option>
        </FilterSelect>
        <OfficeInput
          value={office}
          placeholder="교무실"
          aria-label="교무실 검색"
          onChange={(event) => setOffice(event.target.value)}
        />
        <SearchButton type="submit">검색</SearchButton>
      </FilterBar>

      <Notice>
        담당 동아리는 읽기 전용입니다. 동아리 관리에서 담당 선생님을 지정하면
        여기에 반영됩니다.
      </Notice>

      <TeacherTable aria-label="교직원 목록">
        <thead>
          <tr>
            <th>이름</th>
            <th>담당 학년·반</th>
            <th>담당 과목</th>
            <th>교무실</th>
            <th>직책</th>
            <th>담당 동아리</th>
            <th>부장</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((teacher) => (
            <tr key={teacher.id}>
              <td>{teacher.name}</td>
              <td>
                {teacher.grade ? (
                  `${teacher.grade}학년 ${teacher.classNumber}반`
                ) : (
                  <Unassigned>담임 아님</Unassigned>
                )}
              </td>
              <td>{teacher.subject}</td>
              <td>{teacher.office}</td>
              <td>{teacher.position}</td>
              <td>
                {teacher.club === "없음" ? (
                  <Unassigned>없음</Unassigned>
                ) : (
                  teacher.club
                )}
              </td>
              <td>{teacher.isClubLeader && <LeaderBadge>부장</LeaderBadge>}</td>
              <td>
                <RowActions>
                  <EditLink href={`/teacher/${teacher.id}/edit`}>수정</EditLink>
                  <DeleteButton
                    type="button"
                    onClick={() => setDeleteTarget(teacher)}
                  >
                    삭제
                  </DeleteButton>
                </RowActions>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <EmptyCell colSpan={8}>검색 결과가 없습니다.</EmptyCell>
            </tr>
          )}
        </tbody>
      </TeacherTable>

      <Pager>
        <Total role="status">전체 {filtered.length}명</Total>
        <PageList aria-label="페이지">
          <PageButton
            type="button"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            이전
          </PageButton>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map(
            (pageNumber) => (
              <PageButton
                key={pageNumber}
                type="button"
                aria-current={pageNumber === currentPage ? "page" : undefined}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </PageButton>
            ),
          )}
          <PageButton
            type="button"
            disabled={currentPage === pageCount}
            onClick={() => setPage(currentPage + 1)}
          >
            다음
          </PageButton>
        </PageList>
      </Pager>

      {deleteTarget && (
        <DeleteModal
          title={`${deleteTarget.name} 교직원을 삭제할까요?`}
          relations={[
            {
              title: `담당 동아리 ${deleteTarget.club}`,
              description: `${deleteTarget.club}의 담당 선생님이 미지정으로 바뀝니다`,
            },
            {
              title: "자습 감독 배정",
              description: "해당 교직원의 자습 감독 배정이 함께 정리됩니다",
            },
            ...(deleteTarget.grade
              ? [
                  {
                    title: `${deleteTarget.grade}학년 ${deleteTarget.classNumber}반 담임`,
                    description: "담임 정보가 함께 지워집니다",
                  },
                ]
              : []),
          ]}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </TeacherPage>
  );
}
