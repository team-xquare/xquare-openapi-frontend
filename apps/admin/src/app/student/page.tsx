"use client";

import { useState } from "react";
import { STUDENTS, type Student } from "./student-content";
import { DeleteStudentModal } from "./delete-student-modal";
import {
  Actions,
  DeleteButton,
  EditLink,
  EmptyCell,
  FilterBar,
  FilterSelect,
  Heading,
  Notice,
  PageButton,
  PageDescription,
  PageHead,
  PageList,
  PageTitle,
  Pager,
  PrimaryLink,
  SearchButton,
  SearchInput,
  StudentPage,
  StudentTable,
  Total,
} from "./page-style";

const PAGE_SIZE = 5;
export default function StudentListPage() {
  const [students, setStudents] = useState(STUDENTS);
  const [keyword, setKeyword] = useState("");
  const [grade, setGrade] = useState("all");
  const [classNumber, setClassNumber] = useState("all");
  const [query, setQuery] = useState({
    keyword: "",
    grade: "all",
    classNumber: "all",
  });
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);

  const filtered = students.filter(
    (student) =>
      (!query.keyword || student.name.includes(query.keyword)) &&
      (query.grade === "all" || String(student.grade) === query.grade) &&
      (query.classNumber === "all" ||
        String(student.classNumber) === query.classNumber),
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const removeStudent = (student: Student) => {
    setDeleteTarget(student);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setStudents((current) =>
      current.filter((item) => item.id !== deleteTarget.id),
    );
    setDeleteTarget(null);
  };

  return (
    <StudentPage>
      <PageHead>
        <Heading>
          <PageTitle>학생 관리</PageTitle>
          <PageDescription>학생 정보를 관리합니다.</PageDescription>
        </Heading>
        <PrimaryLink href="/student/new">학생 등록</PrimaryLink>
      </PageHead>

      <FilterBar
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          setQuery({ keyword: keyword.trim(), grade, classNumber });
          setPage(1);
        }}
      >
        <SearchInput
          type="search"
          value={keyword}
          placeholder="이름으로 검색"
          aria-label="학생 이름 검색"
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
          <option value="4">4반</option>
        </FilterSelect>
        <SearchButton type="submit">검색</SearchButton>
      </FilterBar>

      <Notice>
        생일은 개인정보라 목록에 표시하지 않고 수정 화면에서만 보입니다. 소속
        동아리는 읽기 전용이며 동아리 관리에서 바꿉니다.
      </Notice>

      <StudentTable aria-label="학생 목록">
        <thead>
          <tr>
            <th>학년/반/번호</th>
            <th>학과</th>
            <th>이름</th>
            <th>학교 이메일</th>
            <th>소속 동아리</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((student) => (
            <tr key={student.id}>
              <td>
                {student.grade}학년 {student.classNumber}반 {student.number}번
              </td>
              <td>{student.department}</td>
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td>{student.club}</td>
              <td>
                <Actions>
                  <EditLink href={`/student/${student.id}/edit`}>
                    수정
                  </EditLink>
                  <DeleteButton
                    type="button"
                    onClick={() => removeStudent(student)}
                  >
                    삭제
                  </DeleteButton>
                </Actions>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <EmptyCell colSpan={6}>검색 결과가 없습니다.</EmptyCell>
            </tr>
          )}
        </tbody>
      </StudentTable>

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

      <DeleteStudentModal
        student={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

    </StudentPage>
  );
}
