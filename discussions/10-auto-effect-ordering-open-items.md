# 10 - Auto-effect ordering: engine choices that rest on inference

**Status: ESCALATE-OPEN (items 1, 2 and 4 open; item 3 closed 2026-11-04 by user decision, Reading B; nothing here is a head judge ruling)**

> Source note: L<n> citations refer to a private chat export and cannot be re-checked by readers. This text is a paraphrase, and people appear by role only.

## The question

Ordering continuous (Auto) effects and resolving effects partially forces four choices that neither the Comprehensive Rules v1.03 nor the chat settles. Each is implemented provisionally and carries a code marker so it cannot be mistaken for a rule. All four are open and provisional.

## Positions

| # | Item | Status | Tier |
|---|---|---|---|
| 1 | Tie-break for Auto effects that begin applying at the same moment | open, provisional | none |
| 2 | A 0-Power retreat when the value passes through 0 but settles above it | open, provisional | rulebook for the pieces, inference for the combination; the effect's later steps stopping after a zero is a user decision (2026-11-10) |
| 3 | An "If you do" step after a partly done step | CLOSED 2026-11-04 by user decision (Reading B: the step before "If you do" must be done in full; CR 301.38.a); the "do as much as you can" half is HEAD-JUDGE | rulebook 301.38.a plus user decision; head judge for the other half |
| 4 | Combinations that 301.41 has no letter for | open, provisional | none for (a); head judge for accumulation in general, inference for the arithmetic in (b) |

No member or judge ruled on any of the four. Related chat: the example in discussion 09 (an Auto effect overwritten by an attached "changes to" effect, the first applying again when the attachment leaves).

## What the head judge said

Nothing on these four exact questions. For item 3 the head judge said "do as much as you can" still applies (25 Sep, L10998-10999). For item 4(b) the head judge said plain reductions accumulate (24 Sep, L10689-10695).

## Verdict

Authority tier: item 2 is HEAD-JUDGE (F-33) and item 3 is a closed user decision; items 1 and 4 stay ESCALATE-OPEN and provisional, and may not be cited as rules.

1. AUTO same-moment tie-break (provisional). The rulebook orders modifiers by whether the card is already being affected (former versus latter) and has no order for Auto effects starting at the same moment. The turn-player-first rule is written for triggers, not Auto effects. Engine choice, inferred by analogy and never presented as a rule: turn player first, then the controller's board order. Question for the head judge: when two Auto effects changing the same Lv, R or Power begin applying at the same moment, which is the former and which is the latter?
2. 0-Power retreat latch (HEAD-JUDGE via FAQ F-33, 31 Oct 2026, relayed by mhrdecklab; the original chat line was not re-read). A reduction to 0 retreats the character at once and the retreat is locked in (CR 301.16.a.1, 301.16.b; the minimum is 0 but extra reduction still exists, 301.8.a-b). The engine latches at the first zero produced by an applied Power reduction in the ordered pass, even if a later increase settles above 0; a printed Power of 0 with no reduction does not retreat. Implementation boundary, not a ruling: a zero that exists only in an earlier fixpoint-iteration pass is not latched. Remaining steps of the same effect stop (2026-11-10): once a step takes a character to 0 by a reduction, the effect's later steps do not run. Tiers kept apart: "Power 0 waits for nothing" (the retreat at once) is HEAD-JUDGE (31 Oct); that the same effect's later steps stop is a USER DECISION of 2026-11-10 and no source says it. One member view holds that a Freedom-Will-style effect still resolves after the character dies; the head judge outranks a member view but did not rule on later steps either, so the stop stays a user decision, not a ruling. It is not a partial result under 304.1.d: the later steps are not attempted. An effect whose later step is unrelated to the zeroed character also stops (unruled). Order matters: "+1000 then move" keeps the character, "move then +1000" loses it.
3. "If you do" under partial resolution (CLOSED 2026-11-04, user decision, Reading B: a step after "If you do" resolves only when the step before it was done in full, CR 301.38.a; the engine default). Earlier text, kept for the record: A step applies to as many targets as exist and counts as done if any changed; an "if you do" step still depends on the previous step having changed something. Question for the head judge: when a step is only partly done, does the following "If you do" step resolve? The mismatch with the "do as much as you can" principle is the reason this is open.
4. Unlettered 301.41 combinations (provisional). (a) A later trigger or activated change after an earlier trigger or activated change has no letter in the rulebook; the engine lets the later replace the former. (b) An increase and a decrease among themselves accumulate; P1000 with +500 then -500 reading 1000 is an inference, asked once and not answered. Question for the head judge: confirm (a) and (b).

Two implementation constants are engineering choices, not rulings: a fixpoint iteration cap and a derive cache key. They must not be cited as rules.

## Rulebook check

- 301.41.a to 301.41.n: ordering of Lv, R and Attack Power changes by former and latter effect.
- 304.1.g: turn player first for triggered effects (not for Auto effects).
- 304.1.d: resolve to the greatest extent possible.
- 301.16.a.1: a character whose Attack Power is reduced to 0 by an effect retreats; 301.16.b: once 0, the retreat is locked in.
- 301.8.a, 301.8.b: minimum Attack Power; reduction beyond the minimum still exists.

## Scripts and engine

Engine markers (for grep): OPEN-RULING 10.1, OPEN-RULING 10.3, OPEN-RULING 10.4 (10.2 retired 2026-11-09). Scripts that sequence steps with an "if you do" clause and therefore depend on item 3: BP01-002, BP01-005, BP01-009, BP01-013, BP01-017, BP01-019, BP01-020, BP01-077, BP01-085, BP01-087, BP01-106, BP01-118, SD01-007, SD02-005, SD02-008, SD03-003, SD03-008, SD04-002, SD04-006, SP01-043, SP01-048.
