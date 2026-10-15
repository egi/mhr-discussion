/**
 * The package boundary gate.
 *
 * `@mhr/core` is the shared leaf: production source imports zod and itself. `@mhr/effects-ir`
 * sits on top of it: production source imports `@mhr/core`, zod and itself. Neither package
 * may load card data or touch the filesystem, so a Node builtin, a JSON file or any other
 * package is rejected mechanically instead of by review.
 *
 * `to.path` is matched against the cwd-relative *resolved* path, so an import
 * that fails to resolve is classified `unknown`, no path clause matches, and a
 * path-only rule stays green while the boundary is broken. That is why the
 * `*-no-unknown-modules` rules exist, and why every rule is `error` rather than `warn`: only
 * `error` produces a non-zero exit for the `err` / `err-long` reporters.
 *
 * scripts/check-boundary-control.sh runs before this config in CI and proves,
 * on deliberate violations, that each rule here actually fires.
 */

/**
 * Resolved location of a package under pnpm's isolated store, as dependency-cruiser
 * reports it (verified: zod resolves to node_modules/.pnpm/zod@<ver>/node_modules/zod/).
 */
const pnpmPackage = (name) => `^node_modules/\\.pnpm/${name}@[^/]+/node_modules/${name}/`;

/** Test files and the project config legitimately import vitest; production source never. */
const CORE_TEST_FILES = '^packages/core/(vitest\\.config\\.ts$|.*\\.test\\.ts$)';
const IR_TEST_FILES = '^packages/effects-ir/(vitest\\.config\\.ts$|.*\\.test\\.ts$)';

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'core-only-zod',
      comment:
        'packages/core is the shared leaf: its production source imports zod and itself, nothing else. ' +
        'Any other package, a Node builtin, or a JSON file (rule or card text) is rejected.',
      severity: 'error',
      from: { path: '^packages/core/', pathNot: CORE_TEST_FILES },
      to: { pathNot: ['^packages/core/', pnpmPackage('zod')] },
    },
    {
      name: 'core-tests-only-vitest-zod',
      comment:
        'Core test files and its vitest project config may additionally import vitest; nothing else.',
      severity: 'error',
      from: { path: CORE_TEST_FILES },
      to: { pathNot: ['^packages/core/', pnpmPackage('zod'), pnpmPackage('vitest')] },
    },
    {
      name: 'core-no-effects-ir-import',
      comment:
        'core is the upstream leaf. The dependency direction is effects-ir to core only; an import the ' +
        'other way would create a cycle between the two packages.',
      severity: 'error',
      from: { path: '^packages/core/' },
      to: { path: '^packages/effects-ir/' },
    },
    {
      name: 'core-no-unknown-modules',
      comment:
        'Fail loudly on an unresolved import in core, otherwise the path rules above silently pass.',
      severity: 'error',
      from: { path: '^packages/core/' },
      to: { dependencyTypes: ['unknown', 'undetermined', 'npm-no-pkg', 'npm-unknown'] },
    },
    {
      name: 'effects-ir-only-core-zod',
      comment:
        'packages/effects-ir production source imports @mhr/core, zod and its own TypeScript source, ' +
        'nothing else. A Node builtin, a JSON file or a path to card data is rejected, so no loader ' +
        'for card text can enter the package.',
      severity: 'error',
      from: { path: '^packages/effects-ir/', pathNot: IR_TEST_FILES },
      to: { pathNot: ['^packages/effects-ir/src/.*\\.ts$', '^packages/core/', pnpmPackage('zod')] },
    },
    {
      name: 'effects-ir-tests-only-vitest-core-zod',
      comment:
        'effects-ir test files and its vitest project config may additionally import vitest; nothing else.',
      severity: 'error',
      from: { path: IR_TEST_FILES },
      to: {
        pathNot: [
          '^packages/effects-ir/',
          '^packages/core/',
          pnpmPackage('zod'),
          pnpmPackage('vitest'),
        ],
      },
    },
    {
      name: 'effects-ir-no-unknown-modules',
      comment:
        'Fail loudly on an unresolved import in effects-ir, otherwise the path rules above silently pass.',
      severity: 'error',
      from: { path: '^packages/effects-ir/' },
      // `@mhr/core` resolves to an in-repo source file, but its `catalog:` manifest spec leaves
      // the dependency type "undetermined"; a resolved core file is not an unresolved import.
      to: {
        dependencyTypes: ['unknown', 'undetermined', 'npm-no-pkg', 'npm-unknown'],
        pathNot: '^packages/core/src/',
      },
    },
    // Reporting-only signal; not part of the boundary contract.
    {
      name: 'no-circular',
      severity: 'warn',
      from: { pathNot: '^node_modules' },
      to: { circular: true },
    },
  ],
  options: {
    // Required: without the tsConfig the `paths` aliases mis-resolve and every
    // aliased import degrades into an `unknown` dependency.
    tsConfig: { fileName: 'tsconfig.base.json' },
    // Type-only imports are still coupling, so they are cruised too.
    tsPreCompilationDeps: true,
    // Monorepo: merge manifests upward, nearest wins.
    combinedDependencies: true,
    enhancedResolveOptions: {
      extensions: ['.ts', '.tsx', '.js', '.json'],
      // A modern package can expose a subpath only through its `exports` map,
      // `vitest/config` has no physical config.js on disk. Without these two
      // options such an import is classified `unknown`, and the unknown-modules
      // rules then fire on a legitimately resolvable import.
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
    // Include external modules as leaves so the rules can judge them, but never
    // traverse into their own dependency trees.
    //
    // Do NOT reintroduce `includeOnly` here. It filters modules out of the graph
    // by path, and an unresolvable import has no path to match, so the
    // dependency is dropped before the unknown-modules rules can see it. Same for
    // `exclude`: it deletes edges rather than reporting them.
    doNotFollow: { path: 'node_modules|dist' },
    reporterOptions: { text: { highlightFocused: true } },
  },
};
