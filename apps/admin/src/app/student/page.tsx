"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { errorMessage, isAbortError } from "@/lib/api-error";
import type { PageResponse } from "@/lib/api-types";
import { fetchStudents, type StudentResponse } from "@/lib/students-api";
import { CellStatus } from "@/components/request-status/request-status-style";
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
  RetryButton,
  SearchButton,
  SearchInput,
  StudentPage,
  StudentTable,
  Total,
} from "./page-style";

const PAGE_SIZE = 5;
// 학생이 수백 명이라 페이지 번호는 10개씩 끊어 보여 줌
const PAGE_GROUP_SIZE = 10;

export default function StudentListPage() {
  const router = useRouter();
  // 지금 페이지의 학생 목록. 처음 불러오기 전에는 null
  const [list, setList] = useState<PageResponse<StudentResponse> | null>(null);
  const [loadError, setLoadError] = useState("");
  // 바뀌면 목록을 다시 불러옴 (다시 시도 · 검색 · 삭제 후)
  const [reloadKey, setReloadKey] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [grade, setGrade] = useState("all");
  const [classNumber, setClassNumber] = useState("all");
  const [query, setQuery] = useState({
    keyword: "",
    grade: "all",
    classNumber: "all",
  });
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<StudentResponse | null>(
    null,
  );
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 학생이 많아 검색 · 페이지 나누기는 서버에 맡김.
  // 다른 화면에서 돌아와 다시 보일 때도 effect가 다시 돌아 최신 목록을 받음
  useEffect(() => {
    // 로그인 여부는 저장소를 읽어야 해서 렌더 중이 아니라 effect에서 확인
    if (!api.auth.isLoggedIn()) {
      router.replace("/login");
      return;
    }
    const request = new AbortController();
    fetchStudents(
      {
        name: query.keyword,
        grade: query.grade === "all" ? undefined : Number(query.grade),
        classNum:
          query.classNumber === "all" ? undefined : Number(query.classNumber),
        page: page - 1,
        size: PAGE_SIZE,
      },
      request.signal,
    )
      .then((response) => {
        // 삭제로 마지막 페이지가 비면 그 앞 페이지를 다시 받음
        if (response.content.length === 0 && page > 1) {
          setPage(Math.max(1, Math.min(page - 1, response.totalPage)));
          return;
        }
        setList(response);
        setLoadError("");
      })
      .catch((error: unknown) => {
        if (isAbortError(error) || request.signal.aborted) return;
        setLoadError(errorMessage(error, "학생 목록을 불러오지 못했습니다."));
      });
    return () => request.abort();
  }, [router, reloadKey, query, page]);

  // 다른 페이지로 이동해도 화면이 숨겨진 채 상태가 남으므로,
  // 돌아왔을 때 전에 연 삭제 모달이 그대로 뜨지 않도록 숨겨질 때 닫음 (삭제 요청은 모달이 취소함)
  useLayoutEffect(() => {
    return () => setDeleteTarget(null);
  }, []);

  // 불러오지 못했으면 지난 목록 대신 실패 문구를 보여 줌
  const rows = loadError ? [] : (list?.content ?? []);
  const pageCount = Math.max(1, list?.totalPage ?? 1);
  const currentPage = Math.min(page, pageCount);
  const groupStart =
    Math.floor((currentPage - 1) / PAGE_GROUP_SIZE) * PAGE_GROUP_SIZE + 1;
  const pageNumbers = Array.from(
    { length: Math.min(PAGE_GROUP_SIZE, pageCount - groupStart + 1) },
    (_, index) => groupStart + index,
  );
  const isFiltered =
    query.keyword !== "" ||
    query.grade !== "all" ||
    query.classNumber !== "all";

  const removeStudent = (student: StudentResponse) => {
    setDeleteTarget(student);
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
          // 같은 조건으로 다시 검색해도 새로 받음
          setReloadKey((key) => key + 1);
        }}
      >
        <SearchInput
          ref={searchInputRef}
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
                {student.grade}학년 {student.classNum}반 {student.number}번
              </td>
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td>{student.club?.name ?? "없음"}</td>
              <td>
                <Actions>
                  <EditLink href={`/student/${student.id}/edit`}>수정</EditLink>
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
              <EmptyCell colSpan={5}>
                {loadError ? (
                  <CellStatus role="alert">
                    {loadError}
                    <RetryButton
                      type="button"
                      onClick={() => {
                        setLoadError("");
                        setReloadKey((key) => key + 1);
                      }}
                    >
                      다시 시도
                    </RetryButton>
                  </CellStatus>
                ) : list === null ? (
                  "학생 목록을 불러오는 중입니다."
                ) : isFiltered ? (
                  "검색 결과가 없습니다."
                ) : (
                  "등록된 학생이 없습니다."
                )}
              </EmptyCell>
            </tr>
          )}
        </tbody>
      </StudentTable>

      <Pager>
        <Total role="status">전체 {list?.totalCount ?? 0}명</Total>
        <PageList aria-label="페이지">
          <PageButton
            type="button"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            이전
          </PageButton>
          {pageNumbers.map((pageNumber) => (
            <PageButton
              key={pageNumber}
              type="button"
              aria-current={pageNumber === currentPage ? "page" : undefined}
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </PageButton>
          ))}
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
        <DeleteStudentModal
          student={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => {
            // 지운 행은 바로 빼고, 다음 페이지 학생으로 빈 자리를 채우도록 목록을 다시 받음
            setList(
              (prev) =>
                prev && {
                  ...prev,
                  content: prev.content.filter(
                    (student) => student.id !== deleteTarget.id,
                  ),
                  totalCount: Math.max(0, prev.totalCount - 1),
                },
            );
            setReloadKey((key) => key + 1);
            // 지운 행의 삭제 버튼이 사라져 포커스가 갈 곳이 없으므로 검색창으로 옮김
            searchInputRef.current?.focus();
          }}
        />
      )}
    </StudentPage>
  );
}
