import { NotFoundError } from "slonik";

import { pool, sql } from ".";

// I prefer `interface` over `type`, but Slonik has a type bug preventing that:
// https://github.com/gajus/slonik/issues/268
/** The JSON object shape for instruments to be returned by our API */
type IInstrument = {
  id: number;
  categoryId: number;
  userId: string;
  name: string;
  summary: string;
  description: string;
  imageUrl: string;
};

/** A mapping of column names in the `instruments` table */
type DBInstrument = {
  id: IInstrument["id"];
  category_id: IInstrument["categoryId"]; // eslint-disable-line camelcase
  user_id: IInstrument["userId"]; // eslint-disable-line camelcase
  name: IInstrument["name"];
  summary: IInstrument["summary"];
  description: IInstrument["description"];
  image_url: IInstrument["imageUrl"]; // eslint-disable-line camelcase
};

const columnNames: Array<keyof DBInstrument> = [
  "id",
  "category_id",
  "user_id",
  "name",
  "summary",
  "description",
  "image_url",
];

const allColumns = sql.join(
  columnNames.map((col) => sql.identifier([col])),
  sql`,`
);

export function dbToJsonInstrument({
  id,
  category_id: categoryId,
  user_id: userId,
  name,
  summary,
  description,
  image_url: imageUrl,
}: DBInstrument): IInstrument {
  return { id, categoryId, userId, name, summary, description, imageUrl };
}

export async function getAllInstruments(): Promise<IInstrument[]> {
  try {
    return (
      await pool.many<DBInstrument>(sql`
        SELECT ${allColumns}
        FROM instruments
        ORDER BY name;
      `)
    ).map(dbToJsonInstrument);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return [];
    }
    throw err;
  }
}

export async function getInstrumentById(
  id: number
): Promise<IInstrument | null> {
  const instrument = await pool.maybeOne<DBInstrument>(sql`
    SELECT ${allColumns}
    FROM instruments
    WHERE id = ${id};
  `);
  if (instrument === null) {
    return null;
  }
  return dbToJsonInstrument(instrument);
}
