export enum UserRole {
  ADMINISTRATOR = 'Administrator',
  SITE_MANAGER = 'Site Manager',
  ACCOUNTANT = 'Accountant',
  LABOURER = 'Labourer',
}

export interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  contact?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  toJSON(): any;
}
