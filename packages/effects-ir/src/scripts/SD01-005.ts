/**
 * SD01-005, a Lv3 red Asgard character that turns a pair of red BASE cards into a draw when it is
 * called.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】: When this card enters the field by calling, you may retreat 2 of your cards in
 *   BASE. If you do and the cards retreated by this effect are red, you draw 2 cards.
 *
 * Event tag: enters-field-by-call, FIELD. The script is optional (the player takes it by running
 * the activation): 2 of the player's own BASE cards are retreated, and only if that was done the
 * player draws 2 cards. Resolving to the greatest extent possible is 304.1.d (discussion 24,
 * HEAD-JUDGE principle); the engine reading of "If you do" is Reading B (discussion 10 item 3,
 * CLOSED 2026-11-04 as USER-DECISION).
 *
 * USER DECISION (UAT test 2 of phase 17.4, 2026-11-09), not a head-judge ruling and not rulebook
 * text: "the cards retreated by this effect are red" is read as ALL retreated cards red; the
 * retreat is a free choice of any 2 BASE cards; draw 2 only if every retreated card is red,
 * otherwise the effect stops after the retreat.
 *
 * PROVISIONAL (user decision D-07, D-09). The survey label "11 O3" resolves, through the
 * community-rulings imports.md, to chat-source discussions 32 and 28. Both are cited by path and
 * tier only; neither is on the pinned vendor board, so no rulings link is encoded:
 *
 * - community-rulings/discussions/32-attachments-follow-the-host.md: HEAD-JUDGE (FAQ F-37). It
 *   does not govern this clause.
 * - community-rulings/discussions/28-face-down-cards-effects-and-costs.md: a face-down retreated
 *   card is NOT red and draws nothing. That is a card-local USER DECISION of 2026-11-09 (HUMAN-UAT
 *   test 2), not a head-judge ruling; discussion 28 stays ESCALATE-OPEN for the broader question
 *   of a set card's colour. That discussion never names this card; the link from SD01-005 to it is
 *   an unconfirmed inference.
 *
 * Printed Lv, Power and colour are used (effective-power-lv-basis is UNRULED).
 */

import { asCardNo, asRuleKey } from "@mhr/core";
import {
  ANY_CARD,
  colored,
  conditional,
  draw,
  effect,
  ifDone,
  optional,
  retreat,
  select,
  sequence,
  step,
  trigger,
} from "../combinators";
import { declareRules } from "../declaration";
import type { EffectIR } from "../ir";

export const CARD_NO = asCardNo("SD01-005");

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey("304.1.a"), reviewedHash: "d1cde41a6928" }, // optional trigger
    { key: asRuleKey("301.16.a"), reviewedHash: "72a1ab425b37" }, // retreat
    { key: asRuleKey("302.13.b"), reviewedHash: "f4fd473858f6" }, // draw
    { key: asRuleKey("304.1.d"), reviewedHash: "7986869359ce" }, // resolve to greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      sequence(
        step(retreat(select("self", "BASE", ANY_CARD, 2))),
        ifDone(
          conditional(
            {
              kind: "retreated-cards-match",
              filter: { ...colored("red"), characterOnly: false },
            },
            draw("self", 2),
          ),
        ),
      ),
    ),
    trigger("enters-field-by-call", "FIELD"),
  );
}
