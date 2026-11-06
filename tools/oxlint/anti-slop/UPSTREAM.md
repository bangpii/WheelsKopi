# Anti-slop vendored plugin

Source: unknown (installed from the `install-anti-slop` skill asset bundle; no upstream repository revision was recorded in the bundle).

Installed plugin paths:

- `tools/oxlint/anti-slop/index.ts` (generic plugin)
- `tools/oxlint/anti-slop/effect/index.ts` (opt-in Effect plugin, not registered)
- `tools/oxlint/anti-slop/vendor/eslint-stylistic/**` (vendored `padding-line-between-statements`, upstream record in `vendor/eslint-stylistic/UPSTREAM.md`)

Configuration: `oxlint.config.ts` registers the generic plugin as `anti-slop`, ignores agent tooling directories and this vendored tree, and enables every generic rule at `"error"`. The Effect plugin is intentionally not registered because this project does not depend on `effect`.

Intentional deviations: none. Dependencies `oxlint` and `@oxlint/plugins` are pinned to the same exact version (`1.89.0`).
