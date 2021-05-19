import { NotFoundError } from "slonik";

import { pool, sql } from ".";

// I prefer `interface` over `type`, but Slonik has a type bug preventing that:
// https://github.com/gajus/slonik/issues/268
type ICategory = {
  id: number;
  name: string;
  slug: string;
  summary: string;
  description: string;
};

const columnNames: Array<keyof ICategory> = [
  "id",
  "name",
  "slug",
  "summary",
  "description",
];

const allColumns = sql.join(
  columnNames.map((col) => sql.identifier([col])),
  sql`,`
);

export async function getAllCategories(): Promise<ICategory[]> {
  try {
    return (await pool.many<ICategory>(sql`
      SELECT ${allColumns}
      FROM categories
      ORDER BY name;
    `)) as ICategory[]; // Slonik types the result as `readonly ICategory[]`
  } catch (err) {
    if (err instanceof NotFoundError) {
      return [];
    }
    throw err;
  }
}

export function getCategoryBySlug(
  slug: ICategory["slug"]
): Promise<ICategory | null> {
  return pool.maybeOne<ICategory>(sql`
    SELECT ${allColumns}
    FROM categories
    WHERE slug = ${slug};
  `);
}

export function categoryIdExists(id: ICategory["id"]): Promise<boolean> {
  return pool.exists(sql`
    SELECT 1
    FROM categories
    WHERE id = ${id}
  `); // There's no ";" in this SQL because it's wrapped inside another query
}
