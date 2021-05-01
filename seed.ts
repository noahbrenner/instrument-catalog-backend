import { pool, sql } from "./src/db";

const help = `
Add or update seed data in the Instrument Catalog database.

Seed commands are idempotent. If a row to be inserted already exists, it is
updated with the values currently defined in this script. SERIAL PRIMARY KEYs
aren't hard coded, so a row is assumed to be a duplicate if the following
columns match exactly for the given table:

  TABLE       COLUMNS
  categories  slug

Usage:
  seed <command>

Commands:
  help          Show this message
  all           Seed categories, users, and instruments
  categories    Seed categories
`;

interface ICategory {
  id: number;
  name: string;
  slug: string;
  summary: string;
  description: string;
}

export function seedCategories(): ReturnType<typeof pool.query> {
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

  return pool.query(sql`
    INSERT INTO categories (name, slug, summary, description)
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

export async function seedAll(): Promise<void> {
  await seedCategories();
}

async function main() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_node, _thisModule, ...args] = process.argv;
  if (args.length !== 1) {
    console.error(help);
    process.exit(1);
  }

  switch (args[0]) {
    case "all":
      return seedAll();
    case "categories":
      return seedCategories();
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
