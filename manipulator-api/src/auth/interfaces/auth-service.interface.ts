import { Document } from 'mongoose';
interface User extends Record<string, any> {
  _id: string;
}

export interface AuthServiceInterface {
  validateUser(data: { identity: string; password: string }): Promise<User>;
  getAuthenticationUser(_id: string): Promise<Document>;
  checkUserExisted(identity: string): Promise<Document>;
}
