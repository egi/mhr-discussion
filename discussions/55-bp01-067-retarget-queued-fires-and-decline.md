# 55 - BP01-067 retarget: queued fires, no re-fire, decline, Weakness

**Status: ESCALATE-OPEN (provisional user decisions on queued fires and on a declined optional step; the no-refire reason rests on a head judge FAQ statement; nothing here is a head judge ruling on these exact points)**

> Source note: L<n> citations refer to a private chat export and cannot be re-checked by readers. This text is a paraphrase, and people appear by role only.

## The question

BP01-067 (Hostile Focus) sends an attacking character back to choosing a new Attack Target. The rulebook does not say what should happen around that moment, so the simulator had to pick four behaviours. Think of it as four small questions:

1. Some effects are waiting to run because "this character attacks" just happened. If the attacker is retargeted before they run, do they aim at the old target or the new one?
2. Does the retarget itself count as a second "attacks", so those effects fire a second time?
3. BP01-067 can be used once per turn. If the player says no to the optional part, or says yes but there is nobody to pick, is the once-per-turn use spent?
4. Is an empty BATTLE slot that has a Weakness a valid pick for the new target?

## Positions

| # | Item | Status | Tier |
|---|---|---|---|
| 1 | Waiting "attacks" effects follow the new target | open, provisional | user decision, unruled |
| 2 | A retarget does not fire "attacks" again | provisional | head judge FAQ statement (see discussions 06 and 13) |
| 3 | A declined optional step, or a yes with no one to pick, does not spend the once-per-turn use | open, provisional | user decision, unruled |
| 4 | An empty BATTLE slot with a Weakness is a valid new target | settled by the rulebook | rulebook |

Compared with each other: items 2 and 4 stand on something written down (a head judge statement and the rulebook). Items 1 and 3 stand on nothing but a decision to pick the most natural behaviour, so they are the weak ones.

## What the head judge said

Nothing on items 1 and 3. On item 2 the position is the FAQ statement already recorded in discussion 06 and discussion 13 (item 1): a retarget only repeats the choice of the target. It does not make a new declaration. The reason used here is exactly that one, and not the reason "the attack effects had not fired yet".

## Verdict

Authority tier: user decision for items 1 and 3 (provisional); head judge FAQ statement for item 2; rulebook for item 4. The status stays ESCALATE-OPEN while items 1 and 3 have no ruling.

Step by step, this is what the simulator does:

1. The player uses BP01-067 and the attacker is sent back to choosing a target.
2. Effects that were waiting on "this character attacks" are re-pointed to the newly chosen target (item 1, provisional).
3. Nothing fires a second time just because the target changed (item 2).
4. If the player declines the optional step, or accepts it with an empty pool of choices, the once-per-turn use is not recorded (item 3, provisional). The use is recorded only when the step actually did something. A decline of an optional step nested inside a longer effect already behaved this way and still does.
5. When picking the new target, an empty BATTLE slot with a Weakness is offered as a choice (item 4).

Items 1 and 3 must not be cited as rules. If the head judge rules on either, this file should be reopened and the simulator changed to match.

## Rulebook check

- 303.2.a.4.3.1.1: a Character attacks by choosing 1 Character in the opponent's BATTLE or a Weakness within its R as the target, and a battle occurs. This is the basis for item 4: a Weakness is a legal attack target.
- The rulebook has no text for items 1, 2 and 3. It does not define when "attacks" fires, which effects are queued at that point, or whether declining an optional step uses up a once-per-turn limit.

## Scripts and engine

Scripts that read the target chosen at declaration and so are affected by item 1: BP01-081, PB01-002, BP01-105, PB01-007, SD02-014 and SD03-016. Scripts with a once-per-turn optional step as the root of the effect, which item 3 touches: BP01-070, BP01-091, BP01-101, BP01-113, SD01-001, SP01-008, SP01-021 and SP01-055. Related discussions: 06 and 13 (both settled only in part), and 52 and 53 (both ESCALATE-OPEN and not settled here).
