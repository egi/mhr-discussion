/**
 * BP01-038, a Wasp in BATTLE that trades places with a yellow FRONT character when the opponent's
 * turn starts.
 *
 * Printed text (official card):
 *
 *   TRIG【BATTLE】:When your opponent's turn starts, if you have the yellow character without
 *   【Wasp】 in its name in FRONT, you may swap this card in BATTLE and that character. If you do,
 *   this card gets Power+2500 in this turn.
 *
 * The trigger tag is `opponent-turn-starts` from BATTLE: it fires for the seat whose opponent's
 * turn begins and not at the carrier's own turn start. The script tests for an own yellow
 * character in FRONT whose name does not contain Wasp; when none stands there, nothing happens.
 * When one does, the player may swap this card with it (301.18.a), and only if the swap was done
 * does this card get Power+2500 until the end of the turn (Reading B of "If you do"). The "may" is
 * the root of the effect, so the trigger is offered as optional (the engine reads only a root
 * "optional" as a "may"); with the condition false, accepting it changes nothing.
 *
 * Rulings: discussion 19 is HEAD-JUDGE for the swap (a swap exchanges the cards only; results given
 * to the position stay with it). Other moves inside the FIELD are ESCALATE-OPEN in that file and
 * are not implemented here. "If you do" is Reading B (a user decision, closed in discussion 10
 * item 3, rule 301.38.a); this script does not declare discussion 10.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  colored,
  effect,
  ifDone,
  conditional,
  optional,
  power,
  select,
  sequence,
  source,
  step,
  swap,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-038');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('303.2.a.1.1'), reviewedHash: '48a62084a386' }, // start-of-turn triggers
    { key: asRuleKey('301.18.a'), reviewedHash: 'ee5d5ce25680' }, // swap exchanges positions
    { key: asRuleKey('301.18.b'), reviewedHash: 'b0d4f9b79d48' }, // swapped cards exchange current states
    { key: asRuleKey('301.18.d'), reviewedHash: '75dd0629d8dd' }, // swap counts as moving
    { key: asRuleKey('301.38.a'), reviewedHash: '35e8b25aa5b6' }, // [After doing so] needs the earlier text in full
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
  ],
  rulings: [{ discussion: '19', rule: asRuleKey('301.18.b') }],
});

/** The effect's IR. */
export function script(): EffectIR {
  const other = colored('yellow', { nameExcludes: 'Wasp' });
  return effect(
    CARD_NO,
    optional(
      conditional(
        { kind: 'have', side: 'self', area: 'FRONT', filter: other, min: 1, max: null },
        sequence(step(swap(source(), select('self', 'FRONT', other))), ifDone(power(source(), 2500))),
      ),
    ),
    trigger('opponent-turn-starts', 'BATTLE'),
  );
}
