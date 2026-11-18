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

test("다른 탭이 먼저 재발급해 거절되면 그 탭의 새 토큰으로 다시 요청함", async () => {
  const { storage, current } = memoryStorage(OLD);
  let expired = 0;
  const { fetchFn, calls } = fakeFetch((call) => {
    if (call.path === "/auth/reissue") {
      // 이 탭의 재발급 요청이 서버에 닿는 동안 다른 탭이 먼저 바꿔 저장함
      storage.set(NEW);
      return json(401, { code: "INVALID_REFRESH_TOKEN", message: "폐기된 토큰" });
    }
    if (call.authorization === "Bearer access-new") return json(200, { ok: true });
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
  assert.deepEqual(current(), NEW);
  assert.equal(expired, 0);
  assert.equal(calls.at(-1)?.authorization, "Bearer access-new");
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

  assert.equal(received?.body, form);
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

test("다른 계정으로 다시 로그인하면 이전 재발급을 기다리지 않고, 이전 요청을 새 계정으로 보내지 않음", async () => {
  const { storage } = memoryStorage(OLD);
  const B: AuthTokens = { accessToken: "access-b", refreshToken: "refresh-b" };
  const B2: AuthTokens = { accessToken: "access-b2", refreshToken: "refresh-b2" };
  const { fetchFn, calls } = fakeFetch(async (call) => {
    if (call.path === "/auth/login") return json(200, B);
    if (call.path === "/auth/reissue") {
      const { refreshToken } = call.body as { refreshToken: string };
      if (refreshToken === "refresh-old") {
        await sleep(30);
        return json(401, { code: "INVALID_REFRESH_TOKEN", message: "폐기된 토큰" });
      }
      return json(200, B2);
    }
    if (call.authorization === "Bearer access-b2") return json(200, { path: call.path });
    return json(401, { code: "INVALID_TOKEN", message: "만료" });
  });
  const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });

  const oldRequest = api.patch("/students/1", { name: "A가 보낸 수정" });
  await sleep(5);
  await api.auth.login({ username: "b", password: "Password1!" });
  const started = Date.now();
  const newResult = await api.get("/teachers");

  assert.deepEqual(newResult, { path: "/teachers" });
  assert.ok(Date.now() - started < 25, "이전 계정의 재발급을 기다리지 않아야 함");
  await assert.rejects(oldRequest, ApiError);
  assert.equal(
    calls.some((call) => call.path === "/students/1" && call.authorization === "Bearer access-b2"),
    false,
  );
});

test("재발급을 기다리는 동안 취소하면 그 요청만 바로 끝남", async () => {
  const { storage } = memoryStorage(OLD);
  const { fetchFn } = fakeFetch(async (call) => {
    if (call.path === "/auth/reissue") {
      await sleep(50);
      return json(200, NEW);
    }
    if (call.authorization === "Bearer access-new") return json(200, { ok: true });
    return json(401, { code: "INVALID_TOKEN", message: "만료" });
  });
  const api = createApiClient({ baseUrl: BASE, storage, fetch: fetchFn });
  const controller = new AbortController();

  const cancelled = api.get("/students", { signal: controller.signal });
  const other = api.get("/teachers");
  await sleep(5);
  const abortedAt = Date.now();
  controller.abort();

  await assert.rejects(cancelled, (error: unknown) => error instanceof Error && error.name === "AbortError");
  assert.ok(Date.now() - abortedAt < 25, "취소하면 재발급을 끝까지 기다리지 않아야 함");
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

test("재발급 거절 응답을 읽는 사이 다른 탭이 로그인하면 그 토큰을 지우지 않음", async () => {
  const { storage, current } = memoryStorage(OLD);
  let expired = 0;
  const { fetchFn } = fakeFetch((call) => {
    if (call.path === "/auth/reissue") {
      // 헤더는 왔고 본문을 읽는 동안 다른 탭이 새로 로그인해 저장함
      setTimeout(() => storage.set(NEW), 0);
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
    if (call.authorization === "Bearer access-new") return json(200, { ok: true });
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
  assert.deepEqual(current(), NEW);
  assert.equal(expired, 0);
});
