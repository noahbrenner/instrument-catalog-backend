import { NotFoundError } from "slonik";

import { pool, sql } from ".";

// I prefer `interface` over `type`, but Slonik has a type bug preventing that:
// https://github.com/gajus/slonik/issues/268
export type IInstrument = {
  id: number;
  categoryId: number;
  userId: string;
  name: string;
  summary: string;
  description: string;
  imageUrl: string;
};

const columnNames: [dbColumn: string, jsonKey: keyof IInstrument][] = [
  ["id", "id"],
  ["category_id", "categoryId"],
  ["user_id", "userId"],
  ["name", "name"],
  ["summary", "summary"],
  ["description", "description"],
  ["image_url", "imageUrl"],
];

const allColumns = sql.join(
  columnNames.map(
    ([dbColumn, jsonKey]) =>
      sql`${sql.identifier([dbColumn])} AS ${sql.identifier([jsonKey])}`
  ),
  sql`,`
);

export async function getAllInstruments(): Promise<IInstrument[]> {
  try {
    return (await pool.many<IInstrument>(sql`
      SELECT ${allColumns}
      FROM instruments
      ORDER BY name;
    `)) as IInstrument[]; // Slonik types the result as `readonly IInstrument[]`
  } catch (err) {
    if (err instanceof NotFoundError) {
      return [];
    }
    throw err;
  }
}

export async function getInstrumentsByCategoryId(
  categoryId: IInstrument["categoryId"]
): Promise<IInstrument[]> {
  try {
    return (await pool.many<IInstrument>(sql`
      SELECT ${allColumns}
      FROM instruments
      WHERE category_id = ${categoryId}
      ORDER BY name;
    `)) as IInstrument[]; // Slonik types the result as `readonly IInstrument[]`
  } catch (err) {
    if (err instanceof NotFoundError) {
      return [];
    }
    throw err;
  }
}

export function getInstrumentById(
  id: IInstrument["id"]
): Promise<IInstrument | null> {
  return pool.maybeOne<IInstrument>(sql`
    SELECT ${allColumns}
    FROM instruments
    WHERE id = ${id};
  `);
}

/** Creates a new instrument and also a new user if userId doesn't exist yet */
export function createInstrument(
  userId: IInstrument["userId"],
  {
    categoryId,
    name,
    summary,
    description,
    imageUrl,
  }: Omit<IInstrument, "id" | "userId">
): Promise<IInstrument> {
  return pool.transaction(async (connection) => {
    // The user ID must exist before an instrument can reference it
    await connection.query(sql`
      INSERT INTO users (id)
      VALUES (${userId})
      ON CONFLICT DO NOTHING;
    `);

    return connection.one(sql`
      INSERT INTO instruments (
        category_id,
        user_id,
        name,
        summary,
        description,
        image_url
      )
      VALUES (
        ${categoryId},
        ${userId},
        ${name},
        ${summary},
        ${description},
        ${imageUrl}
      )
      RETURNING ${allColumns};
    `);
  });
}

/** Updates an existing instrument, but doesn't change its id or userId */
export async function updateInstrumentById(
  instrumentId: IInstrument["id"],
  {
    categoryId,
    name,
    summary,
    description,
    imageUrl,
  }: Omit<IInstrument, "id" | "userId">
): Promise<IInstrument> {
  return pool.one(sql`
    UPDATE instruments
    SET
      category_id = ${categoryId},
      name = ${name},
      summary = ${summary},
      description = ${description},
      image_url = ${imageUrl}
    WHERE id = ${instrumentId}
    RETURNING ${allColumns};
  `);
}

export async function deleteInstrumentById(
  id: IInstrument["id"]
): Promise<void> {
  await pool.query(sql`
    DELETE
    FROM instruments
    WHERE id = ${id};
  `);
}
