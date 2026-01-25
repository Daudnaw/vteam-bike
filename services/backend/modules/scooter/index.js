import "./model.js";
import * as routes from "./routes.js";
import { registerWebSockets, sendCommand } from "./ws.js";

export const name = "scooter";
export const versions = {
  v1: routes.v1,
};

export { registerWebSockets, sendCommand };
