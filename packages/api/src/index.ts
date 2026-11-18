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
    tokens.accessToken !== "" &&
    typeof tokens.refreshToken === "string" &&
    tokens.refreshToken !== ""
  );
}

// 브라우저 localStorage에 토큰을 저장. 서버 렌더링 중이면 로그인 안 된 것으로 봄
// 저장이 막히면(시크릿 모드 · 용량 초과) set이 에러를 던져서 로그인이 실패로 끝나게 함
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
      storage()?.setItem(key, JSON.stringify(tokens));
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

// 액세스 토큰(JWT)의 sub(사용자 id). 읽을 수 없으면 null
function subjectOf(token: string): string | null {
  const part = token.split(".")[1];
  if (!part) return null;
  try {
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const payload: unknown = JSON.parse(atob(padded));
    if (typeof payload !== "object" || payload === null) return null;
    const sub = (payload as Record<string, unknown>).sub;
    return typeof sub === "string" || typeof sub === "number"
      ? String(sub)
      : null;
  } catch {
    return null;
  }
}

// 두 토큰이 같은 사용자 것인지. 토큰에서 사용자를 못 읽으면 같다고 봄 (로그인 횟수로 따로 확인)
function sameUser(a: string, b: string) {
  const subjectA = subjectOf(a);
  const subjectB = subjectOf(b);
  return subjectA === null || subjectB === null || subjectA === subjectB;
}

function abortReason(signal: AbortSignal): unknown {
  return signal.reason ?? new DOMException("요청이 취소되었습니다.", "AbortError");
}

// 여러 요청이 같이 기다리는 Promise는 그대로 두고, 이 요청의 기다림만 취소 신호로 끝냄
function waitWithSignal<T>(promise: Promise<T>, signal?: AbortSignal) {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(abortReason(signal));
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(abortReason(signal));
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (error: unknown) => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      },
    );
  });
}

interface PreparedRequest {
  method: HttpMethod;
  headers: Headers;
  body: BodyInit | undefined;
  signal?: AbortSignal;
}

export const STORAGE_ERROR = "STORAGE_UNAVAILABLE";
const STORAGE_ERROR_MESSAGE =
  "브라우저 저장소를 쓸 수 없어 로그인을 유지할 수 없습니다. 시크릿 모드나 사이트 데이터 설정을 확인해주세요.";

