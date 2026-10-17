# mhr-discussion

The effect vocabulary and the 67 authored card scripts used by a Marvel Hero Rush simulator, plus the shared types package `@mhr/core`.

## Quick start

Node 24 (see `.nvmrc`).

```sh
pnpm install
pnpm test
pnpm run ci
```

## What is included

- `packages/core`: `@mhr/core`, shared types
- `packages/effects-ir`: `@mhr/effects-ir` with the IR, schema, combinators, version, auto, registry and the 43 scripts
- `discussions/`: sanitised, paraphrased community rulings with a status board
- `AUTHORITY.md`: which source wins when rulings disagree
- `ERRATA.md` and `errata/`: immutable record of behaviour-changing corrections
- `rules/rule-key-snapshot.json`: rule keys and text hashes only
- `.github/ISSUE_TEMPLATE/challenge.yml`: the issue form for challenging a script
- Tests that use invented fixtures

## What is NOT included

- The rulebook
- A card database
- Card artwork
- Card text other than the quote in each script's header comment
- The interpreter and the simulator

## Usage

```ts
import { cardScript, scriptedCardNumbers } from '@mhr/effects-ir';

const numbers = scriptedCardNumbers(); // sorted
const script = cardScript(numbers[0]);
const ir = script?.(); // an EffectIR
```

`cardScript(cardNo)` returns `undefined` for a card with no script and never throws. An unscripted card is a normal case. `scriptedCardNumbers()` returns the card numbers in sorted order.

## Consumption

Source-only TypeScript exports. Intended to be consumed as a git submodule by the simulator; not published to npm.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Notice

See [NOTICE.md](./NOTICE.md). This is an unofficial fan and educational project.

## Licence

The code is MIT licensed ([LICENSE](./LICENSE)). The short quote in each script's header comment is the publisher's text and is excluded from that licence.
