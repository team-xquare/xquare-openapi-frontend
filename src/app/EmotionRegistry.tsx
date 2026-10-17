"use client";

import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { useServerInsertedHTML } from "next/navigation";
import { useState, type ReactNode } from "react";

export default function EmotionRegistry({ children }: { children: ReactNode }) {
  const [{ cache, flush }] = useState(() => {
    const cache = createCache({ key: "xquare" });
    // In compat mode Emotion stores generated CSS in `cache.inserted` instead
    // of returning an inline <style> node from each styled component. The
    // registry below then emits those styles once through Next's SSR hook.
    cache.compat = true;
    const previousInsert = cache.insert;
    let inserted: string[] = [];

    cache.insert = (selector, serialized, sheet, shouldCache) => {
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }

      return previousInsert(selector, serialized, sheet, shouldCache);
    };

    return {
      cache,
      flush: () => {
        const names = inserted;
        inserted = [];
        return names;
      },
    };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) return null;

    return (
      <style
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{
          __html: names
            .map((name) => cache.inserted[name])
            .filter((styles): styles is string => typeof styles === "string")
            .join(""),
        }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
