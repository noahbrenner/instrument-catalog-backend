import jsonfile from "jsonfile";

import { IUser } from "../../entities/User";

interface IDatabase {
  users: IUser[];
}

export class MockDaoMock {
  private readonly dbFilePath = "src/daos/MockDb/MockDb.json";

  protected openDb(): Promise<IDatabase> {
    return jsonfile.readFile(this.dbFilePath);
  }

  protected saveDb(db: IDatabase): Promise<void> {
    return jsonfile.writeFile(this.dbFilePath, db);
  }
}
