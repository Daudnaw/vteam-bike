import createDebug from "debug";
import { modules } from "./modules/index.js";

const debug = createDebug("backend:websockets");

/**
 * Register WebSocket handlers for all modules that export `registerWebSockets`.
 *
 * @param {{ server: import("http").Server }} ctx
 */
export function registerWebSockets(ctx) {
  for (const m of modules) {
    if (typeof m.registerWebSockets !== "function") continue;
    debug("Registering websockets for %s", m.name);
    m.registerWebSockets(ctx);
  }
}
