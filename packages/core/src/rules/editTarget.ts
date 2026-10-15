import type { PlayerId, Zone } from '../state/gameState';
import type { BattleSlotName } from '../state/slots';

/**
 * An address on the board: which seat, which area, and whatever else that area needs.
 *
 * Every field beyond `player` and `zone` is optional because whether it is needed depends
 * on the zone — `slot` for `WING`, `hostIid` for `ATTACHED`, `iid` whenever one card in a
 * list is meant. A builder refuses a target that does not carry what its zone requires
 * rather than guessing, which is why `placeCard` into a `WING` without a lane is a refusal
 * and not a coin toss.
 */
export type EditTarget = {
  readonly player: PlayerId;
  readonly zone: Zone;
  /** A card in the addressed area. */
  readonly iid?: number;
  /** Which lane, for `WING`. */
  readonly slot?: BattleSlotName;
  /** The character an `ATTACHED` stack hangs under. */
  readonly hostIid?: number;
};
