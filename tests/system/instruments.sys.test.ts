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
