import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ApiError,
  NETWORK_ERROR,
  STORAGE_ERROR,
  createApiClient,
  type AuthTokens,
  type TokenStorage,
} from "./index.ts";

const BASE = "https://api.test";

function memoryStorage(initial: AuthTokens | null = null) {
  let tokens = initial;
  const storage: TokenStorage = {
    get: () => tokens,
    set: (next) => {
      tokens = next;
    },
    clear: () => {
      tokens = null;
    },
  };
  return { storage, current: () => tokens };
}

function json(status: number, body?: unknown) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

interface Call {
  path: string;
  method: string;
  authorization: string | null;
  body: unknown;
}

// 경로별로 응답을 정하는 가짜 fetch. 호출 기록을 남김
function fakeFetch(handler: (call: Call) => Response | Promise<Response>) {
  const calls: Call[] = [];
  const fetchFn = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    const headers = new Headers(init?.headers);
    const call: Call = {
      path: url.pathname,
      method: init?.method ?? "GET",
      authorization: headers.get("Authorization"),
      body: typeof init?.body === "string" ? JSON.parse(init.body) : undefined,
    };
    calls.push(call);
    return handler(call);
  }) as typeof fetch;
  return { fetchFn, calls };
}

const OLD: AuthTokens = { accessToken: "access-old", refreshToken: "refresh-old" };
const NEW: AuthTokens = { accessToken: "access-new", refreshToken: "refresh-new" };

