import { Router } from "express";
import createDebug from "debug";
import { modules } from "./modules/index.js";

const debug = createDebug("backend:routes");

const router = Router();
const versionedSubRouters = new Map();

/**
 * Get or create the sub-router for a given API version.
 *
 * - If a router for the version already exists, it is returned.
 * - If not, a new Router is created, mounted at `/<version>` on the
 *   top-level API router, stored in an internal map, and then returned.
 *
 * This allows multiple modules to share the same version prefix,
 * e.g. `/v1/users`, `/v1/cards`, all using the same version router.
 *
 * @param {string} version - API version identifier (e.g. `"v1"`, `"v2"`).
 * @returns {import('express').Router} The Express router that handles this API version.
 */
function getSubRouter(version) {
  if (!versionedSubRouters.has(version)) {
    debug("Creating versioned sub router %s", version);
    const vN = new Router();
    router.use(`/${version}`, vN);
    versionedSubRouters.set(version, vN);
  }

  debug("Getting versioned sub router %s", version);
  return versionedSubRouters.get(version);
}

for (const m of modules) {
  const { name, versions, baseRouter } = m;
  debug("Mounting %s", name);

  // If we have a non-versioned router let's hook that up first
  if (baseRouter) {
    debug("Mounting base router for %s", name);
    router.use(`/${name}`, baseRouter);
  }

  // For routes that don't contain any versioned routers, we don't
  // need to hook into the versioned subrouters
  if (!versions) continue;

  for (const [version, subRouter] of Object.entries(versions)) {
    debug("Mounting version %s for %s", version, name);
    const versionedRouter = getSubRouter(version);
    versionedRouter.use(`/${name}`, subRouter);
  }
}

export default router;
