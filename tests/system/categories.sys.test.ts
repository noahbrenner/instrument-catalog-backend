import request from "supertest";

import { truncateAllTables } from "#seed";
import { app } from "#server";

function expectValidCategory(obj: unknown) {
  expect(obj).toEqual({
    id: expect.any(Number),
    name: expect.any(String),
    slug: expect.any(String),
    summary: expect.any(String),
    description: expect.any(String),
  });
}

describe("GET /categories/all", () => {
  it("returns valid categories", async () => {
    const res = await request(app).get("/categories/all");
    expect(res).toMatchObject({ status: 200, type: "application/json" });

    expect(res.body).toEqual({ categories: expect.any(Array) });
    expect(res.body.categories.length).toBeGreaterThan(0);
    res.body.categories.forEach(expectValidCategory);
  });

  it("returns an empty array if there are no categories", async () => {
    await truncateAllTables();
    const res = await request(app).get("/categories/all");
    expect(res).toMatchObject({ status: 200, type: "application/json" });
    expect(res.body).toEqual({ categories: [] });
  });
});

describe("GET /categories/:slug", () => {
  it("returns a valid category for /categories/winds", async () => {
    const res = await request(app).get("/categories/winds");
    expect(res).toMatchObject({ status: 200, type: "application/json" });

    expectValidCategory(res.body);
    expect(res.body).toMatchObject({ slug: "winds", name: "Winds" });
  });

  it("accepts incorrect capitalizations of the category slug", async () => {
    const res = await request(app).get("/categories/WiNdS");
    expect(res).toMatchObject({ status: 200, type: "application/json" });

    expectValidCategory(res.body);
    expect(res.body).toMatchObject({ slug: "winds", name: "Winds" });
  });

  it("returns a NOT FOUND response for a nonexistent category", async () => {
    const res = await request(app).get("/categories/nonexistent");
    expect(res).toMatchObject({ status: 404, type: "application/json" });
  });
});
