// user · admin 앱이 같이 쓰는 API 클라이언트
// - 로그인 토큰(액세스 · 리프레시)을 저장하고 요청에 붙임
// - 액세스 토큰이 만료돼 401 INVALID_TOKEN이 오면 /auth/reissue로 재발급하고 한 번 다시 요청
// - 서버 에러는 { code, message } 형식이라 ApiError 하나로 통일
// 앱마다 createApiClient로 인스턴스를 만들어 씀 (apps/*/src/lib/api.ts)

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TokenStorage {
  get(): AuthTokens | null;
  set(tokens: AuthTokens): void;
  clear(): void;
}

export class ApiError extends Error {
  // HTTP 상태 코드. 서버에 닿지 못했으면 0
  status: number;
  // 서버 에러 코드 (INVALID_CREDENTIALS, ACCOUNT_LOCKED 등)
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export const NETWORK_ERROR = "NETWORK_ERROR";

// 액세스 토큰이 없거나 만료 · 위조됐을 때 서버가 주는 코드.
// 로그인 실패(INVALID_CREDENTIALS)나 리프레시 토큰 만료(INVALID_REFRESH_TOKEN)도 401이라 코드로 구분함
const INVALID_TOKEN = "INVALID_TOKEN";
const NETWORK_ERROR_MESSAGE =
  "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.";
const UNKNOWN_ERROR_MESSAGE = "요청을 처리하지 못했습니다.";

function isAuthTokens(value: unknown): value is AuthTokens {
  if (typeof value !== "object" || value === null) return false;
  const tokens = value as Record<string, unknown>;
  return (
    typeof tokens.accessToken === "string" &&
    typeof tokens.refreshToken === "string"
  );
}

// 브라우저 localStorage에 토큰을 저장. 서버 렌더링 중이거나 저장소를 못 쓰면 로그인 안 된 것으로 봄
export function createLocalTokenStorage(key: string): TokenStorage {
  const storage = () =>
    typeof window === "undefined" ? null : window.localStorage;

  return {
    get() {
      try {
        const raw = storage()?.getItem(key);
        if (!raw) return null;
        const parsed: unknown = JSON.parse(raw);
        return isAuthTokens(parsed) ? parsed : null;
      } catch {
        return null;
      }
    },
    set(tokens) {
      try {
        storage()?.setItem(key, JSON.stringify(tokens));
      } catch {
        // 시크릿 모드 등에서 저장이 막히면 로그인이 유지되지 않음 (다음 요청부터 토큰 없이 나감)
      }
    },
    clear() {
      try {
        storage()?.removeItem(key);
      } catch {
        // 지울 수 없으면 그대로 둠
      }
    },
  };
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions {
  method?: HttpMethod;
  // 보낼 본문. 객체는 JSON으로, FormData · Blob · URLSearchParams는 그대로 보냄 (파일 업로드)
  body?: unknown;
  // 로그인 토큰을 붙일지. 로그인 · 회원가입처럼 토큰 없이 부르는 API는 false
  auth?: boolean;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

type MethodOptions = Omit<RequestOptions, "method" | "body">;

export interface ApiClientOptions {
  baseUrl: string;
  storage: TokenStorage;
  // 토큰 재발급까지 실패해 다시 로그인해야 할 때 (로그인 화면으로 보내기 등)
  onSessionExpired?: () => void;
  // 테스트에서 가짜 fetch를 넣을 때
  fetch?: typeof fetch;
}

export type ApiClient = ReturnType<typeof createApiClient>;

// 브라우저가 직접 형식을 정하는 본문 (multipart 경계 등). JSON으로 바꾸면 안 됨
function isRawBody(body: unknown): body is BodyInit {
  return (
    (typeof FormData !== "undefined" && body instanceof FormData) ||
    (typeof Blob !== "undefined" && body instanceof Blob) ||
    (typeof URLSearchParams !== "undefined" &&
      body instanceof URLSearchParams) ||
    body instanceof ArrayBuffer
  );
}

// 재발급을 서버가 거절해 다시 로그인해야 하는 경우. 5xx · 429 같은 일시 오류는 해당 안 됨
function isSessionRejected(error: unknown) {
  return (
    error instanceof ApiError && (error.status === 400 || error.status === 401)
  );
}

export function createApiClient(options: ApiClientOptions) {
  const baseUrl = options.baseUrl.replace(/\/+$/, "");
  const doFetch: typeof fetch =
    options.fetch ?? ((input, init) => fetch(input, init));
  let refreshing: Promise<void> | null = null;

  async function send(
    path: string,
    init: RequestOptions,
    accessToken?: string,
  ): Promise<Response> {
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...init.headers,
    };
    let body: BodyInit | undefined;
    if (isRawBody(init.body)) {
      body = init.body;
    } else if (init.body !== undefined) {
      body = JSON.stringify(init.body);
      headers["Content-Type"] = "application/json";
    }
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    try {
      return await doFetch(`${baseUrl}${path}`, {
        method: init.method ?? "GET",
        headers,
        body,
        signal: init.signal,
      });
    } catch (error) {
      // 요청을 직접 취소한 건 네트워크 오류가 아니라서 그대로 넘김
      if (error instanceof Error && error.name === "AbortError") throw error;
      throw new ApiError(0, NETWORK_ERROR, NETWORK_ERROR_MESSAGE);
    }
  }

  async function toError(response: Response): Promise<ApiError> {
    let code = `HTTP_${response.status}`;
    let message = UNKNOWN_ERROR_MESSAGE;
    try {
      const data: unknown = await response.json();
      if (typeof data === "object" && data !== null) {
        const body = data as Record<string, unknown>;
        if (typeof body.code === "string") code = body.code;
        if (typeof body.message === "string") message = body.message;
      }
    } catch {
      // 본문이 JSON이 아니면 상태 코드만 씀
    }
    return new ApiError(response.status, code, message);
  }

  // 본문이 없으면 undefined, JSON이 아니면 글자 그대로 돌려줌
  async function parse<T>(response: Response): Promise<T> {
    const text = await response.text();
    if (!text) return undefined as T;
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as T;
    }
  }

  const loginRequired = () =>
    new ApiError(401, INVALID_TOKEN, "로그인이 필요합니다.");

  // 여러 요청이 동시에 401을 받아도 재발급은 한 번만 함
  function reissue(): Promise<void> {
    if (!refreshing) {
      refreshing = (async () => {
        const sent = options.storage.get()?.refreshToken;
        if (!sent) throw loginRequired();

        const response = await send("/auth/reissue", {
          method: "POST",
          body: { refreshToken: sent },
        });
        // 재발급하는 동안 로그아웃했거나, 다른 탭이 먼저 재발급해 토큰이 바뀌었는지
        const current = options.storage.get()?.refreshToken;
        if (!current) throw loginRequired();

        if (!response.ok) {
          // 리프레시 토큰은 한 번 쓰면 폐기돼서, 다른 탭이 먼저 바꿨다면 거절돼도 그 새 토큰을 쓰면 됨
          if (current !== sent) return;
          throw await toError(response);
        }
        const next = await parse<unknown>(response);
        if (!isAuthTokens(next)) {
          throw new ApiError(
            response.status,
            "INVALID_RESPONSE",
            UNKNOWN_ERROR_MESSAGE,
          );
        }
        // 그사이 다른 탭이 저장한 토큰을 덮어쓰지 않음
        if (current === sent) options.storage.set(next);
      })().finally(() => {
        refreshing = null;
      });
    }
    return refreshing;
  }

  // 동시에 기다리던 요청이 여러 개여도 로그인 화면 이동은 한 번만
  function endSession() {
    if (!options.storage.get()) return;
    options.storage.clear();
    options.onSessionExpired?.();
  }

  async function request<T = unknown>(
    path: string,
    init: RequestOptions = {},
  ): Promise<T> {
    const useAuth = init.auth ?? true;
    const usedToken = useAuth ? options.storage.get()?.accessToken : undefined;
    let response = await send(path, init, usedToken);

    if (useAuth && usedToken && response.status === 401) {
      const error = await toError(response);
      if (error.code !== INVALID_TOKEN) throw error;

      // 다른 요청이 그사이 재발급했으면 새 토큰으로 바로 다시 보냄
      if (options.storage.get()?.accessToken === usedToken) {
        try {
          await reissue();
        } catch (reissueError) {
          // 서버가 재발급을 거절했을 때만 로그아웃. 네트워크 오류 · 5xx는 토큰을 그대로 둠
          if (isSessionRejected(reissueError)) endSession();
          throw reissueError;
        }
      }
      const retryToken = options.storage.get()?.accessToken;
      if (!retryToken) throw loginRequired();
      response = await send(path, init, retryToken);
    }

    if (!response.ok) throw await toError(response);
    return parse<T>(response);
  }

  const auth = {
    async login(body: { username: string; password: string }) {
      const tokens = await request<unknown>("/auth/login", {
        method: "POST",
        body,
        auth: false,
      });
      if (!isAuthTokens(tokens)) {
        throw new ApiError(200, "INVALID_RESPONSE", UNKNOWN_ERROR_MESSAGE);
      }
      options.storage.set(tokens);
      return tokens;
    },
    // 서버에 로그아웃 API가 없어서 저장한 토큰만 지움
    logout() {
      options.storage.clear();
    },
    isLoggedIn() {
      return options.storage.get() !== null;
    },
  };

  return {
    request,
    get: <T = unknown>(path: string, init?: MethodOptions) =>
      request<T>(path, { ...init, method: "GET" }),
    post: <T = unknown>(path: string, body?: unknown, init?: MethodOptions) =>
      request<T>(path, { ...init, method: "POST", body }),
    patch: <T = unknown>(path: string, body?: unknown, init?: MethodOptions) =>
      request<T>(path, { ...init, method: "PATCH", body }),
    delete: <T = unknown>(path: string, init?: MethodOptions) =>
      request<T>(path, { ...init, method: "DELETE" }),
    auth,
  };
}
