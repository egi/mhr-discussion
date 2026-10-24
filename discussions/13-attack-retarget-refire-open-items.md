# 13 - Attack declaration and re-selection: engine choices that rest on inference

**Status: ESCALATE-OPEN (three items; nothing here is a head judge ruling on the exact point)**

> Source note: L<n> citations refer to a private chat export and cannot be re-checked by readers. This text is a paraphrase, and people appear by role only.

## The question

Splitting an attack into declaration, Counter Step and confirmation forces three choices that neither the Comprehensive Rules v1.03 nor the chat settles. Each is implemented as a provisional default and stays open until the head judge rules.

1. Does a retarget (returning to the choice of an Attack Target) fire "when this attacks" triggers again?
2. Is there a window to use "when this attacks" before the target is chosen?
3. Does a retarget open a fresh Counter Step?

## Positions

| # | Item | Status | Tier |
|---|---|---|---|
| 1 | A retarget does not fire the trigger again | open, provisional | inference from two head judge statements |
| 2 | No window before the target is chosen | open, provisional | none |
| 3 | A fresh Counter Step follows a retarget | open, provisional | none; inferred from the step ordering |

An earlier discussion (06) leaned the other way on item 1. It predates a later head judge statement and is left as written.

## What the head judge said

On 24 Sep the head judge said that a trigger on attacking runs when the attack is declared. On 13 Oct the head judge said that when the attacking character changes, the first battle fizzles and the attack is declared again, while a plain retarget only repeats the choice of target and needs no new declaration. Taken together these suggest a retarget is not a new declaration. Neither statement is about "when this attacks" and re-selection directly.

## Verdict

Authority tier: none for the open halves. All three stay ESCALATE-OPEN and provisional; none may be cited as a rule.

1. Re-fire on retarget: provisional default NO, by user decision of 22 Oct. The rulebook returns the attacker to selecting a target (303.2.a.4.3.1.6 and 303.2.a.4.3.2.2) and has no definition of when "attacks" fires.
2. Pre-target window: provisional default NO. The trigger fires at declaration, after the target is chosen (303.2.a.4.3.1.1).
3. Fresh Counter Step: provisional default YES, a user decision. After a re-selection the battle runs a new Counter Step, opponent first, before confirmation. This is inferred from the ordering of 303.2.a.4.3 and is not rule text.

Question for the head judge on each: do triggers fire again, is there an earlier window, and do both players get a new round of Counter Step actions after a re-selection.

## Rulebook check

- 303.2.a.4.3.1.1: the Character attacks by choosing a target and a battle occurs.
- 303.2.a.4.3.1.6 and 303.2.a.4.3.2.2: after the original target becomes invalid, return to selecting an Attack Target.
- 303.2.a.4.3: Select Target Step, then Counter Step, then Confirmation Step.

## Scripts and engine

Engine markers (for grep): discussion 13 item 1, 2 and 3 in the effect trigger scan and in the turn engine's re-selection branch. Scripts that move an attacking opposing character out of BATTLE or that retarget an attack, and so touch a re-selection: BP01-013 and the BLOCK script SD04-004.
