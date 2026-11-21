# 59 - BP01-035 second clause and the open movement question

**Status: ESCALATE-OPEN (scope is a user decision; whether attaching a card from the field is a movement is unanswered)**

> Source note: L<n> citations refer to a private chat export and cannot be re-checked by readers. This text is a paraphrase, and people appear by role only.

## The question

BP01-035 has two clauses that are easy to mix up. Which one is scripted in the simulator, and what is still unknown?

1. The first clause is a counter or action effect. It was already scripted and is unchanged.
2. The second clause is a battle trigger: "that character may take BATTLE Move once". This is the part that is now scripted.
3. Separately, the card involves attaching from the field. Is that attach itself a movement, and does it count as a BATTLE Move? Nobody has answered this.

## Positions

| # | Item | Status | Tier |
|---|---|---|---|
| 1 | Counter or action clause is scripted | done, unchanged | card text |
| 2 | The battle trigger "may take BATTLE Move once" is scripted | decided | user decision on scope |
| 3 | Whether the attach from the field is a movement | open | unanswered |

Compared with each other: item 2 only follows the printed card text, so it needs no ruling. Item 3 is a real rules question, and the simulator does not guess at it.

## What the head judge said

Nothing on the movement question. The question was asked in the chat in the discussion recorded as 04 and was left unanswered.

## Verdict

Authority tier: user decision for the scope; none for the movement question. The status stays ESCALATE-OPEN because of item 3.

Step by step, this is what the simulator does:

1. The counter or action clause behaves as before.
2. When the battle trigger applies, the chosen character may take a BATTLE Move once.
3. The attach-from-field part is not implemented as settled. The simulator marks it as open rather than deciding whether it is a movement.

Item 3 must not be cited as a rule. It needs a head judge answer.

## Rulebook check

- The rulebook defines detach as a movement; whether attaching from the field is a movement is not addressed.
- Nothing else in the rulebook answers the open question, so none is cited beside it.

## Scripts and engine

Only BP01-035 is affected. The script covers the battle trigger clause; the open movement part carries a marker in the code and is not implemented as settled.
