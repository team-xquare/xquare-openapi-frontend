# xquare-openapi-frontend

npm workspaces와 Turborepo로 묶은 모노레포예요.

| 경로 | 내용 |
| --- | --- |
| `apps/user` | Open API 문서·활용신청 사이트 (dev 3000) |
| `apps/admin` | 학교 데이터 관리자 (dev 3001) |

## 실행

```bash
npm install
npm run dev                          # 모든 앱
npx turbo run dev --filter=admin     # 앱 하나만
npm run build
npm run start                        # 빌드 후 모든 앱 실행
npm run lint
```

의존성은 루트에서 설치하고, 앱에만 필요한 패키지는 `npm install <패키지> -w user`(또는 `-w admin`)로 추가해요.
