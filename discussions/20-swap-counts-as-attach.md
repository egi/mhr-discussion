# 20 - A swap counts as an attach

**Status: ESCALATE-OPEN (nothing here is a head judge ruling; do not implement either reading as settled)**

> Source note: L<n> citations refer to a private chat export and cannot be re-checked by readers. This text is a paraphrase, and people appear by role only.

## The question

Does a swap count as an attach or a placement, so that "when this card is attached" effects and a "hit field" status fire again for a swapped card?

This file takes over the first item of discussion 11, which remains linked from the scripts that swap a card (BP01-061, BP01-119, SD04-014).

## Positions

Authority tier: CONSENSUS split; the rulebook is silent.

| Reading | Who holds it |
|---|---|
| A swap is not an attach | One member, who later wavered |
| A swap re-attaches the card | Two members relaying a judge from another community; two more members in a later export, who also admit the logic is unclear |
| The answer differs for the act effect and the counter effect of the card in question | One member |

A further member said a swap gives a hit-field status but a move between battle and base does not. The head judge was not asked.

## What the head judge said

Nothing on this question.

## Verdict

ESCALATE-OPEN. The rulebook says that swapped cards exchange their attached cards (301.18.c), that a swap is treated as moving (301.18.d), and that a swap between two areas other than the HAND and the deck places both cards (301.18.e). None of the three mentions attaching. Any provisional engine behaviour must stay marked in code and must not be cited as settled.

## Rulebook check

- 301.18.c: swapped cards exchange their attached cards.
- 301.18.d: swapped cards are treated as moving.
- 301.18.e: a swap between two areas other than the HAND and the deck places both cards.

## Scripts and engine

Cards involved: SP01-026, SP01-001, BP01-061, BP01-119, SD04-014 and SP01-065. Related discussions: 19 (what a swap exchanges), 04 and 11.
