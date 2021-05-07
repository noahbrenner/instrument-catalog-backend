import request from "supertest";

import { truncateAllTables } from "#seed";
import { app } from "#server";

function expectValidInstrument(obj: unknown) {
  expect(obj).toEqual({
    id: expect.any(Number),
    categoryId: expect.any(Number),
    userId: expect.any(String),
    name: expect.any(String),
    summary: expect.any(String),
    description: expect.any(String),
    imageUrl: expect.any(String),
  });
}

describe("GET /instruments/all", () => {
  it("returns valid instruments", async () => {
    const res = await request(app).get("/instruments/all");
    expect(res).toMatchObject({ status: 200, type: "application/json" });

    expect(res.body).toEqual({ instruments: expect.any(Array) });
    expect(res.body.instruments.length).toBeGreaterThan(0);
    res.body.instruments.forEach(expectValidInstrument);
  });

  it("returns an empty array if there are no instruments", async () => {
    await truncateAllTables();
    const res = await request(app).get("/instruments/all");
    expect(res).toMatchObject({ status: 200, type: "application/json" });
    expect(res.body).toEqual({ instruments: [] });
  });
});

describe("GET /instruments/:id", () => {
  it("returns a valid instrument for /instruments/1", async () => {
    const res = await request(app).get("/instruments/1");
    expect(res).toMatchObject({ status: 200, type: "application/json" });
    expectValidInstrument(res.body);
  });

  it("returns a NOT FOUND response for a nonexistent id", async () => {
    await truncateAllTables();
    const res = await request(app).get("/instruments/1");
    expect(res).toMatchObject({ status: 404, type: "application/json" });
  });

  it("returns a BAD REQUEST responses for invalid ids", async () => {
    const badIds = ["-1", "1.0", "1foo", "bar1"];
    const requests = await Promise.all(
      badIds.map((badId) => request(app).get(`/instruments/${badId}`))
    );
    requests.forEach((res) => {
      expect(res).toMatchObject({ status: 400, type: "application/json" });
    });
  });
});
