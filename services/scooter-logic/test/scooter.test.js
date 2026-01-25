import { expect } from "chai";

import { FakeWebSocket } from "./helpers/fake-websocket.js";

import { Scooter, MODES, STATUSES } from "../src/Scooter.js";
import { SpeedSensor } from "../src/SpeedSensor.js";
import { BatterySensor } from "../src/BatterySensor.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const parseLastSent = (ws) => {
  const last = ws.sent.at(-1);
  return last ? JSON.parse(last) : null;
};

describe("scooter-logic", () => {
  let OriginalWebSocket;

  beforeEach(() => {
    FakeWebSocket.reset();
    OriginalWebSocket = globalThis.WebSocket;
    globalThis.WebSocket = FakeWebSocket;
  });

  afterEach(() => {
    globalThis.WebSocket = OriginalWebSocket;
  });

  it("sends HELLO on open", async () => {
    const s = new Scooter({
      id: "abc123",
      url: "ws://localhost/ws/scooters",
      sensors: [],
      reconnectDelayMs: 10,
    });

    const ws = FakeWebSocket.instances[0];
    expect(ws).to.exist;

    ws._open();

    expect(ws.sent).to.have.length(1);
    const hello = JSON.parse(ws.sent[0]);

    expect(hello).to.deep.include({
      type: "HELLO",
      scooterId: "abc123",
      role: "device",
    });

    await s.close();
  });

  it("applies telemetry from INIT and primes sensors once (awaits async sensor.start)", async () => {
    let started = false;

    const asyncSensor = {
      async start() {
        await sleep(20);
        started = true;
      },
      getState() {
        return { foo: started ? 1 : 0 };
      },
    };

    const s = new Scooter({
      id: "abc123",
      url: "ws://localhost/ws/scooters",
      sensors: [asyncSensor],
      reconnectDelayMs: 10,
    });

    const ws = FakeWebSocket.instances[0];
    ws._open();

    ws._message({
      type: "INIT",
      telemetry: { activeIntervalMs: 111, idleIntervalMs: 222 },
      state: { status: STATUSES.IDLE },
    });

    // allow INIT handler to await sensor.start + prime once
    await sleep(40);

    expect(s.state.foo).to.equal(1);

    await s.close();
  });

  it("CMD START sets active mode/status and sends immediate STATE", async () => {
    const fixedSensor = {
      getState: () => ({ lat: 1, lon: 2, speedKmh: 3, battery: 99 }),
    };

    const s = new Scooter({
      id: "abc123",
      url: "ws://localhost/ws/scooters",
      sensors: [fixedSensor],
      reconnectDelayMs: 10,
    });

    const ws = FakeWebSocket.instances[0];
    ws._open();

    ws._message({
      type: "INIT",
      telemetry: { activeIntervalMs: 1000, idleIntervalMs: 5000 },
      state: { status: STATUSES.IDLE },
    });

    await sleep(5);

    ws._message({ type: "CMD", action: "START" });
    await sleep(10);

    expect(s.mode).to.equal(MODES.ACTIVE);
    expect(s.state.mode).to.equal(MODES.ACTIVE);
    expect(s.state.status).to.equal(STATUSES.DRIVING);

    const last = parseLastSent(ws);
    expect(last).to.include({
      type: "STATE",
      mode: MODES.ACTIVE,
      status: STATUSES.DRIVING,
    });
    expect(last.lat).to.equal(1);

    await s.close();
  });

  it("CMD STOP sets idle mode/status and sends immediate STATE", async () => {
    const fixedSensor = { getState: () => ({ speedKmh: 10 }) };

    const s = new Scooter({
      id: "abc123",
      url: "ws://localhost/ws/scooters",
      sensors: [fixedSensor],
      reconnectDelayMs: 10,
    });

    const ws = FakeWebSocket.instances[0];
    ws._open();

    ws._message({
      type: "INIT",
      telemetry: { activeIntervalMs: 50, idleIntervalMs: 50 },
    });
    await sleep(5);

    ws._message({ type: "CMD", action: "START" });
    await sleep(5);

    ws._message({ type: "CMD", action: "STOP" });
    await sleep(10);

    expect(s.mode).to.equal(MODES.IDLE);
    expect(s.state.status).to.equal(STATUSES.IDLE);
    expect(s.state.speedKmh).to.equal(0);

    const last = parseLastSent(ws);
    expect(last).to.include({ type: "STATE", status: STATUSES.IDLE });
    expect(last.speedKmh).to.equal(0);

    await s.close();
  });

  it("close() prevents reconnect after onclose", async () => {
    const s = new Scooter({
      id: "abc123",
      url: "ws://localhost/ws/scooters",
      sensors: [],
      reconnectDelayMs: 10,
    });

    const ws1 = FakeWebSocket.instances[0];
    ws1._open();

    await s.close();

    ws1._triggerClose();
    await sleep(30);

    expect(FakeWebSocket.instances).to.have.length(1);
  });

  it("SpeedSensor updates scooter.state.speedKmh on set()", () => {
    const speed = new SpeedSensor({ speedKmh: 0 });
    const scooterLike = { state: {}, mode: MODES.IDLE };

    speed.start({ scooter: scooterLike });
    speed.set(12);
    expect(scooterLike.state.speedKmh).to.equal(12);

    speed.set(-5);
    expect(scooterLike.state.speedKmh).to.equal(0);

    speed.stop();
  });

  it("BatterySensor drains autonomously and drains faster at higher speed", async () => {
    const scooterSlow = { state: { speedKmh: 5 }, mode: MODES.ACTIVE };
    const scooterFast = { state: { speedKmh: 25 }, mode: MODES.ACTIVE };

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

    slow.start({ scooter: scooterSlow });
    fast.start({ scooter: scooterFast });

    await sleep(60);

    const bSlow = slow.getState().battery;
    const bFast = fast.getState().battery;

    expect(bSlow).to.be.lessThan(100);
    expect(bFast).to.be.lessThan(100);
    expect(bFast).to.be.lessThan(bSlow);

    expect(scooterSlow.state.battery).to.equal(bSlow);
    expect(scooterFast.state.battery).to.equal(bFast);

    slow.stop();
    fast.stop();
  });
});
