import { ErrorView } from "./error-view";

// 없는 경로이거나 notFound()를 호출했을 때
export default function NotFound() {
  return <ErrorView status={404} />;
}
