type QueryValue = string | number | boolean | null | undefined;

// 목록 API의 검색 조건을 주소 뒤에 붙임. 빈 값은 빼고, 배열은 같은 이름으로 여러 번 붙임
export function withQuery(
  path: string,
  params: Record<string, QueryValue | QueryValue[]>,
) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const values = Array.isArray(value) ? value : [value];
    for (const item of values) {
      if (item === null || item === undefined || item === "") continue;
      search.append(key, String(item));
    }
  }
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}
