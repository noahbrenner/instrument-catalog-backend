import request from "supertest";

import { app } from "@server";

describe("GET /api/users/all", () => {
  it("returns an array of users", async () => {
    const res = await request(app).get("/api/users/all");
    expect(res.status).toEqual(200);
    expect(res.type).toEqual("application/json");
    expect(res.body.users.length).toBeGreaterThan(0);
  });
});
