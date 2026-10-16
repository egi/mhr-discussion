# 09 - Order of applying effects when several cards are involved

**Status: RESOLVED (rulebook and head judge rulings for the cases below; two sub-points are inference and listed as open)**

> Source note: L<n> citations refer to a private chat export and cannot be re-checked by readers. This text is a paraphrase, and people appear by role only.

## The question

When several effects are in play at once, in what order do they apply? Sub-questions: is there a stack, what happens to a trigger caused by an effect that is still resolving, who orders simultaneous triggers, how do partial effects work, how do several changes to Lv, R or Power combine, and what happens at the end of the turn.

## Positions

| # | Situation | Answer | Tier | Cite |
|---|---|---|---|---|
| 1 | Is there a chain or stack? | No. A played card or effect resolves immediately. | HEAD-JUDGE, rulebook | L9907-9910, L10602-10605 |
| 2 | An effect triggers while another resolves | Finish the current one first; the new one waits in a queue. | Rulebook, plus three members agreeing | L2274-2286 |
| 3 | Several of my own triggers at the same timing | I choose their order. | Rulebook | L5246-5258 |
| 4 | Both players have triggers at the same timing | The turn player orders and resolves theirs first. | Rulebook, members agree | L14025, L18671 |
| 5 | An effect that can only be partly done | Do as much as you can; the cost is separate from the effect. | HEAD-JUDGE, rulebook | L10998-10999 |
| 6 | Two identical triggers, the first changes the state | Resolve one at a time; the second checks its condition when it resolves and may do nothing. | HEAD-JUDGE | L15378-15385 |
| 7 | A trigger versus a counter action | The trigger must be played when its condition occurs, before you respond with a counter. | HEAD-JUDGE | L10062-10125 |
| 8 | Counter step action order | The opponent acts first, one action at a time, alternating; it ends only when both pass in a row. | HEAD-JUDGE, rulebook | L10062, L10619-10622 |
| 9 | Several modifiers on the same Lv, R or Power | A change ends earlier modifiers; plus and minus after a change use the changed value; plain plus and minus together accumulate. | HEAD-JUDGE, rulebook | L10689-10695 |
| 10 | End of turn: "this turn" effects versus end-of-turn triggers | End-of-turn triggers first, then the "this turn" effects end. | HEAD-JUDGE, rulebook | L16575-16605 |
| 11 | An effect whose cost prunes its own card versus an effect that prunes it | If pruning is the cost, simultaneous removal makes it fail; if pruning is part of the effect, both resolve. | CONSENSUS | L13757-13760 |

Dates: items 1, 5 to 9 are mostly 24 Sep to 25 Sep; item 6 is 2 Oct; item 10 is 4 Oct to 9 Oct.

## What the head judge said

- 24 Sep (L9907-9910): effects do not resolve backwards; a played card resolves at once.
- 25 Sep (L10998-10999): "do as much as you can" still applies.
- 24 Sep (L10062): in the counter step a player who passed may respond again after the opponent responds.
- 24 Sep (L10081-10087): in a counter-versus-trigger case the trigger must be thrown in first, then the counter response.
- 24 Sep (L10689-10695): when a card is lowered and then changed, the change is what applies, and the keyword is "change"; two plain reductions accumulate.
- 2 Oct (L15378-15385): when two identical triggers resolve one after the other, the second does nothing if its condition no longer holds; the condition is read at resolution.
- 4 Oct (L16575-16605): confirmed the end-of-turn order (trigger first, then effects of this turn end).

## Verdict

Authority tier: HEAD-JUDGE for items 1, 5 to 10; RULEBOOK for 2 to 4; CONSENSUS for 11. Reading the table: there is no stack. Effects resolve at once; a new trigger caused during a resolution is queued; the turn player's triggers go first; partial effects resolve as far as possible; a later change to Lv, R or Power replaces earlier modifiers and later plus or minus builds on it; end-of-turn triggers run before "this turn" effects disappear. The 24 Sep chat summary that range follows the latest effect while power accumulates was partly wrong; the keyword is "change".

Open points, not settled:

1. Two plus/minus effects in a row: accumulation is supported by the head judge's statement, but a specific arithmetic example got no direct answer. Accumulating gives the expected sum; this is inference only and is also listed in discussion 10.
2. A queued trigger caused by an attachment-related condition rests on one member's answer plus rulebook 304.1.e and 304.1.h; the head judge stayed out of it.

Also open elsewhere: whether a retarget re-triggers "when attacks" effects (discussion 06). The post-update recap of counter action order (L10619-10622) is a community summary, not a head judge statement.

## Rulebook check

- 304.1.c: a triggered effect resolves immediately; 304.2.a: an activated effect resolves immediately.
- 304.1.d: an effect must be resolved to the greatest extent possible.
- 304.1.e, 304.1.h: other triggers wait while an effect resolves; a new trigger is resolved after the current effect finishes.
- 304.1.f: you order your own simultaneous triggers; 304.1.g: the turn player first, hand triggers are slotted in the order.
- 304.1.a, 304.1.b: optional versus mandatory triggers; 304.2.b, 304.2.c: an activated effect can only be activated if there is something to resolve.
- 303.2.a.4.3.2.1 and 303.2.a.4.3.2.4: counter step alternates and ends when both pass; 303.2.a.4.3.2.2: an invalid target returns to Select Target at once (discussion 05).
- 301.41.a to 301.41.n: a change ends earlier increase, decrease or change (details by combination); a later increase or decrease uses the changed value; swapping values is a change.
- 303.2.a.6.1.1, 303.2.a.6.1.2, 303.2.a.6.1.3: end-of-turn triggers, then "this turn" effects end, then the hand-size discard. 303.2.a.6.1.1.1: a trigger created after that point misses its timing.

## Scripts and engine

Scripts whose steps use an "if you do" style sequence, which depend on the partial-resolution items here and in discussion 10: BP01-002, BP01-005, BP01-009, BP01-013, BP01-017, BP01-019, BP01-020, BP01-077, BP01-085, BP01-087, BP01-106, BP01-118, SD01-007, SD02-005, SD02-008, SD03-003, SD03-008, SD04-002, SD04-006, SP01-043, SP01-048.
