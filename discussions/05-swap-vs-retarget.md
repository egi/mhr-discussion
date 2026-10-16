# 05 - Swap versus retarget

**Status: CONSENSUS (swap gives no retarget; the rulebook corrects the chat on when a retarget happens)**

> Source note: L<n> citations refer to a private chat export and cannot be re-checked by readers. This text is a paraphrase, and people appear by role only.

## The question

An attacker has chosen a target. The defender uses a swap effect (for example BP01-061 or SD03-009) to exchange the defending card. Does the attacker get to retarget? If the swap leaves the target out of range, what happens?

## Positions

| Role | Date | Cite | Paraphrased position |
|---|---|---|---|
| member | 22 Sep | L7507-7525 | Before the update: first answered that a swap lets the enemy retarget again, with the range still valid. |
| member | 22 Sep | L7525 | Contradicted that: a swapped character is not treated as a changed target. |
| member | 26 Sep | L11887-11911 | Reversed: after declaring, if the target is still valid, no retarget, because the target did not change. Only if range is lost does the target become invalid. |
| member | 26 Sep | L11887-11911 | Agreed: same target means no retarget, and the swapped-in card keeps its status. A member asked the head judge to confirm; no reply. |
| members | 28 Sep | L12738-12772 | Compiled a list of retarget cases (counter call, battle move) and put swap under "no retarget" because no new character appears. |
| members | 1 Oct | L14218-14219 | A swap that is not a counter call leaves the same target, so no retarget. |
| members | 1 Oct | L14392-14446 | Held that a swap to a shorter-range card keeps the counter step open and the target is rechecked only at judgement. The rulebook contradicts this part (below). |
| members | 6 Oct | L17436-17441 | A swap carries the attack status, so no retarget, unless the swap makes the original target unreachable. |
| members | 9 Oct | L19069-19091 | Swapped cards count as the same character; retarget only when the target is invalid. |

After 24 Sep, eight members held that a swap never retargets by itself; nobody held the opposite.

## What the head judge said

Nothing about retarget directly; he was tagged once on this exact question (L11909) and did not reply. His supporting principle (L8121-8126, 22 Sep) is that a swap retains all state, so no new character appears. On 6 Oct (L17571-17574) he distinguished not attacking (never declared) from failing to attack (declared and failed).

## Verdict

Authority tier: CONSENSUS for swap giving no retarget, since the rulebook is silent on swap beyond state exchange. The rulebook corrects the timing the chat assumed: when the target becomes invalid, the game finishes resolving the effects in play and returns to the Select Target Step right away. It does not wait until both players pass, and there is no retarget at judgement. After a retarget a new counter step follows, which also answers the sub-question the chat left open. So a swap alone does not change the target; if the swapped-in card puts the target out of range, the attacker reselects immediately, or the battle ends if no legal target exists.

## Rulebook check

- 303.2.a.4.3.2.2: if the original target becomes invalid during the counter step, finish resolving, then return to the Select Target Step.
- 303.2.a.4.3.1.6: the same for the Select Target Step itself.
- 303.2.a.4.3.2.5: if no valid target within range remains, the battle ends; if one exists again, return to Select Target.
- 303.2.a.4.3.3: the confirmation step only compares power; it has no retarget.
- 301.18.b, 301.18.c: a swap exchanges current state and attached cards; nothing says it makes the target invalid.

## Scripts and engine

Neither the swap cards nor the attack-target logic are fully scripted here. Swap scripts: SD03-009, SD03-003, BP01-106 (see discussion 04). The question whether a retarget re-triggers "when attacks" effects is open, see discussion 06.
