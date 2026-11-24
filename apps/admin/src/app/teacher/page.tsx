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
import type { PageResponse } from "@/lib/api-types";
import {
  fetchTeachers,
  type TeacherResponse,
  type TeacherSubject,
} from "@/lib/teachers-api";
import { DeleteTeacherModal } from "./delete-teacher-modal";
import {
  TEACHER_CLASS_NUMBERS,
  TEACHER_GRADES,
  TEACHER_POSITION_LABELS,
  TEACHER_SUBJECT_LABELS,
  formatHomeroom,
} from "./teacher-content";
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
  RetryButton,
  RowActions,
  SearchButton,
  SearchInput,
  TeacherPage,
  TeacherTable,
  Total,
  Unassigned,
} from "./page-style";

const PAGE_SIZE = 5;

// 과목 필터 선택지 (Figma 순서)
const FILTER_SUBJECTS: TeacherSubject[] = [
  "MATH",
  "JAVA",
  "ENGLISH",
  "ALGEBRA",
  "MUSIC",
];

export default function TeacherListPage() {
  const router = useRouter();
  // 지금 보이는 한 페이지. 처음 불러오기 전에는 null이고,
  // 페이지를 넘기거나 검색하는 동안에는 이전 결과를 그대로 보여 줌
  const [data, setData] = useState<PageResponse<TeacherResponse> | null>(
    null,
  );
  const [loadError, setLoadError] = useState("");
  // 바뀌면 목록을 다시 불러옴 (다시 시도 · 삭제 후)
  const [reloadKey, setReloadKey] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [grade, setGrade] = useState("all");
  const [classNumber, setClassNumber] = useState("all");
  const [subject, setSubject] = useState<TeacherSubject | "all">("all");
  const [office, setOffice] = useState("");
  const [query, setQuery] = useState({
    keyword: "",
    grade: "all",
    classNumber: "all",
    subject: "all" as TeacherSubject | "all",
    office: "",
  });
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<TeacherResponse | null>(
    null,
  );
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 교직원 API가 이름 · 학년 · 반 · 과목 · 교무실 검색과 페이지 나누기를 다 받아서
  // 지금 페이지만 서버에서 받음. 다른 화면에서 돌아와 다시 보일 때도 다시 돌아 최신 목록을 받음
  useEffect(() => {
    // 로그인 여부는 저장소를 읽어야 해서 렌더 중이 아니라 effect에서 확인
    if (!api.auth.isLoggedIn()) {
      router.replace("/login");
      return;
    }
    const request = new AbortController();
    fetchTeachers(
      {
        name: query.keyword,
        grade: query.grade === "all" ? undefined : Number(query.grade),
        classNum:
          query.classNumber === "all" ? undefined : Number(query.classNumber),
        subject: query.subject === "all" ? undefined : query.subject,
        office: query.office,
        // 화면은 1부터, 서버는 0부터 셈
        page: page - 1,
        size: PAGE_SIZE,
      },
      request.signal,
    )
      .then((loaded) => {
        // 그 사이 교직원이 지워져 지금 페이지가 비면 마지막 페이지로 옮김
        if (
          loaded.content.length === 0 &&
          page > 1 &&
          loaded.totalPage < page
        ) {
          setPage(Math.max(1, loaded.totalPage));
          return;
        }
        setData(loaded);
        setLoadError("");
      })
      .catch((error: unknown) => {
        if (isAbortError(error) || request.signal.aborted) return;
        setLoadError(
          errorMessage(error, "교직원 목록을 불러오지 못했습니다."),
        );
      });
    return () => request.abort();
  }, [router, query, page, reloadKey]);

  // 다른 페이지로 이동해도 화면이 숨겨진 채 상태가 남으므로,
  // 열려 있던 삭제 모달이 돌아왔을 때 다시 뜨지 않도록 숨겨질 때 닫음
  useLayoutEffect(() => {
    return () => setDeleteTarget(null);
  }, []);

  // 불러오지 못했으면 이전 결과 대신 실패 문구를 보여 줌
  const rows = loadError ? [] : (data?.content ?? []);
  const pageCount = Math.max(1, data?.totalPage ?? 1);
  const currentPage = Math.min(page, pageCount);

  const changePage = (nextPage: number) => {
    setLoadError("");
    setPage(nextPage);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoadError("");
    setQuery({
      keyword: keyword.trim(),
      grade,
      classNumber,
      subject,
      office: office.trim(),
    });
    setPage(1);
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
          ref={searchInputRef}
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
          {TEACHER_GRADES.map((option) => (
            <option key={option} value={option}>
              {option}학년
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          aria-label="반 필터"
          value={classNumber}
          onChange={(event) => setClassNumber(event.target.value)}
        >
          <option value="all">반 전체</option>
          {TEACHER_CLASS_NUMBERS.map((option) => (
            <option key={option} value={option}>
              {option}반
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          aria-label="과목 필터"
          value={subject}
          onChange={(event) =>
            setSubject(event.target.value as TeacherSubject | "all")
          }
        >
          <option value="all">과목 전체</option>
          {FILTER_SUBJECTS.map((option) => (
            <option key={option} value={option}>
              {TEACHER_SUBJECT_LABELS[option]}
            </option>
          ))}
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
                {formatHomeroom(teacher) ?? <Unassigned>담임 아님</Unassigned>}
              </td>
              <td>
                {teacher.subject ? (
                  TEACHER_SUBJECT_LABELS[teacher.subject]
                ) : (
                  <Unassigned>없음</Unassigned>
                )}
              </td>
              <td>{teacher.office}</td>
              <td>
                {teacher.position ? (
                  TEACHER_POSITION_LABELS[teacher.position]
                ) : (
                  <Unassigned>없음</Unassigned>
                )}
              </td>
              <td>
                {teacher.club ? (
                  teacher.club.name
                ) : (
                  <Unassigned>없음</Unassigned>
                )}
              </td>
              <td>{teacher.manager && <LeaderBadge>부장</LeaderBadge>}</td>
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
              <EmptyCell colSpan={8}>
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
                ) : data === null ? (
                  "교직원 목록을 불러오는 중입니다."
                ) : (
                  "검색 결과가 없습니다."
                )}
              </EmptyCell>
            </tr>
          )}
        </tbody>
      </TeacherTable>

      <Pager>
        <Total role="status">전체 {data?.totalCount ?? 0}명</Total>
        <PageList aria-label="페이지">
          <PageButton
            type="button"
            disabled={currentPage === 1}
            onClick={() => changePage(currentPage - 1)}
          >
            이전
          </PageButton>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map(
            (pageNumber) => (
              <PageButton
                key={pageNumber}
                type="button"
                aria-current={pageNumber === currentPage ? "page" : undefined}
                onClick={() => changePage(pageNumber)}
              >
                {pageNumber}
              </PageButton>
            ),
          )}
          <PageButton
            type="button"
            disabled={currentPage === pageCount}
            onClick={() => changePage(currentPage + 1)}
          >
            다음
          </PageButton>
        </PageList>
      </Pager>

      {deleteTarget && (
        <DeleteTeacherModal
          teacher={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => {
            // 지운 행은 바로 빼고, 그 사이 바뀐 내용까지 맞추도록 목록을 다시 받음
            setData(
              (prev) =>
                prev && {
                  ...prev,
                  content: prev.content.filter(
                    (teacher) => teacher.id !== deleteTarget.id,
                  ),
                  totalCount: prev.totalCount - 1,
                },
            );
            setReloadKey((key) => key + 1);
            // 지운 행의 삭제 버튼이 사라져 포커스가 갈 곳이 없으므로 검색창으로 옮김
            searchInputRef.current?.focus();
          }}
        />
      )}
    </TeacherPage>
  );
}
