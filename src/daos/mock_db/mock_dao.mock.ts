// Temporary: We'll be replacing this file with a real database
// eslint-disable-next-line import/no-extraneous-dependencies
import jsonfile from "jsonfile";

import type { IUser } from "#entities/user";

interface IDatabase {
  users: IUser[];
}

export class MockDaoMock {
  private readonly dbFilePath = "src/daos/mock_db/mock_db.json";

  protected openDb(): Promise<IDatabase> {
    return jsonfile.readFile(this.dbFilePath);
  }

  protected saveDb(db: IDatabase): Promise<void> {
    return jsonfile.writeFile(this.dbFilePath, db);
  }
}
