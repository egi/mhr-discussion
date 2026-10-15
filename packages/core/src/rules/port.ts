import type { RuleKey, RuleRef, RuleRevision } from './ruleKey';

/**
 * The rule lookup the engine hands to code that must cite a rule.
 *
 * The engine's derive step receives the registry through this port, so effects code can
 * produce a {@link RuleRef} without importing the rules registry (and the rule text it
 * loads). The signature is the registry's own `cite`: an unknown key throws rather than
 * returning a placeholder.
 */
export interface RulesPort {
  cite(key: RuleKey, revision: RuleRevision): RuleRef;
}
