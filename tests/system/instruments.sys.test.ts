import request from "supertest";

import { pool, sql } from "#db/index";
import { app } from "#server";
import { user, admin, invalidUser } from "../mocks/auth_server";

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

describe("POST|PUT|DELETE /instruments/*", () => {
  const mockInstrument = {
    categoryId: 1,
    name: "Foo",
    summary: "Bar",
    description: "Baz",
    imageUrl: "buzz",
  };

  it("returns BAD REQUEST for an invalid access token", async () => {
    const header = [
      "Authorization",
      `Bearer ${invalidUser.accessToken}`,
    ] as const;

    const requests = await Promise.all([
      request(app)
        .put("/instruments/1")
        .send(mockInstrument)
        .set(...header),
      request(app)
        .delete("/instruments/1")
        .set(...header),
    ]);

    requests.forEach((res) => {
      expect(res).toMatchObject({ status: 400, type: "application/json" });
    });
  });

  it("returns BAD REQUEST for a missing access token", async () => {
    const requests = await Promise.all([
      request(app).put("/instruments/1").send(mockInstrument),
      request(app).delete("/instruments/1"),
    ]);

    requests.forEach((res) => {
      expect(res).toMatchObject({ status: 400, type: "application/json" });
    });
  });
});

describe("GET|PUT|DELETE /instruments/:id", () => {
  it("returns BAD REQUEST responses for invalid IDs", async () => {
    const invalidIds = ["-1", "1.0", "1foo", "bar1"];
    const header = ["Authorization", `Bearer ${user.accessToken}`] as const;

    const requests = await Promise.all([
      // GET
      ...invalidIds.map((id) => request(app).get(`/instruments/${id}`)),

      // PUT
      ...invalidIds.map((id) =>
        request(app)
          .put(`/instruments/${id}`)
          .set(...header)
      ),

      // DELETE
      ...invalidIds.map((id) =>
        request(app)
          .delete(`/instruments/${id}`)
          .set(...header)
      ),
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
});

describe("PUT /instruments/:id", () => {
  const adminHeader = ["Authorization", `Bearer ${admin.accessToken}`] as const;
  const userHeader = ["Authorization", `Bearer ${user.accessToken}`] as const;
  const mockInstrument = {
    categoryId: 1,
    name: "Foo",
    summary: "Bar",
    description: "Baz",
    imageUrl: "buzz",
  };

  it("updates the instrument for an admin user", async () => {
    const instrumentId = 1; // Admin doesn't own instrument 1
    const endpoint = `/instruments/${instrumentId}`;
    const expectedResult = {
      ...mockInstrument,
      id: instrumentId,
      userId: user.id, // The original user, *NOT* the admin user
    };

    {
      // Update call succeeds and returns the updated instrument
      const res = await request(app)
        .put(endpoint)
        .send(mockInstrument)
        .set(...adminHeader);
      expect(res).toMatchObject({ status: 200, type: "application/json" });
      expect(res.body).toEqual(expectedResult);
    }
    {
      // Update persists
      const res = await request(app).get(endpoint);
      expect(res).toMatchObject({ status: 200, type: "application/json" });
      expect(res.body).toEqual(expectedResult);
    }
  });

  it("updates the instrument for a user whose userId matches", async () => {
    const instrumentId = 1; // User owns instrument 1
    const endpoint = `/instruments/${instrumentId}`;
    const expectedResult = {
      ...mockInstrument,
      id: instrumentId,
      userId: user.id, // The original user, *NOT* the admin user
    };

    {
      // Update call succeeds and returns the updated instrument
      const res = await request(app)
        .put(endpoint)
        .send(mockInstrument)
        .set(...userHeader);
      expect(res).toMatchObject({ status: 200, type: "application/json" });
      expect(res.body).toEqual(expectedResult);
    }
    {
      // Update persists
      const res = await request(app).get(endpoint);
      expect(res).toMatchObject({ status: 200, type: "application/json" });
      expect(res.body).toEqual(expectedResult);
    }
  });

  it("returns FORBIDDEN for a user whose userId doesn't match", async () => {
    const endpoint = "/instruments/2"; // User doesn't own instrument 2

    {
      // Update call succeeds and returns the updated instrument
      const res = await request(app)
        .put(endpoint)
        .send(mockInstrument)
        .set(...userHeader);
      expect(res).toHaveProperty("status", 403);
    }
    {
      // Instrument was not updated
      const res = await request(app).get(endpoint);
      expect(res).toMatchObject({ status: 200, type: "application/json" });
      expect(res.body.name).not.toBe("Foo");
    }
  });

  it("returns NOT FOUND for a nonexistent instrument", async () => {
    const endpoint = "/instruments/99"; // Not in our seed data

    const res = await request(app)
      .put(endpoint)
      .send(mockInstrument)
      .set(...userHeader);
    expect(res).toHaveProperty("status", 404);
  });

  it("returns BAD REQUEST for an invalid request body", async () => {
    const endpoint = "/instruments/1"; // User owns instrument 1
    const invalidInstruments = [
      { ...mockInstrument, name: 2 }, // Wrong type
      { ...mockInstrument, categoryId: 99 }, // Nonexistent category
      (() => {
        const { categoryId, name, summary, imageUrl } = mockInstrument;
        return { categoryId, name, summary, imageUrl }; // Missing description
      })(),
    ];

    await Promise.all(
      invalidInstruments.map(async (invalidInstrument) => {
        const res = await request(app)
          .put(endpoint)
          .send(invalidInstrument)
          .set(...userHeader);
        expect(res).toHaveProperty("status", 400);
      })
    );
  });
});

describe("DELETE /instruments/:id", () => {
  it("deletes the instrument for an admin user", async () => {
    const header = ["Authorization", `Bearer ${admin.accessToken}`] as const;
    const endpoint = "/instruments/1"; // Admin doesn't own instrument 1
    {
      // Delete call succeeds
      const res = await request(app)
        .delete(endpoint)
        .set(...header);
      expect(res).toHaveProperty("status", 204);
    }
    {
      // Instrument is deleted
      const res = await request(app).get(endpoint);
      expect(res).toHaveProperty("status", 404);
    }
    {
      // Delete call is idempotent
      const res = await request(app)
        .delete(endpoint)
        .set(...header);
      expect(res).toHaveProperty("status", 204);
    }
  });

  it("deletes an instrument for the user whose userId matches", async () => {
    const header = ["Authorization", `Bearer ${user.accessToken}`] as const;
    const endpoint = "/instruments/1"; // User owns instrument 1
    {
      // Delete call succeeds
      const res = await request(app)
        .delete(endpoint)
        .set(...header);
      expect(res).toHaveProperty("status", 204);
    }
    {
      // Instrument is deleted
      const res = await request(app).get(endpoint);
      expect(res).toHaveProperty("status", 404);
    }
    {
      // Delete call is idempotent
      const res = await request(app)
        .delete(endpoint)
        .set(...header);
      expect(res).toHaveProperty("status", 204);
    }
  });

  it("returns FORBIDDEN for a user whose userId doesn't match", async () => {
    const endpoint = "/instruments/2"; // User doesn't own instrument 2
    {
      // Delete call fails
      const res = await request(app)
        .delete(endpoint) // User doesn't own instrument 2
        .set("Authorization", `Bearer ${user.accessToken}`);
      expect(res).toHaveProperty("status", 403);
    }
    {
      // Instrument is not deleted
      const res = await request(app).get(endpoint);
      expect(res).toHaveProperty("status", 200);
    }
  });
});
