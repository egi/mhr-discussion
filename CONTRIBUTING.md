# Contributing

Please read [NOTICE.md](./NOTICE.md) first. It explains what this project is and what it does not contain.

## Getting started

Node 24 is pinned in `.nvmrc`.

```sh
pnpm install
pnpm test
pnpm run ci
```

## Adding or changing a card script

1. Write `packages/effects-ir/src/scripts/<CARD-NO>.ts` exporting `CARD_NO` and `script`.
2. Append one entry to the manifest in `packages/effects-ir/src/scripts/index.ts`, keyed by the card number.
3. `CARD_NO` and the manifest key must match. `registry.test.ts` fails if a script file has no manifest entry, or an entry has no file.

Rules for the file:

- The header comment holds only the effect text quote, under the line `Printed text (official card):`. No card name, no flavour text, no artwork reference, no layout.
- A script never reads any data file. It is a pure function returning an `EffectIR`.
- When parallel changes both edit the manifest, combine the entries from both sides; never drop one.

## What must never be committed

- Chat exports, phone numbers, member names or handles
- Card artwork or image files, and vendor URLs
- Rulebook text
- Card text beyond the header quote of a script

## Automated checks

- `pnpm check:privacy` runs the local privacy checks, including `node scripts/check-denylist.mjs`, which compares tokens against a list of salted hashes.
- `bash scripts/install-gitleaks.sh` installs the pinned gitleaks, and `bash scripts/gitleaks-scan.sh history` scans the full history. The same scan runs in CI on every push and pull request.
- The gate covers phone numbers and chat-export patterns, member names and handles, and card art and vendor URLs.
- The gate does not detect card text. Reviewers must check every pull request diff for card text beyond the header quote, and such changes are rejected in review.

`node scripts/denylist-add.mjs` is for maintainers. The denylist contains only hashes.

## Takedown requests

To request removal of a quote, send a takedown request in either of two ways:

- Email `mhr.rubdown267@simplelogin.com`, or message [@agastiyasm on Threads](https://www.threads.com/@agastiyasm).
- Open an issue with the `takedown` label.

Quotes named in a takedown request are removed within 72 hours, and each takedown removal is recorded in [CHANGELOG.md](./CHANGELOG.md). See [NOTICE.md](./NOTICE.md).

## Licence of contributions

Contributions are licensed under the repository licence ([LICENSE](./LICENSE)). There is no CLA and no DCO. See [NOTICE.md](./NOTICE.md).
