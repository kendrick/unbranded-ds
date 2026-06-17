# Contract: failure modes (Section XI.4)

Four structured failures. Each carries a stable `code` an agent matches on. Three are recoverable and route through the existing non-throwing `warn()` helper (`packages/react/src/lib/warn.ts`); the fourth throws, because there is no usable state to return.

## `warn()` payload shape

`warn()` already exists and emits `{ component, issue, ...payload }` to the console without throwing. These failures add a `code` so the warned and thrown cases match uniformly:

```ts
warn({ component: 'useTheme', issue: 'invalid-value', code: 'THEME_INVALID_VALUE', axis, value, available });
```

## The four codes

| Code                     | Trigger                                                         | Behavior    | Extra payload                |
| ------------------------ | --------------------------------------------------------------- | ----------- | ---------------------------- |
| `THEME_INVALID_VALUE`    | `set()` given a value not in `available[axis]` and not `system` | warn, no-op | `axis`, `value`, `available` |
| `THEME_AXIS_FORCED`      | `set()` targets a `forced` axis                                 | warn, no-op | `axis`, `value`, `forced`    |
| `THEME_NO_SYSTEM_SOURCE` | `system` set on an axis with no OS signal (e.g. density)        | warn, no-op | `axis`                       |
| `THEME_NO_PROVIDER`      | `useTheme()` called with no `<ThemeProvider>` ancestor          | **throw**   | `code` on the error          |

## The thrown case

```ts
class ThemeProviderError extends Error {
	code: 'THEME_NO_PROVIDER';
}
```

The message names the fix ("wrap your tree in `<ThemeProvider>`"). Throwing rather than returning fabricated defaults surfaces the wiring bug immediately and avoids masking it (clarify Q6).

## Why this split

The first three are recoverable developer mistakes that should not crash a consumer page, matching the non-throwing `warn()` convention from spec 004. A missing provider is structural: there is no coherent state to hand back, so a hard error is the legible outcome for both a human and an agent.
