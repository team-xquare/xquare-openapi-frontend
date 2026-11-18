# xquare-openapi-frontend

npm workspaces와 Turborepo로 묶은 모노레포예요.

| 경로 | 내용 |
| --- | --- |
| `apps/user` | Open API 문서·활용신청 사이트 (dev 3000) |
| `apps/admin` | 학교 데이터 관리자 (dev 3001) |
| `packages/api` | 두 앱이 같이 쓰는 API 클라이언트 (`@xquare/api`) |

## 실행

```bash
npm install
npm run dev                          # 모든 앱
npx turbo run dev --filter=admin     # 앱 하나만
npm run build
npm run start                        # 빌드된 앱 실행 (먼저 npm run build)
npm run lint
```

의존성은 루트에서 설치하고, 앱에만 필요한 패키지는 `npm install <패키지> -w user`(또는 `-w admin`)로 추가해요.

## API 호출

API는 앱마다 만들어 둔 `api`로 불러요. 로그인 토큰을 붙이고, 액세스 토큰이 만료되면(401 `INVALID_TOKEN`) 알아서 재발급한 뒤 한 번 다시 요청해요. 재발급까지 실패하면 토큰을 지우고 `/login`으로 보내요.

```ts
import { ApiError } from "@xquare/api";
import { api } from "@/lib/api"; // apps/user, apps/admin 각각 src/lib/api.ts

const students = await api.get<StudentPageResponse>("/students?page=0");
await api.post("/students", { name: "장윤호", studentNumber: 2315 });
await api.patch(`/students/${id}`, { name: "장윤호" });
await api.delete(`/students/${id}`);

// 로그인 · 회원가입처럼 토큰 없이 부르는 API는 auth: false
await api.post("/auth/email/otp", { email }, { auth: false });

try {
  await api.get("/clubs");
} catch (error) {
  // 서버 에러는 { code, message } 그대로. 서버에 닿지 못하면 status 0, code NETWORK_ERROR
  if (error instanceof ApiError) alert(error.message);
}
```

- 로그인 · 로그아웃: `api.auth.login({ username, password })`, `api.auth.logout()`, `api.auth.isLoggedIn()`
- 서버 주소는 `NEXT_PUBLIC_API_BASE_URL`(예: `apps/user/.env.local`)로 바꿀 수 있고, 없으면 스테이징 `https://openapi-backend-stag.dsmhs.kr`을 써요
- API 명세는 백엔드 Swagger를 기준으로 봐요
- 서버는 없는 주소도 401 `INVALID_TOKEN`으로 답해서, 경로를 잘못 쓰면 토큰 재발급이 한 번 일어나고 401 에러가 나요. 401이 계속 나면 경로부터 확인해 주세요
- 로그인이 안 된 상태에서 토큰이 필요한 API를 부르면 401 에러만 던지고 로그인 화면으로 보내지는 않아요. 로그인이 꼭 필요한 화면은 `useEffect`에서 `api.auth.isLoggedIn()`을 확인해 직접 보내 주세요 (렌더 중에 부르면 서버 렌더 결과와 달라져요)
- 파일 업로드는 `FormData`를 본문으로 넘기면 그대로 보내요
- 클라이언트 테스트: `npm test -w @xquare/api`