export function createApiClient(options: ApiClientOptions) {
  const baseUrl = options.baseUrl.replace(/\/+$/, "");
  const doFetch: typeof fetch =
    options.fetch ?? ((input, init) => fetch(input, init));
  // 로그인 · 로그아웃할 때마다 바뀜. 재시도 전에 같은 로그인인지 확인하는 데 씀
  let session = 0;
  // 지금 진행 중인 재발급. 같은 리프레시 토큰으로 시작한 요청끼리만 같이 기다림
  let refreshing: { token: string; promise: Promise<void> } | null = null;

  // 본문은 처음 한 번만 만들어서, 재시도 때 호출한 쪽이 객체를 바꿔도 같은 내용을 보냄
  function prepare(init: RequestOptions): PreparedRequest {
    const headers = new Headers(init.headers);
    if (!headers.has("Accept")) headers.set("Accept", "application/json");
    let body: BodyInit | undefined;
    if (isRawBody(init.body)) {
      body = init.body;
    } else if (init.body !== undefined) {
      body = JSON.stringify(init.body);
      headers.set("Content-Type", "application/json");
    }
    return { method: init.method ?? "GET", headers, body, signal: init.signal };
  }

  async function send(
    path: string,
    prepared: PreparedRequest,
    accessToken?: string,
  ): Promise<Response> {
    const headers = new Headers(prepared.headers);
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
    // "/"가 없으면 서버 주소 뒤에 그대로 붙어 다른 주소가 될 수 있어서 항상 붙임
    const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

    try {
      return await doFetch(url, {
        method: prepared.method,
        headers,
        body: prepared.body,
        signal: prepared.signal,
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
  const invalidResponse = (status: number) =>
    new ApiError(status, "INVALID_RESPONSE", UNKNOWN_ERROR_MESSAGE);

  // 여러 요청이 동시에 401을 받아도 재발급은 한 번만 함
  function reissue(): Promise<void> {
    const sent = options.storage.get()?.refreshToken;
    if (!sent) return Promise.reject(loginRequired());
    if (refreshing?.token === sent) return refreshing.promise;

    const work = (async () => {
      const response = await send(
        "/auth/reissue",
        prepare({ method: "POST", body: { refreshToken: sent } }),
      );
      if (!response.ok) {
        const error = await toError(response);
        // 본문까지 읽은 뒤에 확인해야, 그사이 다른 탭이 새로 로그인한 토큰을 지우지 않음
        const current = options.storage.get()?.refreshToken;
        if (!current) throw loginRequired();
        // 리프레시 토큰은 한 번 쓰면 폐기돼서, 다른 탭이 먼저 바꿨다면 거절돼도 그 새 토큰을 쓰면 됨
        if (current !== sent) return;
        throw error;
      }
      const next = await parse<unknown>(response);
      if (!isAuthTokens(next)) throw invalidResponse(response.status);
      // 본문을 읽는 사이 로그아웃했거나, 다른 탭 · 다른 로그인으로 토큰이 바뀌었으면 저장하지 않음
      const latest = options.storage.get()?.refreshToken;
      if (!latest) throw loginRequired();
      if (latest === sent) options.storage.set(next);
    })();
    const entry = {
      token: sent,
      promise: work.finally(() => {
        if (refreshing === entry) refreshing = null;
      }),
    };
    refreshing = entry;
    return entry.promise;
  }

  // 동시에 기다리던 요청이 여러 개여도 로그인 화면 이동은 한 번만
  function endSession() {
    if (!options.storage.get()) return;
    options.storage.clear();
    session += 1;
    options.onSessionExpired?.();
  }

  async function request<T = unknown>(
    path: string,
    init: RequestOptions = {},
  ): Promise<T> {
    const useAuth = init.auth ?? true;
    const prepared = prepare(init);
    const startedSession = session;
    const usedToken = useAuth ? options.storage.get()?.accessToken : undefined;
    let response = await send(path, prepared, usedToken);

    if (useAuth && usedToken && response.status === 401) {
      const error = await toError(response);
      if (error.code !== INVALID_TOKEN) throw error;

      // 다른 요청이 그사이 재발급했으면 새 토큰으로 바로 다시 보냄
      if (options.storage.get()?.accessToken === usedToken) {
        try {
          await waitWithSignal(reissue(), init.signal);
        } catch (reissueError) {
          // 서버가 재발급을 거절했을 때만 로그아웃. 네트워크 오류 · 5xx는 토큰을 그대로 둠
          if (isSessionRejected(reissueError)) endSession();
          throw reissueError;
        }
      }
      const retryToken = options.storage.get()?.accessToken;
      if (!retryToken) throw loginRequired();
      // 그사이 로그아웃 후 다른 계정으로 로그인했으면, 이전 계정의 요청을 새 계정으로 보내지 않음
      if (session !== startedSession || !sameUser(usedToken, retryToken)) {
        throw error;
      }
      response = await send(path, prepared, retryToken);
    }

    if (!response.ok) throw await toError(response);
    return parse<T>(response);
  }

  const auth = {
    async login(
      body: { username: string; password: string },
      init?: { signal?: AbortSignal },
    ) {
      const tokens = await request<unknown>("/auth/login", {
        method: "POST",
        body,
        auth: false,
        signal: init?.signal,
      });
      if (!isAuthTokens(tokens)) throw invalidResponse(200);
      // 응답이 온 뒤에 취소됐으면(로그인 화면을 떠남) 토큰을 저장하지 않음
      if (init?.signal?.aborted) throw abortReason(init.signal);
      try {
        options.storage.set(tokens);
      } catch {
        throw new ApiError(0, STORAGE_ERROR, STORAGE_ERROR_MESSAGE);
      }
      session += 1;
      return tokens;
    },
    // 서버에 로그아웃 API가 없어서 저장한 토큰만 지움
    logout() {
      options.storage.clear();
      session += 1;
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
