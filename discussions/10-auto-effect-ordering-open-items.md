# 10 - Auto-effect ordering: engine choices that rest on inference

**Status: ESCALATE-OPEN (four items; nothing here is a head judge ruling)**

> Source note: L<n> citations refer to a private chat export and cannot be re-checked by readers. This text is a paraphrase, and people appear by role only.

## The question

Ordering continuous (Auto) effects and resolving effects partially forces four choices that neither the Comprehensive Rules v1.03 nor the chat settles. Each is implemented provisionally and carries a code marker so it cannot be mistaken for a rule. All four are open and provisional.

## Positions

| # | Item | Status | Tier |
|---|---|---|---|
| 1 | Tie-break for Auto effects that begin applying at the same moment | open, provisional | none |
| 2 | A 0-Power retreat when the value passes through 0 but settles above it | open, provisional | rulebook for the pieces, inference for the combination |
| 3 | An "If you do" step after a partly done step | open for the interaction; the "do as much as you can" half is HEAD-JUDGE | head judge plus rulebook for one half |
| 4 | Combinations that 301.41 has no letter for | open, provisional | none for (a); head judge for accumulation in general, inference for the arithmetic in (b) |

No member or judge ruled on any of the four. Related chat: the example in discussion 09 (an Auto effect overwritten by an attached "changes to" effect, the first applying again when the attachment leaves).

## What the head judge said

Nothing on these four exact questions. For item 3 the head judge said "do as much as you can" still applies (25 Sep, L10998-10999). For item 4(b) the head judge said plain reductions accumulate (24 Sep, L10689-10695).

## Verdict

Authority tier: none for the open halves. All four stay ESCALATE-OPEN and provisional; none is settled, and none may be cited as a rule.

1. AUTO same-moment tie-break (provisional). The rulebook orders modifiers by whether the card is already being affected (former versus latter) and has no order for Auto effects starting at the same moment. The turn-player-first rule is written for triggers, not Auto effects. Engine choice, inferred by analogy and never presented as a rule: turn player first, then the controller's board order. Question for the head judge: when two Auto effects changing the same Lv, R or Power begin applying at the same moment, which is the former and which is the latter?
2. 0-Power retreat latch (provisional). The pieces come from the rulebook (a reduction to 0 retreats the character; once 0 the retreat is locked in; the minimum is 0 but extra reduction still exists). The engine retreats only on the settled value of the ordered pass, not on a transient zero, and only when some reduction was applied. Question for the head judge: if an ordered Auto pass passes through 0 but settles above 0, does the character still retreat?
3. "If you do" under partial resolution (open interaction). A step applies to as many targets as exist and counts as done if any changed; an "if you do" step still depends on the previous step having changed something. Question for the head judge: when a step is only partly done, does the following "If you do" step resolve? The mismatch with the "do as much as you can" principle is the reason this is open.
4. Unlettered 301.41 combinations (provisional). (a) A later trigger or activated change after an earlier trigger or activated change has no letter in the rulebook; the engine lets the later replace the former. (b) An increase and a decrease among themselves accumulate; P1000 with +500 then -500 reading 1000 is an inference, asked once and not answered. Question for the head judge: confirm (a) and (b).

Two implementation constants are engineering choices, not rulings: a fixpoint iteration cap and a derive cache key. They must not be cited as rules.

## Rulebook check

- 301.41.a to 301.41.n: ordering of Lv, R and Attack Power changes by former and latter effect.
- 304.1.g: turn player first for triggered effects (not for Auto effects).
- 304.1.d: resolve to the greatest extent possible.
- 301.16.a.1: a character whose Attack Power is reduced to 0 by an effect retreats; 301.16.b: once 0, the retreat is locked in.
- 301.8.a, 301.8.b: minimum Attack Power; reduction beyond the minimum still exists.

## Scripts and engine

Engine markers (for grep): OPEN-RULING 10.1, OPEN-RULING 10.2, OPEN-RULING 10.3, OPEN-RULING 10.4, matching the four items. Scripts that sequence steps with an "if you do" clause and therefore depend on item 3: BP01-002, BP01-005, BP01-009, BP01-013, BP01-017, BP01-019, BP01-020, BP01-077, BP01-085, BP01-087, BP01-106, BP01-118, SD01-007, SD02-005, SD02-008, SD03-003, SD03-008, SD04-002, SD04-006, SP01-043, SP01-048.