// 서버 액세스 토큰처럼 sub(사용자 id)가 들어 있는 가짜 JWT
function fakeJwt(sub: string, nonce: string) {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "HS256" })}.${encode({ sub, nonce })}.signature`;
}
const USER1_OLD: AuthTokens = { accessToken: fakeJwt("1", "old"), refreshToken: "refresh-1-old" };
const USER1_NEW: AuthTokens = { accessToken: fakeJwt("1", "new"), refreshToken: "refresh-1-new" };
const USER2: AuthTokens = { accessToken: fakeJwt("2", "login"), refreshToken: "refresh-2" };

test("로그인하면 토큰 없이 요청하고 받은 토큰을 저장함", async () => {
  const { storage, current } = memoryStorage();
  const { fetchFn, calls } = fakeFetch(() => json(200, NEW));
  const api = createApiClient({ baseUrl: `${BASE}/`, storage, fetch: fetchFn });

  await api.auth.login({ username: "tester", password: "Password1!" });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].path, "/auth/login");
  assert.equal(calls[0].method, "POST");
  assert.equal(calls[0].authorization, null);
  assert.deepEqual(calls[0].body, { username: "tester", password: "Password1!" });
  assert.deepEqual(current(), NEW);
  assert.equal(api.auth.isLoggedIn(), true);
});

test("로그인 실패는 서버 코드와 메시지를 그대로 ApiError로 던지고 토큰을 저장하지 않음", async () => {
  const { storage, current } = memoryStorage();
  const { fetchFn } = fakeFetch(() =>
    json(401, {
      code: "INVALID_CREDENTIALS",
      message: "아이디 또는 비밀번호가 올바르지 않습니다.",
    }),
  );
  const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });

  await assert.rejects(
    api.auth.login({ username: "tester", password: "wrong" }),
    (error: unknown) =>
      error instanceof ApiError &&
      error.status === 401 &&
      error.code === "INVALID_CREDENTIALS" &&
      error.message === "아이디 또는 비밀번호가 올바르지 않습니다.",
  );
  assert.equal(current(), null);
});

test("로그인한 뒤 요청에는 Bearer 토큰을 붙임", async () => {
  const { storage } = memoryStorage(OLD);
  const { fetchFn, calls } = fakeFetch(() => json(200, { ok: true }));
  const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });

  const data = await api.get<{ ok: boolean }>("/students");

  assert.deepEqual(data, { ok: true });
  assert.equal(calls[0].authorization, "Bearer access-old");
});

test("401 INVALID_TOKEN이면 재발급하고 새 토큰으로 한 번 다시 요청함", async () => {
  const { storage, current } = memoryStorage(OLD);
  const { fetchFn, calls } = fakeFetch((call) => {
    if (call.path === "/auth/reissue") return json(200, NEW);
    if (call.authorization === "Bearer access-new") return json(200, { ok: true });
    return json(401, { code: "INVALID_TOKEN", message: "토큰이 없거나 유효하지 않습니다." });
  });
  const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });

  const data = await api.get("/students");

  assert.deepEqual(data, { ok: true });
  assert.deepEqual(
    calls.map((call) => call.path),
    ["/students", "/auth/reissue", "/students"],
  );
  assert.deepEqual(calls[1].body, { refreshToken: "refresh-old" });
  assert.equal(calls[1].authorization, null);
  assert.deepEqual(current(), NEW);
});

test("동시에 여러 요청이 401을 받아도 재발급은 한 번만 함", async () => {
  const { storage } = memoryStorage(OLD);
  const { fetchFn, calls } = fakeFetch(async (call) => {
    if (call.path === "/auth/reissue") {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return json(200, NEW);
    }
    if (call.authorization === "Bearer access-new") return json(200, { path: call.path });
    return json(401, { code: "INVALID_TOKEN", message: "만료" });
  });
  const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });

  const results = await Promise.all([
    api.get("/students"),
    api.get("/teachers"),
    api.get("/clubs"),
  ]);

  assert.deepEqual(results, [
    { path: "/students" },
    { path: "/teachers" },
    { path: "/clubs" },
  ]);
  assert.equal(calls.filter((call) => call.path === "/auth/reissue").length, 1);
});

test("재발급이 거절되면 토큰을 지우고 onSessionExpired를 부름", async () => {
  const { storage, current } = memoryStorage(OLD);
  let expired = 0;
  const { fetchFn } = fakeFetch((call) => {
    if (call.path === "/auth/reissue") {
      return json(401, {
        code: "INVALID_REFRESH_TOKEN",
        message: "리프레시 토큰이 없거나 만료 또는 폐기되었습니다. 재로그인이 필요합니다.",
      });
    }
    return json(401, { code: "INVALID_TOKEN", message: "만료" });
  });
  const api = createApiClient({
    baseUrl: BASE,
    storage,
    fetch: fetchFn,
    onSessionExpired: () => {
      expired += 1;
    },
  });

  await assert.rejects(
    api.get("/students"),
    (error: unknown) => error instanceof ApiError && error.code === "INVALID_REFRESH_TOKEN",
  );
  assert.equal(current(), null);
  assert.equal(expired, 1);
});

test("INVALID_TOKEN이 아닌 401 · 403은 재발급하지 않고 그대로 던짐", async () => {
  const { storage, current } = memoryStorage(OLD);
  const { fetchFn, calls } = fakeFetch(() =>
    json(403, { code: "FORBIDDEN", message: "권한이 없습니다." }),
  );
  const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });

  await assert.rejects(
    api.delete("/students/1"),
    (error: unknown) => error instanceof ApiError && error.status === 403 && error.code === "FORBIDDEN",
  );
  assert.equal(calls.length, 1);
  assert.deepEqual(current(), OLD);
});

test("재발급 뒤에도 401이면 더 반복하지 않고 에러를 던짐", async () => {
  const { storage, current } = memoryStorage(OLD);
  let expired = 0;
  const { fetchFn, calls } = fakeFetch((call) => {
    if (call.path === "/auth/reissue") return json(200, NEW);
    return json(401, { code: "INVALID_TOKEN", message: "토큰이 없거나 유효하지 않습니다." });
  });
  const api = createApiClient({
    baseUrl: BASE,
    storage,
    fetch: fetchFn,
    onSessionExpired: () => {
      expired += 1;
    },
  });

  await assert.rejects(
    api.get("/unknown"),
    (error: unknown) => error instanceof ApiError && error.code === "INVALID_TOKEN",
  );
  assert.equal(calls.length, 3);
  assert.deepEqual(current(), NEW);
  assert.equal(expired, 0);
});

test("서버에 닿지 못하면 status 0 NETWORK_ERROR, 재발급 중이어도 토큰은 지우지 않음", async () => {
  const { storage, current } = memoryStorage(OLD);
  let expired = 0;
  const { fetchFn } = fakeFetch((call) => {
    if (call.path === "/auth/reissue") throw new TypeError("fetch failed");
    return json(401, { code: "INVALID_TOKEN", message: "만료" });
  });
  const api = createApiClient({
    baseUrl: BASE,
    storage,
    fetch: fetchFn,
    onSessionExpired: () => {
      expired += 1;
    },
  });

  await assert.rejects(
    api.get("/students"),
    (error: unknown) => error instanceof ApiError && error.status === 0 && error.code === NETWORK_ERROR,
  );
  assert.deepEqual(current(), OLD);
  assert.equal(expired, 0);
});

test("본문이 없는 응답은 undefined, 로그아웃하면 토큰이 지워짐", async () => {
  const { storage, current } = memoryStorage(OLD);
  const { fetchFn } = fakeFetch(() => new Response(null, { status: 204 }));
  const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });

  assert.equal(await api.delete("/notices/1"), undefined);
  api.auth.logout();
  assert.equal(current(), null);
  assert.equal(api.auth.isLoggedIn(), false);
});

test("재발급이 5xx로 실패하면 로그아웃하지 않고 토큰을 그대로 둠", async () => {
  const { storage, current } = memoryStorage(OLD);
  let expired = 0;
  const { fetchFn } = fakeFetch((call) => {
    if (call.path === "/auth/reissue") return json(502, { code: "BAD_GATEWAY", message: "잠시 후 다시" });
    return json(401, { code: "INVALID_TOKEN", message: "만료" });
  });
  const api = createApiClient({
    baseUrl: BASE,
    storage,
    fetch: fetchFn,
    onSessionExpired: () => {
      expired += 1;
    },
  });

  await assert.rejects(
    api.get("/students"),
    (error: unknown) => error instanceof ApiError && error.status === 502,
  );
  assert.deepEqual(current(), OLD);
  assert.equal(expired, 0);
});

test("다른 탭이 먼저 재발급해 거절되면 그 탭의 새 토큰으로 다시 요청함 (같은 사용자)", async () => {
  const { storage, current } = memoryStorage(USER1_OLD);
  let expired = 0;
  const { fetchFn, calls } = fakeFetch((call) => {
    if (call.path === "/auth/reissue") {
      // 이 탭의 재발급 요청이 서버에 닿는 동안 다른 탭이 먼저 바꿔 저장함
      storage.set(USER1_NEW);
      return json(401, { code: "INVALID_REFRESH_TOKEN", message: "폐기된 토큰" });
    }
    if (call.authorization === `Bearer ${USER1_NEW.accessToken}`) return json(200, { ok: true });
    return json(401, { code: "INVALID_TOKEN", message: "만료" });
  });
  const api = createApiClient({
    baseUrl: BASE,
    storage,
    fetch: fetchFn,
    onSessionExpired: () => {
      expired += 1;
    },
  });

  assert.deepEqual(await api.get("/students"), { ok: true });
  assert.deepEqual(current(), USER1_NEW);
  assert.equal(expired, 0);
  assert.equal(calls.at(-1)?.authorization, `Bearer ${USER1_NEW.accessToken}`);
});

test("다른 탭에서 다른 계정으로 로그인했으면 이전 요청을 새 계정 토큰으로 보내지 않음", async () => {
  for (const changed of [USER2, NEW]) {
    // NEW는 사용자 id를 읽을 수 없는 토큰이라 같은 사용자인지 확인할 수 없음
    const { storage, current } = memoryStorage(USER1_OLD);
    const { fetchFn, calls } = fakeFetch((call) => {
      if (call.path === "/students/1") {
        storage.set(changed);
        return json(401, { code: "INVALID_TOKEN", message: "만료" });
      }
      return json(200, { ok: true });
    });
    const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });

    await assert.rejects(
      api.patch("/students/1", { name: "1번 사용자가 보낸 수정" }),
      (error: unknown) => error instanceof ApiError && error.code === "INVALID_TOKEN",
    );
    assert.equal(calls.length, 1);
    assert.deepEqual(current(), changed);
  }
});

test("같은 리프레시 토큰으로 다시 로그인해도 이전 재발급 결과가 새 로그인 토큰을 덮어쓰지 않음", async () => {
  const { storage, current } = memoryStorage(OLD);
  const RELOGIN: AuthTokens = { accessToken: "access-relogin", refreshToken: OLD.refreshToken };
  const { fetchFn } = fakeFetch(async (call) => {
    if (call.path === "/auth/login") return json(200, RELOGIN);
    if (call.path === "/auth/reissue") {
      await sleep(20);
      return json(200, NEW);
    }
    return json(401, { code: "INVALID_TOKEN", message: "만료" });
  });
  const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });

  const oldRequest = api.get("/students");
  await sleep(5);
  await api.auth.logout();
  await api.auth.login({ username: "tester", password: "Password1!" });

  await assert.rejects(oldRequest, ApiError);
  assert.deepEqual(current(), RELOGIN);
});

test("재발급하는 동안 로그아웃하면 새 토큰을 저장하지 않음", async () => {
  const { storage, current } = memoryStorage(OLD);
  let expired = 0;
  const { fetchFn } = fakeFetch((call) => {
    if (call.path === "/auth/reissue") {
      storage.clear();
      return json(200, NEW);
    }
    return json(401, { code: "INVALID_TOKEN", message: "만료" });
  });
  const api = createApiClient({
    baseUrl: BASE,
    storage,
    fetch: fetchFn,
    onSessionExpired: () => {
      expired += 1;
    },
  });

  await assert.rejects(api.get("/students"), ApiError);
  assert.equal(current(), null);
  assert.equal(expired, 0);
});

test("FormData 본문은 JSON으로 바꾸지 않고 그대로 보냄", async () => {
  const { storage } = memoryStorage(OLD);
  let received: RequestInit | undefined;
  const fetchFn = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    received = init;
    return json(200, { ok: true });
  }) as typeof fetch;
  const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });
  const form = new FormData();
  form.append("logo", new Blob(["png"]), "logo.png");

  await api.post("/clubs/1/logo", form);

  assert.ok(received?.body instanceof FormData);
  assert.notEqual(received?.body, form);
  assert.equal((received?.body as FormData).get("logo") instanceof Blob, true);
  assert.equal(new Headers(received?.headers).get("Content-Type"), null);
  assert.equal(new Headers(received?.headers).get("Authorization"), "Bearer access-old");
});

test("세션이 끝날 때 기다리던 요청이 여러 개여도 onSessionExpired는 한 번만", async () => {
  const { storage } = memoryStorage(OLD);
  let expired = 0;
  const { fetchFn } = fakeFetch(async (call) => {
    if (call.path === "/auth/reissue") {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return json(401, { code: "INVALID_REFRESH_TOKEN", message: "만료" });
    }
    return json(401, { code: "INVALID_TOKEN", message: "만료" });
  });
  const api = createApiClient({
    baseUrl: BASE,
    storage,
    fetch: fetchFn,
    onSessionExpired: () => {
      expired += 1;
    },
  });

  const results = await Promise.allSettled([
    api.get("/students"),
    api.get("/teachers"),
    api.get("/clubs"),
  ]);

  assert.ok(results.every((result) => result.status === "rejected"));
  assert.equal(expired, 1);
});

test("로그인 응답에 토큰이 없으면 저장하지 않고 에러", async () => {
  const { storage, current } = memoryStorage();
  const { fetchFn } = fakeFetch(() => json(200, { message: "ok" }));
  const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });

  await assert.rejects(
    api.auth.login({ username: "tester", password: "Password1!" }),
    (error: unknown) => error instanceof ApiError && error.code === "INVALID_RESPONSE",
  );
  assert.equal(current(), null);
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 테스트가 직접 열어줄 때까지 기다리는 문
function gate() {
  let open!: () => void;
  const opened = new Promise<void>((resolve) => {
    open = resolve;
  });
  return { opened, open };
}

test("빈 토큰은 로그인 성공으로 보지 않음", async () => {
  const { storage, current } = memoryStorage();
  const { fetchFn } = fakeFetch(() => json(200, { accessToken: "", refreshToken: "refresh" }));
  const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });

  await assert.rejects(
    api.auth.login({ username: "tester", password: "Password1!" }),
    (error: unknown) => error instanceof ApiError && error.code === "INVALID_RESPONSE",
  );
  assert.equal(current(), null);
});

test("토큰을 저장하지 못하면 로그인이 실패로 끝남", async () => {
  const storage: TokenStorage = {
    get: () => null,
    set: () => {
      throw new Error("QuotaExceededError");
    },
    clear: () => {},
  };
  const { fetchFn } = fakeFetch(() => json(200, NEW));
  const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });

  await assert.rejects(
    api.auth.login({ username: "tester", password: "Password1!" }),
    (error: unknown) => error instanceof ApiError && error.code === STORAGE_ERROR,
  );
});

test("로그인 응답이 온 뒤 취소됐으면 토큰을 저장하지 않음", async () => {
  const { storage, current } = memoryStorage();
  const controller = new AbortController();
  const { fetchFn } = fakeFetch(() => {
    controller.abort();
    return json(200, NEW);
  });
  const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });

  await assert.rejects(
    api.auth.login({ username: "tester", password: "Password1!" }, { signal: controller.signal }),
    (error: unknown) => error instanceof Error && error.name === "AbortError",
  );
  assert.equal(current(), null);
});

test("헤더 이름 대소문자가 달라도 Content-Type은 하나만 보냄, 경로에 / 가 없어도 같은 서버로", async () => {
  const { storage } = memoryStorage(OLD);
  let received: { url: string; init?: RequestInit } | undefined;
  const fetchFn = (async (input: RequestInfo | URL, init?: RequestInit) => {
    received = { url: String(input), init };
    return json(200, { ok: true });
  }) as typeof fetch;
  const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });

  await api.post("students", { name: "장윤호" }, { headers: { "content-type": "application/json" } });

  assert.equal(received?.url, "https://api.test/students");
  assert.equal(new Headers(received?.init?.headers).get("Content-Type"), "application/json");
});

test("재발급 응답 본문을 읽는 사이 로그아웃하면 새 토큰을 저장하지 않음", async () => {
  const { storage, current } = memoryStorage(OLD);
  const { fetchFn } = fakeFetch((call) => {
    if (call.path === "/auth/reissue") {
      setTimeout(() => storage.clear(), 0);
      const body = new ReadableStream({
        async start(controller) {
          await sleep(10);
          controller.enqueue(new TextEncoder().encode(JSON.stringify(NEW)));
          controller.close();
        },
      });
      return new Response(body, { status: 200 });
    }
    return json(401, { code: "INVALID_TOKEN", message: "만료" });
  });
  const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });

  await assert.rejects(api.get("/students"), ApiError);
  assert.equal(current(), null);
});

test("다른 계정으로 다시 로그인하면 이전 재발급을 기다리지 않고, 이전 요청을 새 계정으로 보내지 않음", { timeout: 2000 }, async () => {
  const { storage } = memoryStorage(OLD);
  const B: AuthTokens = { accessToken: "access-b", refreshToken: "refresh-b" };
  const B2: AuthTokens = { accessToken: "access-b2", refreshToken: "refresh-b2" };
  const oldReissue = gate();
  const oldReissueStarted = gate();
  const { fetchFn, calls } = fakeFetch(async (call) => {
    if (call.path === "/auth/login") return json(200, B);
    if (call.path === "/auth/reissue") {
      const { refreshToken } = call.body as { refreshToken: string };
      if (refreshToken === "refresh-old") {
        oldReissueStarted.open();
        await oldReissue.opened;
        return json(401, { code: "INVALID_REFRESH_TOKEN", message: "폐기된 토큰" });
      }
      return json(200, B2);
    }
    if (call.authorization === "Bearer access-b2") return json(200, { path: call.path });
    return json(401, { code: "INVALID_TOKEN", message: "만료" });
  });
  const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });

  const oldRequest = api.patch("/students/1", { name: "A가 보낸 수정" });
  await oldReissueStarted.opened;
  await api.auth.login({ username: "b", password: "Password1!" });

  // 이전 재발급 응답을 아직 붙잡고 있어도 새 계정 요청은 끝나야 함
  assert.deepEqual(await api.get("/teachers"), { path: "/teachers" });

  oldReissue.open();
  await assert.rejects(oldRequest, ApiError);
  assert.equal(
    calls.some((call) => call.path === "/students/1" && call.authorization === "Bearer access-b2"),
    false,
  );
});

test("재발급을 기다리는 동안 취소하면 그 요청만 바로 끝남", { timeout: 2000 }, async () => {
  const { storage } = memoryStorage(OLD);
  const reissueGate = gate();
  const reissueStarted = gate();
  const { fetchFn } = fakeFetch(async (call) => {
    if (call.path === "/auth/reissue") {
      reissueStarted.open();
      await reissueGate.opened;
      return json(200, NEW);
    }
    if (call.authorization === "Bearer access-new") return json(200, { ok: true });
    return json(401, { code: "INVALID_TOKEN", message: "만료" });
  });
  const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });
  const controller = new AbortController();

  const cancelled = api.get("/students", { signal: controller.signal });
  const other = api.get("/teachers");
  await reissueStarted.opened;
  controller.abort();

  // 재발급 응답을 아직 붙잡고 있어도 취소한 요청은 끝나야 함
  await assert.rejects(cancelled, (error: unknown) => error instanceof Error && error.name === "AbortError");

  reissueGate.open();
  assert.deepEqual(await other, { ok: true });
});

test("재시도할 때는 처음 보낸 본문을 그대로 보냄", async () => {
  const { storage } = memoryStorage(OLD);
  const payload = { name: "초안" };
  const { fetchFn, calls } = fakeFetch((call) => {
    if (call.path === "/auth/reissue") {
      payload.name = "수정본";
      return json(200, NEW);
    }
    if (call.authorization === "Bearer access-new") return json(200, { ok: true });
    return json(401, { code: "INVALID_TOKEN", message: "만료" });
  });
  const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });

  await api.patch("/students/1", payload);

  assert.deepEqual(calls.at(-1)?.body, { name: "초안" });
});

test("재발급 거절 응답을 읽는 사이 다른 탭이 다시 로그인하면 그 토큰을 지우지 않음 (같은 사용자)", async () => {
  const { storage, current } = memoryStorage(USER1_OLD);
  let expired = 0;
  const { fetchFn } = fakeFetch((call) => {
    if (call.path === "/auth/reissue") {
      // 헤더는 왔고 본문을 읽는 동안 다른 탭이 새로 로그인해 저장함
      setTimeout(() => storage.set(USER1_NEW), 0);
      const body = new ReadableStream({
        async start(controller) {
          await sleep(10);
          controller.enqueue(
            new TextEncoder().encode(
              JSON.stringify({ code: "INVALID_REFRESH_TOKEN", message: "폐기된 토큰" }),
            ),
          );
          controller.close();
        },
      });
      return new Response(body, { status: 401 });
    }
    if (call.authorization === `Bearer ${USER1_NEW.accessToken}`) return json(200, { ok: true });
    return json(401, { code: "INVALID_TOKEN", message: "만료" });
  });
  const api = createApiClient({
    baseUrl: BASE,
    storage,
    fetch: fetchFn,
    onSessionExpired: () => {
      expired += 1;
    },
  });

  assert.deepEqual(await api.get("/students"), { ok: true });
  assert.deepEqual(current(), USER1_NEW);
  assert.equal(expired, 0);
});

test("같은 리프레시 토큰으로 다시 로그인한 뒤 이전 재발급이 거절돼도 새 세션을 지우지 않음", async () => {
  const { storage, current } = memoryStorage(OLD);
  const RELOGIN: AuthTokens = { accessToken: "access-relogin", refreshToken: OLD.refreshToken };
  let expired = 0;
  const { fetchFn } = fakeFetch(async (call) => {
    if (call.path === "/auth/login") return json(200, RELOGIN);
    if (call.path === "/auth/reissue") {
      await sleep(20);
      return json(401, { code: "INVALID_REFRESH_TOKEN", message: "폐기된 토큰" });
    }
    return json(401, { code: "INVALID_TOKEN", message: "만료" });
  });
  const api = createApiClient({
    baseUrl: BASE,
    storage,
    fetch: fetchFn,
    onSessionExpired: () => {
      expired += 1;
    },
  });

  const oldRequest = api.get("/students");
  await sleep(5);
  api.auth.logout();
  await api.auth.login({ username: "tester", password: "Password1!" });

  await assert.rejects(oldRequest, ApiError);
  assert.deepEqual(current(), RELOGIN);
  assert.equal(expired, 0);
});

test("이미 취소된 요청은 401을 받아도 재발급을 시작하지 않음", async () => {
  const { storage, current } = memoryStorage(OLD);
  const controller = new AbortController();
  const { fetchFn, calls } = fakeFetch(() => {
    controller.abort();
    return json(401, { code: "INVALID_TOKEN", message: "만료" });
  });
  const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });

  await assert.rejects(
    api.get("/students", { signal: controller.signal }),
    (error: unknown) => error instanceof Error && error.name === "AbortError",
  );
  assert.equal(calls.filter((call) => call.path === "/auth/reissue").length, 0);
  assert.deepEqual(current(), OLD);
});

test("취소 사유가 400 · 401 ApiError여도 재발급 거절로 보고 로그아웃하지 않음", async () => {
  const { storage, current } = memoryStorage(OLD);
  let expired = 0;
  const { fetchFn } = fakeFetch(async (call) => {
    if (call.path === "/auth/reissue") {
      await sleep(30);
      return json(200, NEW);
    }
    return json(401, { code: "INVALID_TOKEN", message: "만료" });
  });
  const api = createApiClient({
    baseUrl: BASE,
    storage,
    fetch: fetchFn,
    onSessionExpired: () => {
      expired += 1;
    },
  });
  const controller = new AbortController();
  const reason = new ApiError(401, "CANCELLED_BY_CALLER", "화면을 떠남");

  const request = api.get("/students", { signal: controller.signal });
  await sleep(5);
  controller.abort(reason);

  await assert.rejects(request, (error: unknown) => error === reason);
  assert.equal(expired, 0);
  await sleep(40);
  assert.deepEqual(current(), NEW);
});

test("다른 탭이 다른 계정으로 로그인하고 이 탭이 그 토큰을 재발급해도, 이전 계정 요청은 새 계정으로 보내지 않음", async () => {
  const { storage } = memoryStorage(USER1_OLD);
  const USER2_NEW: AuthTokens = { accessToken: fakeJwt("2", "new"), refreshToken: "refresh-2-new" };
  const { fetchFn, calls } = fakeFetch(async (call) => {
    if (call.path === "/students/1") {
      if (call.authorization === `Bearer ${USER1_OLD.accessToken}`) {
        await sleep(30);
        return json(401, { code: "INVALID_TOKEN", message: "만료" });
      }
      return json(200, { leaked: true });
    }
    if (call.path === "/auth/reissue") return json(200, USER2_NEW);
    if (call.authorization === `Bearer ${USER2_NEW.accessToken}`) return json(200, { path: call.path });
    return json(401, { code: "INVALID_TOKEN", message: "만료" });
  });
  const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });

  // 1. 1번 사용자의 요청이 응답을 기다림
  const oldRequest = api.patch("/students/1", { name: "1번 사용자가 보낸 수정" });
  await sleep(5);
  // 2. 다른 탭에서 2번 사용자로 로그인
  storage.set(USER2);
  // 3. 이 탭이 2번 사용자의 토큰을 재발급
  assert.deepEqual(await api.get("/teachers"), { path: "/teachers" });
  // 4. 1번 사용자의 요청이 401을 받아도 2번 사용자 토큰으로 다시 보내지 않음
  await assert.rejects(oldRequest, ApiError);
  assert.equal(
    calls.some((call) => call.path === "/students/1" && call.authorization !== `Bearer ${USER1_OLD.accessToken}`),
    false,
  );
});

test("이 탭에서 두 번 이어서 재발급해도 같은 로그인의 요청은 다시 보냄", async () => {
  const { storage } = memoryStorage(OLD);
  const NEWER: AuthTokens = { accessToken: "access-newer", refreshToken: "refresh-newer" };
  const { fetchFn } = fakeFetch(async (call) => {
    if (call.path === "/auth/reissue") {
      const { refreshToken } = call.body as { refreshToken: string };
      return json(200, refreshToken === OLD.refreshToken ? NEW : NEWER);
    }
    if (call.path === "/slow" && call.authorization === `Bearer ${OLD.accessToken}`) {
      await sleep(20);
      return json(401, { code: "INVALID_TOKEN", message: "만료" });
    }
    // NEW는 /students에서 한 번 쓰인 뒤 만료돼서 /teachers에서 다시 재발급됨
    if (call.path === "/students" && call.authorization === `Bearer ${NEW.accessToken}`) {
      return json(200, { ok: true });
    }
    if (call.authorization === `Bearer ${NEWER.accessToken}`) return json(200, { ok: true });
    return json(401, { code: "INVALID_TOKEN", message: "만료" });
  });
  const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });

  const slow = api.get("/slow");
  await sleep(5);
  await api.get("/students"); // OLD → NEW
  await api.get("/teachers"); // NEW → NEWER

  assert.deepEqual(storage.get(), NEWER);
  assert.deepEqual(await slow, { ok: true });
});

// 탭 여러 개가 같이 쓰는 잠금 (navigator.locks 대신)
function sharedLocks() {
  const tails = new Map<string, Promise<unknown>>();
  return {
    request<T>(name: string, callback: () => Promise<T>): Promise<T> {
      const previous = tails.get(name) ?? Promise.resolve();
      const run = previous.then(callback, callback);
      tails.set(name, run.catch(() => {}));
      return run;
    },
  };
}

test("두 탭이 같은 리프레시 토큰으로 재발급해도 한 번만 보내고 둘 다 새 토큰으로 이어감", { timeout: 2000 }, async () => {
  const { storage, current } = memoryStorage(USER1_OLD);
  const locks = sharedLocks();
  let expired = 0;
  let reissued = 0;
  const { fetchFn, calls } = fakeFetch(async (call) => {
    if (call.path === "/auth/reissue") {
      reissued += 1;
      if (reissued > 1) {
        return json(401, { code: "INVALID_REFRESH_TOKEN", message: "폐기된 토큰" });
      }
      await sleep(10);
      return json(200, USER1_NEW);
    }
    if (call.authorization === `Bearer ${USER1_NEW.accessToken}`) return json(200, { path: call.path });
    return json(401, { code: "INVALID_TOKEN", message: "만료" });
  });
  const tab = () =>
    createApiClient({
      baseUrl: BASE,
      storage,
      fetch: fetchFn,
      lockName: "tokens",
      locks,
      onSessionExpired: () => {
        expired += 1;
      },
    });
  const tabA = tab();
  const tabB = tab();

  const [a, b] = await Promise.all([tabA.get("/students"), tabB.get("/teachers")]);

  assert.deepEqual(a, { path: "/students" });
  assert.deepEqual(b, { path: "/teachers" });
  assert.equal(calls.filter((call) => call.path === "/auth/reissue").length, 1);
  assert.deepEqual(current(), USER1_NEW);
  assert.equal(expired, 0);
});

test("재시도할 때 ArrayBuffer 본문은 처음 보낸 바이트를 그대로 보냄", async () => {
  const { storage } = memoryStorage(OLD);
  const buffer = new Uint8Array([1]).buffer;
  const sentBytes: number[] = [];
  const fetchFn = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    const authorization = new Headers(init?.headers).get("Authorization");
    if (url.pathname === "/auth/reissue") {
      new Uint8Array(buffer)[0] = 2;
      return json(200, NEW);
    }
    sentBytes.push(new Uint8Array(init?.body as ArrayBuffer)[0]);
    if (authorization === "Bearer access-new") return json(200, { ok: true });
    return json(401, { code: "INVALID_TOKEN", message: "만료" });
  }) as typeof fetch;
  const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });

  await api.post("/files", buffer);

  assert.deepEqual(sentBytes, [1, 1]);
});

test("인증코드 발송은 토큰 없이 이메일만 보냄", async () => {
  const { storage } = memoryStorage(OLD);
  const { fetchFn, calls } = fakeFetch(() => json(200, { message: "인증코드를 발송했습니다." }));
  const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });

  await api.auth.sendEmailOtp({ email: "tester@dsm.hs.kr" });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].path, "/auth/email/otp");
  assert.equal(calls[0].method, "POST");
  assert.equal(calls[0].authorization, null);
  assert.deepEqual(calls[0].body, { email: "tester@dsm.hs.kr" });
});

test("인증코드 발송이 429면 서버 코드 그대로 던짐", async () => {
  const { storage } = memoryStorage();
  const { fetchFn } = fakeFetch(() =>
    json(429, { code: "OTP_RESEND_TOO_SOON", message: "인증코드를 너무 자주 요청했습니다." }),
  );
  const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });

  await assert.rejects(
    api.auth.sendEmailOtp({ email: "tester@dsm.hs.kr" }),
    (error: unknown) =>
      error instanceof ApiError && error.status === 429 && error.code === "OTP_RESEND_TOO_SOON",
  );
});

test("인증코드 검증은 토큰 없이 보내고 emailVerifiedToken을 돌려줌", async () => {
  const { storage } = memoryStorage(OLD);
  const { fetchFn, calls } = fakeFetch(() => json(200, { emailVerifiedToken: "verified-1" }));
  const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });

  const token = await api.auth.verifyEmailOtp({ email: "tester@dsm.hs.kr", otp: "123456" });

  assert.equal(token, "verified-1");
  assert.equal(calls[0].path, "/auth/email/otp/verify");
  assert.equal(calls[0].authorization, null);
  assert.deepEqual(calls[0].body, { email: "tester@dsm.hs.kr", otp: "123456" });
});

test("인증코드 검증 응답에 토큰이 없으면 에러", async () => {
  const { storage } = memoryStorage();
  const { fetchFn } = fakeFetch(() => json(200, { message: "ok" }));
  const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });

  await assert.rejects(
    api.auth.verifyEmailOtp({ email: "tester@dsm.hs.kr", otp: "123456" }),
    (error: unknown) => error instanceof ApiError && error.code === "INVALID_RESPONSE",
  );
});

const RESET_BODY = { emailVerifiedToken: "verified-1", newPassword: "Password1!" };

test("비밀번호 재설정은 토큰 없이 보내고, 로그인 토큰을 저장하지 않음", async () => {
  const { storage, current } = memoryStorage();
  const { fetchFn, calls } = fakeFetch(() => json(200, { message: "비밀번호를 변경했습니다." }));
  const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });

  await api.auth.resetPassword(RESET_BODY);

  assert.equal(calls.length, 1);
  assert.equal(calls[0].path, "/auth/password/reset");
  assert.equal(calls[0].method, "POST");
  assert.equal(calls[0].authorization, null);
  assert.deepEqual(calls[0].body, RESET_BODY);
  assert.equal(current(), null);
});

test("비밀번호 재설정이 403이면 서버 코드 그대로 던짐", async () => {
  const { storage } = memoryStorage();
  const { fetchFn } = fakeFetch(() =>
    json(403, { code: "EMAIL_NOT_VERIFIED", message: "이메일 인증이 완료되지 않았습니다." }),
  );
  const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });

  await assert.rejects(
    api.auth.resetPassword(RESET_BODY),
    (error: unknown) =>
      error instanceof ApiError && error.status === 403 && error.code === "EMAIL_NOT_VERIFIED",
  );
});

const SIGNUP_BODY = {
  username: "tester",
  password: "Password1!",
  studentNumber: 2315,
  name: "장윤호",
  email: "tester@dsm.hs.kr",
  emailVerifiedToken: "verified-1",
};

test("회원가입은 토큰 없이 보내고, 성공하면 로그인처럼 받은 토큰을 저장함", async () => {
  const { storage, current } = memoryStorage();
  const { fetchFn, calls } = fakeFetch(() => json(201, NEW));
  const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });

  await api.auth.signup(SIGNUP_BODY);

  assert.equal(calls.length, 1);
  assert.equal(calls[0].path, "/auth/signup");
  assert.equal(calls[0].method, "POST");
  assert.equal(calls[0].authorization, null);
  assert.deepEqual(calls[0].body, SIGNUP_BODY);
  assert.deepEqual(current(), NEW);
  assert.equal(api.auth.isLoggedIn(), true);
});

test("회원가입이 409면 서버 코드 그대로 던지고 토큰을 저장하지 않음", async () => {
  const { storage, current } = memoryStorage();
  const { fetchFn } = fakeFetch(() =>
    json(409, { code: "USERNAME_ALREADY_EXISTS", message: "이미 사용 중인 아이디입니다." }),
  );
  const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });

  await assert.rejects(
    api.auth.signup(SIGNUP_BODY),
    (error: unknown) =>
      error instanceof ApiError && error.status === 409 && error.code === "USERNAME_ALREADY_EXISTS",
  );
  assert.equal(current(), null);
});

test("회원가입 응답에 토큰이 없으면 저장하지 않고 에러", async () => {
  const { storage, current } = memoryStorage();
  const { fetchFn } = fakeFetch(() => json(201, { message: "ok" }));
  const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });

  await assert.rejects(
    api.auth.signup(SIGNUP_BODY),
    (error: unknown) => error instanceof ApiError && error.code === "INVALID_RESPONSE",
  );
  assert.equal(current(), null);
});
