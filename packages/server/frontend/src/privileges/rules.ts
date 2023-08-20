import { rule } from 'graphql-shield';

import type { ApiServerContext } from '../types.js';

/**
 * All rules that can/should be mapped to resolvers in the `map.ts` file.
 * Most rules should probably call some sort of assertion method on the `user`
 * object provided in `ctx`.
 */

/**
 * Privileges
 */
export const canUse = rule({
  cache: `contextual`,
})((_, _args, _ctx: ApiServerContext) => true);
