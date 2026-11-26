// 여러 API가 같이 쓰는 응답 형태

// 목록 API의 페이지 응답 (page는 0부터)
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalCount: number;
  totalPage: number;
}

// 서버가 한 번에 주는 최대 건수
export const MAX_PAGE_SIZE = 100;

// 페이지 목록을 끝까지 받아 하나로 합침 (화면에서 검색 · 정렬할 때)
export async function fetchAllPages<T>(
  fetchPage: (page: number) => Promise<PageResponse<T>>,
) {
  const items: T[] = [];
  for (let page = 0; ; page += 1) {
    const response = await fetchPage(page);
    items.push(...response.content);
    if (page + 1 >= response.totalPage) return items;
  }
}

// 동아리 · 학생 · 교직원 응답에 들어가는 소속 동아리 요약
export interface ClubSummaryResponse {
  id: number;
  name: string;
  logo: string;
}
