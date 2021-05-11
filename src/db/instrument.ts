import { NotFoundError } from "slonik";

import { pool, sql } from ".";

// I prefer `interface` over `type`, but Slonik has a type bug preventing that:
// https://github.com/gajus/slonik/issues/268
type IInstrument = {
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
  categoryId: number
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

export function getInstrumentById(id: number): Promise<IInstrument | null> {
  return pool.maybeOne<IInstrument>(sql`
    SELECT ${allColumns}
    FROM instruments
    WHERE id = ${id};
  `);
}
