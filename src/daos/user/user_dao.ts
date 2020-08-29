/* eslint-disable -- We'll be replacing this functionality */
import { IUser } from "#entities/user";

export interface IUserDao {
  getOne: (email: string) => Promise<IUser | null>;
  getAll: () => Promise<IUser[]>;
  add: (user: IUser) => Promise<void>;
  update: (user: IUser) => Promise<void>;
  delete: (id: number) => Promise<void>;
}

export class UserDao implements IUserDao {
  public async getOne(email: string): Promise<IUser | null> {
    // TODO
    // @ts-expect-error
    return [];
  }

  public async getAll(): Promise<IUser[]> {
    // TODO
    return [];
  }

  public async add(user: IUser): Promise<void> {
    // TODO
  }

  public async update(user: IUser): Promise<void> {
    // TODO
  }

  public async delete(id: number): Promise<void> {
    // TODO
  }
}
