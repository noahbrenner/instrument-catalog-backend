import { pool, sql } from "./src/db";

const help = `
Add or update seed data in the Instrument Catalog database.

Seed commands are idempotent. If a row to be inserted already exists, it is
updated with the values currently defined in this script. SERIAL PRIMARY KEYs
aren't hard coded, so a row is assumed to be a duplicate if the following
columns match exactly for the given table:

  TABLE         COLUMNS
  categories    slug
  users         id
  instruments   name, user_id

Usage:
  seed <command>

Commands:
  help          Show this message

  all           Seed categories, users, and instruments
  categories    Seed categories

  truncate      Empty all tables (errors if NODE_ENV=production)
  reset         Empty all tables and reseed (errors if NODE_ENV=production)
`;

interface ICategory {
  id: number;
  name: string;
  slug: string;
  summary: string;
  description: string;
}

interface IInstrument {
  id: number;
  categoryId: ICategory["id"];
  userId: string;
  name: string;
  summary: string;
  description: string;
  imageUrl: string;
}

export const userId1 = "seed.user|1";
export const userId2 = "seed.user|2";

export async function seedCategories(): Promise<void> {
  const categories: Omit<ICategory, "id">[] = [
    {
      name: "Strings",
      slug: "strings",
      summary: "Summary of Strings",
      description: "Long description of Strings",
    },
    {
      name: "Winds",
      slug: "winds",
      summary: "Summary of Winds",
      description: "Long description of Winds",
    },
  ];

  await pool.query(sql`
    INSERT INTO
      categories (name, slug, summary, description)
    SELECT *
    FROM ${sql.unnest(
      categories.map((c) => [c.name, c.slug, c.summary, c.description]),
      ["text", "text", "text", "text"]
    )}
    ON CONFLICT (slug)
    DO UPDATE SET
      name = EXCLUDED.name,
      summary = EXCLUDED.summary,
      description = EXCLUDED.description;
  `);
}

export async function seedUsers(): Promise<void> {
  await pool.query(sql`
    INSERT INTO
      users (id)
    VALUES
      (${userId1}),
      (${userId2})
    ON CONFLICT DO NOTHING;
  `);
}

export async function seedInstruments(): Promise<void> {
  const [stringsId, windsId] = await Promise.all(
    ["strings", "winds"].map((slug) =>
      pool.maybeOneFirst<number>(
        sql`SELECT id FROM categories WHERE slug = ${slug};`
      )
    )
  );

  if (stringsId === null || windsId === null) {
    throw new Error("You must seed categories before seeding instruments.");
  }

  const instruments: Omit<IInstrument, "id">[] = [
    {
      categoryId: windsId,
      userId: userId1,
      name: "Flute",
      summary: "Flute summary",
      description: "Flute description",
      imageUrl: "",
    },
    {
      categoryId: stringsId,
      userId: userId2,
      name: "Double Bass",
      summary: "Double Bass summary",
      description: "Double Bass description",
      imageUrl: "",
    },
  ];

  await pool.transaction(async (connection) => {
    // We can't use an ON CONFLICT clause for these upserts because there's no
    // unique constraint on `(user_id, name)` or its components, so we need to
    // manually query an instrument and then conditionally update or insert it.
    const upserts = instruments.map(
      async ({ categoryId, userId, name, summary, description, imageUrl }) => {
        const instrumentId = await connection.maybeOneFirst<number>(sql`
          SELECT id FROM instruments
          WHERE user_id = ${userId} AND name = ${name};
        `);

        if (instrumentId === null) {
          await connection.query(sql`
            INSERT INTO
              instruments (
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
            );
          `);
        } else {
          await connection.query(sql`
            UPDATE
              instruments
            SET
              category_id = ${categoryId},
              summary = ${summary},
              description = ${description},
              image_url = ${imageUrl}
            WHERE id = ${instrumentId};
          `);
        }
      }
    );
    await Promise.all(upserts);
  });
}

export async function seedAllTables(): Promise<void> {
  await Promise.all([seedCategories(), seedUsers()]);
  await seedInstruments();
}

export async function truncateAllTables(): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Don't truncate tables in production!");
  }
  await pool.query(
    sql`TRUNCATE TABLE categories, users, instruments RESTART IDENTITY;`
  );
}

export async function resetAllTables(): Promise<void> {
  await truncateAllTables();
  await seedAllTables();
}

async function main() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_node, _thisModule, ...args] = process.argv;
  if (args.length !== 1) {
    console.error("seed only accepts one argument\n");
    console.error(help);
    process.exit(1);
  }

  switch (args[0]) {
    case "all":
      return seedAllTables();
    case "categories":
      return seedCategories();
    case "truncate":
      return truncateAllTables();
    case "reset":
      return resetAllTables();
    case "help":
      return console.log(help);
    default:
      console.error(help);
      return process.exit(1);
  }
}

if (require.main === module) {
  main().catch((err: Error) => {
    console.error(err.stack);
    process.exit(1);
  });
}
