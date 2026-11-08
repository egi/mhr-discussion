/**
 * BP01-051, a Black Widow that backs up a yellow character when she is called away.
 *
 * Printed text (official card):
 *
 *   TRIG【RETREAT】:When this card enters RETREAT from the field by calling, 1 of your yellow
 *   characters in the field gets Power+2000 in this turn.
 *
 * The trigger is `enters-retreat-by-call`: the card left the field because a CALL replaced it
 * (301.19.b retreats the cards a Lv4 or higher CALL pays with; a CALL into an occupied lane
 * replaces its character), not by a fight or an effect. The script gives Power+2000 until the end of the turn to
 * one own yellow character in the field (the BATTLE and BASE together, 302.1.a). The text has no
 * "may", so the trigger is mandatory (304.1.b). This card is already in the RETREAT when the effect
 * resolves, so it is not a candidate. With no yellow character in the field nothing happens.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { colored, effect, power, select, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-051');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger
    { key: asRuleKey('301.19.b'), reviewedHash: '4804fb75db07' }, // a CALL retreats characters from the FIELD
    { key: asRuleKey('302.1.a'), reviewedHash: 'ea63c3694178' }, // FIELD area
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    power(select('self', 'FIELD', colored('yellow')), 2000),
    trigger('enters-retreat-by-call', 'RETREAT'),
  );
}
