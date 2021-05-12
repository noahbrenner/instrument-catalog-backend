import request from "supertest";

import { pool, sql } from "#db/index";
import { app } from "#server";
import {
  userAccessToken,
  adminAccessToken,
  invalidAccessToken,
} from "../mocks/auth_server";

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

function truncateInstrumentsTable() {
  return pool.query(sql`TRUNCATE TABLE instruments;`);
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
    await truncateInstrumentsTable();
    const res = await request(app).get("/instruments/all");
    expect(res).toMatchObject({ status: 200, type: "application/json" });
    expect(res.body).toEqual({ instruments: [] });
  });
});

describe("GET /instruments?cat=<category_id>", () => {
  it("returns instruments belonging to the specified category", async () => {
    const res = await request(app).get("/instruments?cat=1");
    expect(res).toMatchObject({ status: 200, type: "application/json" });

    expect(res.body).toEqual({ instruments: expect.any(Array) });
    expect(res.body.instruments.length).toBeGreaterThan(0);
    res.body.instruments.forEach((instrument: unknown) => {
      expectValidInstrument(instrument);
      expect(instrument).toHaveProperty("categoryId", 1);
    });
  });

  it("returns an empty array if the category has no instruments", async () => {
    await truncateInstrumentsTable();
    const res = await request(app).get("/instruments?cat=1");
    expect(res).toMatchObject({ status: 200, type: "application/json" });
    expect(res.body).toEqual({ instruments: [] });
  });

  it("returns a NOT FOUND response for a nonexistent category ID", async () => {
    const res = await request(app).get("/instruments?cat=42");
    expect(res).toMatchObject({ status: 404, type: "application/json" });
  });

  it("returns BAD REQUEST responses for invalid or missing IDs", async () => {
    const invalidIds = ["-1", "1.0", "1foo", "bar1"];
    const requests = await Promise.all([
      // Invalid
      ...invalidIds.map((id) => request(app).get(`/instruments?cat=${id}`)),
      request(app).get("/instruments?cat=1&cat=2"),
      // Missing
      request(app).get("/instruments?cat="),
      request(app).get("/instruments?cat"),
      request(app).get("/instruments"),
    ]);
    requests.forEach((res) => {
      expect(res).toMatchObject({ status: 400, type: "application/json" });
    });
  });
});

describe("GET /instruments/:id", () => {
  it("returns a valid instrument for /instruments/1", async () => {
    const res = await request(app).get("/instruments/1");
    expect(res).toMatchObject({ status: 200, type: "application/json" });
    expectValidInstrument(res.body);
  });

  it("returns a NOT FOUND response for a nonexistent ID", async () => {
    await truncateInstrumentsTable();
    const res = await request(app).get("/instruments/1");
    expect(res).toMatchObject({ status: 404, type: "application/json" });
  });

  it("returns BAD REQUEST responses for invalid IDs", async () => {
    const invalidIds = ["-1", "1.0", "1foo", "bar1"];
    const requests = await Promise.all(
      invalidIds.map((id) => request(app).get(`/instruments/${id}`))
    );
    requests.forEach((res) => {
      expect(res).toMatchObject({ status: 400, type: "application/json" });
    });
  });
});

describe("GET /instruments/test", () => {
  it("authenticates a standard user", async () => {
    const res = await request(app)
      .get("/instruments/test")
      .set("Authorization", `Bearer ${userAccessToken}`);
    expect(res).toMatchObject({ status: 200, type: "application/json" });
    expect(res.body).toEqual({ userId: "seed.user|1", isAdmin: false });
  });

  it("authenticates an admin user", async () => {
    const res = await request(app)
      .get("/instruments/test")
      .set("Authorization", `Bearer ${adminAccessToken}`);
    expect(res).toMatchObject({ status: 200, type: "application/json" });
    expect(res.body).toEqual({ userId: "seed.user|99", isAdmin: true });
  });

  it("does not authenticate for an invalid access token", async () => {
    const res = await request(app)
      .get("/instruments/test")
      .set("Authorization", `Bearer ${invalidAccessToken}`);
    expect(res).toMatchObject({ status: 400, type: "application/json" });
    expect(res.body).toEqual({ error: expect.any(String) });
  });

  it("does not authenticate without an access token", async () => {
    const res = await request(app).get("/instruments/test");
    expect(res).toMatchObject({ status: 400, type: "application/json" });
    expect(res.body).toEqual({ error: expect.any(String) });
  });
});
