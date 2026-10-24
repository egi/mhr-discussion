# 11 - Open points from the second export: swap versus attach, a pending errata, a garbled card text

**Status: ESCALATE-OPEN (three items; nothing here is a head judge ruling on the exact point)**

> Source note: L<n> citations refer to a private chat export and cannot be re-checked by readers. This text is a paraphrase, and people appear by role only.

## The question

Three points from the mid-October export are still open, and each has a script or an engine model that rests on an inference. They are listed together because they were found in the same export. The settled rulings of that export (the head judge's rulings on redeclaring an attack, on a Unique called over a Unique, and on attachments that follow a retreated host) are not repeated here; they are not open.

1. Does a swap count as an attach, so that a "when this card is attached" effect fires again for a swapped card?
2. The head judge announced an errata for the card Follow Shadow (BP01-061). The mirrored card text is still the pre-errata text. Which cost does the card have?
3. The mirrored text of BP01-097 ends in a stray fragment after its one sentence. What is the printed text?

## Positions

| # | Item | Status | Tier |
|---|---|---|---|
| 1 | A swap is or is not an attach | open | none (members split; the head judge was not asked) |
| 2 | Follow Shadow cost after the errata | open until the errata text is published | head judge, relayed in chat, not yet in the card data |
| 3 | Trailing fragment in the BP01-097 text | open | none |

On item 1, one member said a swap does not count as an attach, and two members relayed a judge from another community who said it counts as a re-attach. A further member split the card in question into its act and its counter effect. The member who said no later wavered.

## What the head judge said

Item 1: nothing. Item 2: the head judge confirmed that the errata lets the cost take any card (a set card, a character or an attachment) instead of set cards only, and that a host with an attachment can be retreated together with it when both are declared; declaring only the host counts as one card. The head judge said the errata would follow within one or two weeks. Item 3: nothing.

## Verdict

Authority tier: none for item 1 and item 3; head judge for the direction of item 2, but the published card text is the authority and it has not arrived.

1. Swap versus attach (open). The rulebook says swapped cards exchange their attached cards (301.18.c) and that a swap between two areas other than the HAND and the deck places both cards (301.18.e). Neither sentence mentions attaching. Scripts that swap two cards do not treat the swap as an attach, and nothing here may be cited as settled either way.
2. Follow Shadow (open). The script follows the mirrored, pre-errata text exactly and does not encode the errata taken from chat. When the published text reaches the card data the script is replaced, not patched.
3. BP01-097 (open). The AUTO script models the sentence before the fragment. The fragment is read as a mirror artifact. If the printed card says more, the script is wrong by that much.

## Rulebook check

- 301.18.c: swapped cards exchange their attached cards.
- 301.18.e: a swap between two areas other than the HAND and the deck places both cards.
- 301.19.b: a CALL retreats the cost first and then places the card.
- 301.21.c: a face-down card has no effects.

## Scripts and engine

Scripts that swap a card from RETREAT into the field and so depend on item 1: BP01-119 and SD04-014. The Follow Shadow script is BP01-061. The AUTO model of BP01-097 lives in the engine's AUTO registry.
