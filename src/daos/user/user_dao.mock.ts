import { IUser } from "#entities/user";
import { getRandomInt } from "#shared/functions";
import { MockDaoMock } from "../mock_db/mock_dao.mock";
import { IUserDao } from "./user_dao";

export class UserDao extends MockDaoMock implements IUserDao {
  public async getOne(email: string): Promise<IUser | null> {
    try {
      const db = await super.openDb();
      for (const user of db.users) {
        if (user.email === email) {
          return user;
        }
      }
      return null;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  public async getAll(): Promise<IUser[]> {
    try {
      const db = await super.openDb();
      return db.users;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  public async add(user: IUser): Promise<void> {
    try {
      const db = await super.openDb();
      const newUser = { ...user, id: getRandomInt() };
      db.users.push(newUser);
      await super.saveDb(db);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  public async update(user: IUser): Promise<void> {
    try {
      const db = await super.openDb();
      const userIndex = db.users.findIndex(({ id }) => id === user.id);
      if (userIndex === -1) {
        throw new Error("User not found");
      }
      db.users[userIndex] = user;
      await super.saveDb(db);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  public async delete(userId: number): Promise<void> {
    try {
      const db = await super.openDb();
      const userIndex = db.users.findIndex(({ id }) => id === userId);
      if (userIndex >= 0) {
        await super.saveDb(db);
      }
      // Idempotent: No error if not found
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}
