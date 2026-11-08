/**
 * BP01-041, a Black Panther that draws and then discards when its attack hits the Weakness.
 *
 * Printed text (official card):
 *
 *   TRIG【BATTLE】:When this card attacks the weakness successfully, you draw 1 card. If you do,
 *   you discard 1 of your cards in HAND.
 *
 * The trigger tag is `attacks-weakness-successfully` from BATTLE: it fires when this card's attack
 * on an empty BATTLE area is confirmed (303.2.a.4.3.3.2.1) and not when it fights a character, wins
 * or loses. The trigger is mandatory (304.1.b). The script draws 1 card and, only if a card was
 * drawn, discards 1 of the player's HAND cards (the player may discard the card just drawn). With
 * an empty deck nothing is drawn and nothing is discarded (Reading B of "If you do").
 *
 * Rulings and tier: the scripted reading rests on the rulebook (303.2.a.4.3.3.2.1 names the
 * successful attack on a Weakness; 301.20.a defines the Weakness). Discussion 22 (HEAD-JUDGE:
 * a declared attack counts as having attacked) is declared as context; the trigger itself waits
 * for the confirmation of the attack, not the declaration. Discussion 23 is HEAD-JUDGE for the
 * defender and CONSENSUS for the weakness case (attacking the Weakness is not winning a fight);
 * a CONSENSUS-tier reading ranks below head-judge rulings and the rulebook, and here it only
 * separates this event from the "wins a fight" events. "If you do" is Reading B (a user decision,
 * closed in discussion 10 item 3, rule 301.38.a); this script does not declare discussion 10.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  discard,
  draw,
  effect,
  ifDone,
  select,
  sequence,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-041');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger
    { key: asRuleKey('301.20.a'), reviewedHash: '2254445a2da9' }, // Weakness is an empty BATTLE area
    { key: asRuleKey('303.2.a.4.3'), reviewedHash: '7c6ee101bd64' }, // battle process
    { key: asRuleKey('303.2.a.4.3.3.2.1'), reviewedHash: 'b8d957f2302e' }, // successful attack on a Weakness
    { key: asRuleKey('302.13.b'), reviewedHash: 'f4fd473858f6' }, // draw
    { key: asRuleKey('301.15.a'), reviewedHash: '2148fe594165' }, // discard
    { key: asRuleKey('301.38.a'), reviewedHash: '35e8b25aa5b6' }, // [After doing so] needs the earlier text in full
  ],
  rulings: [
    { discussion: '22', rule: asRuleKey('303.2.a.4.3') },
    { discussion: '23', rule: asRuleKey('303.2.a.4.3.3.2.1') },
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(step(draw('self', 1)), ifDone(discard(select('self', 'HAND', ANY_CARD)))),
    trigger('attacks-weakness-successfully', 'BATTLE'),
  );
}
