import { expect } from "chai";
import sinon from "sinon";
import esmock from "esmock";

function makeLeanQuery(result) {
  return { lean: async () => result };
}

describe("handelPrice", function () {
  let handelPrice;

  let UserMock;
  let ZoneMock;

  beforeEach(async () => {
    UserMock = { findById: sinon.stub() };
    ZoneMock = { find: sinon.stub() };

    handelPrice = (await esmock("./handelPayment.js", {
      "../users/model.js": { default: UserMock },
      "../zones/model.js": { default: ZoneMock },
    })).default;
  });

  it("throws if rental missing startTime/endTime", async () => {
    try {
      await handelPrice({ startTime: null, endTime: null });
      throw new Error("Expected to throw");
    } catch (err) {
      expect(err.message).to.equal("Rental must have startTime and endTime");
    }
  });

  it("throws if user not found", async () => {
    UserMock.findById.resolves(null);

    const rental = {
      user: "u1",
      startTime: new Date("2026-01-01T10:00:00Z"),
      endTime: new Date("2026-01-01T10:10:00Z"),
      tripHistory: [{ lat: 0, lng: 0 }],
    };

    try {
      await handelPrice(rental);
      throw new Error("Expected to throw");
    } catch (err) {
      expect(err.message).to.equal("User not found");
    }
  });

  it("calculates minutes with ceil and adds startFee when no tripHistory", async () => {
    UserMock.findById.resolves({ _id: "u1", membership: { status: "inactive" } });
    ZoneMock.find.returns(makeLeanQuery([]));

    const rental = {
      user: "u1",
      startTime: new Date("2026-01-01T10:00:00Z"),
      endTime: new Date("2026-01-01T10:00:01Z"),
      tripHistory: [],
    };

    const res = await handelPrice(rental);

    expect(res.minutes).to.equal(1);

    expect(res.cost).to.equal(12);
    expect(res.tier).to.equal(null);
    expect(res.parking).to.deep.equal({ ok: false, reason: "no_trip_history" });
  });

  it("tier medium halves cost (rounded) and adds startFee when outside zone", async () => {
    UserMock.findById.resolves({ _id: "u1", membership: { status: "active", tier: "medium" } });
    ZoneMock.find.returns(makeLeanQuery([]));

    const rental = {
      user: "u1",
      startTime: new Date("2026-01-01T10:00:00Z"),
      endTime: new Date("2026-01-01T10:11:00Z"),
      tripHistory: [{ lat: 59.0, lng: 18.0 }],
    };

    const res = await handelPrice(rental);

    expect(res.minutes).to.equal(11);

    expect(res.cost).to.equal(21);

    expect(res.tier).to.equal("medium");
    expect(res.parking.ok).to.equal(false);
    expect(res.parking.reason).to.equal("outside_parking_zone");
  });

  it("tier small applies 0.9 discount (rounded) and adds startFee when outside zone", async () => {
    UserMock.findById.resolves({ _id: "u1", membership: { status: "active", tier: "small" } });
    ZoneMock.find.returns(makeLeanQuery([]));

    const rental = {
      user: "u1",
      startTime: new Date("2026-01-01T10:00:00Z"),
      endTime: new Date("2026-01-01T10:10:00Z"),
      tripHistory: [{ lat: 59.0, lng: 18.0 }],
    };

    const res = await handelPrice(rental);

    expect(res.cost).to.equal(28);
    expect(res.tier).to.equal("small");
  });

  it("tier allin forces cost 0 even if outside zone", async () => {
    UserMock.findById.resolves({ _id: "u1", membership: { status: "active", tier: "allin" } });
    ZoneMock.find.returns(makeLeanQuery([]));

    const rental = {
      user: "u1",
      startTime: new Date("2026-01-01T10:00:00Z"),
      endTime: new Date("2026-01-01T10:30:00Z"),
      tripHistory: [{ lat: 59.0, lng: 18.0 }],
    };

    const res = await handelPrice(rental);

    expect(res.minutes).to.equal(30);
    expect(res.tier).to.equal("allin");
    expect(res.cost).to.equal(0);
  });

  it("parking ok in polygon => no startFee", async () => {
    UserMock.findById.resolves({ _id: "u1", membership: { status: "inactive" } });

    const zone = {
      _id: "z1",
      name: "P1",
      type: "polygon",
      area: [
        [ -1, -1 ],
        [  1, -1 ],
        [  1,  1 ],
        [ -1,  1 ],
      ],
      zoneType: "parking",
      active: true,
    };
    ZoneMock.find.returns(makeLeanQuery([zone]));

    const rental = {
      user: "u1",
      startTime: new Date("2026-01-01T10:00:00Z"),
      endTime: new Date("2026-01-01T10:10:00Z"),
      tripHistory: [{ lat: 0, lng: 0 }],
    };

    const res = await handelPrice(rental);

    expect(res.parking.ok).to.equal(true);
    expect(res.parking.zoneId).to.equal("z1");
    expect(res.parking.zoneName).to.equal("P1");

    expect(res.cost).to.equal(20);
  });

  it("parking ok in circle => no startFee", async () => {
    UserMock.findById.resolves({ _id: "u1", membership: { status: "inactive" } });

    const zone = {
      _id: "z2",
      name: "C1",
      type: "circle",
      center: [0, 0],
      radius: 200,
      zoneType: "parking",
      active: true,
    };

    ZoneMock.find.returns(makeLeanQuery([zone]));

    const rental = {
      user: "u1",
      startTime: new Date("2026-01-01T10:00:00Z"),
      endTime: new Date("2026-01-01T10:10:00Z"),
      tripHistory: [{ lat: 0, lng: 0.0005 }],
    };

    const res = await handelPrice(rental);

    expect(res.parking.ok).to.equal(true);
    expect(res.parking.zoneId).to.equal("z2");
    expect(res.parking.zoneName).to.equal("C1");

    expect(res.cost).to.equal(20);
  });

  it("ignores malformed zones and returns outside when none match", async () => {
    UserMock.findById.resolves({ _id: "u1", membership: { status: "inactive" } });

    ZoneMock.find.returns(makeLeanQuery([
      { _id: "bad1", type: "polygon", area: null, active: true, zoneType: "parking" },
      { _id: "bad2", type: "circle", center: [0,0], radius: null, active: true, zoneType: "parking" },
    ]));

    const rental = {
      user: "u1",
      startTime: new Date("2026-01-01T10:00:00Z"),
      endTime: new Date("2026-01-01T10:10:00Z"),
      tripHistory: [{ lat: 0, lng: 0 }],
    };

    const res = await handelPrice(rental);

    expect(res.parking.ok).to.equal(false);
    expect(res.parking.reason).to.equal("outside_parking_zone");
    expect(res.cost).to.equal(30);
  });
});