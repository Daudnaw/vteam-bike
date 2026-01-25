import { expect } from "chai";

import { MODES } from "../src/Scooter.js";
import { LocationSensor } from "../src/LocationSensor.js";
import { SpeedSensor } from "../src/SpeedSensor.js";
import { BatterySensor } from "../src/BatterySensor.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

describe("sensors", () => {
  it("LocationSensor updates scooter.state when location changes", () => {
    const scooterLike = { state: {} };
    const loc = new LocationSensor({ lat: 10, lon: 20 });

    loc.start({ scooter: scooterLike });

    expect(scooterLike.state).to.deep.include({ lat: 10, lon: 20 });

    loc.set(30, 40);
    expect(scooterLike.state).to.deep.include({ lat: 30, lon: 40 });

    loc.stop();
  });

  it("SpeedSensor clamps values and keeps scooter.state.speedKmh in sync", () => {
    const scooterLike = { state: {}, mode: MODES.IDLE };
    const speed = new SpeedSensor({ speedKmh: -5 });

    speed.start({ scooter: scooterLike });
    expect(scooterLike.state.speedKmh).to.equal(0);

    speed.set(15);
    expect(scooterLike.state.speedKmh).to.equal(15);

    speed.set(-10);
    expect(scooterLike.state.speedKmh).to.equal(0);

    speed.stop();
  });

  it("BatterySensor drains autonomously and drains faster at higher speed", async () => {
    const slowScooter = { state: { speedKmh: 5 }, mode: MODES.ACTIVE };
    const fastScooter = { state: { speedKmh: 25 }, mode: MODES.ACTIVE };

    const slow = new BatterySensor({
      battery: 100,
      tickMs: 10,
      drainPerTickIdle: 0,
      drainPerTickActive: 0.01,
      drainPerTickPerKmh: 0.001,
      maxSpeedKmhForDrain: 50,
    });

    const fast = new BatterySensor({
      battery: 100,
      tickMs: 10,
      drainPerTickIdle: 0,
      drainPerTickActive: 0.01,
      drainPerTickPerKmh: 0.001,
      maxSpeedKmhForDrain: 50,
    });

    slow.start({ scooter: slowScooter });
    fast.start({ scooter: fastScooter });

    await sleep(60);

    const slowBattery = slow.getState().battery;
    const fastBattery = fast.getState().battery;

    expect(fastBattery).to.be.lessThan(slowBattery);

    // also verify sync to scooter state
    expect(slowScooter.state.battery).to.equal(slowBattery);
    expect(fastScooter.state.battery).to.equal(fastBattery);

    slow.stop();
    fast.stop();
  });
});
