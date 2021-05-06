import request from "supertest";

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
});
