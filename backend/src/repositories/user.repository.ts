import { UserModel, type UserDocument, type UserRole } from '../models/user.model';

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
}

export const userRepository = {
  async findByEmail(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email: email.toLowerCase() }).select('+passwordHash').exec();
  },

  async findById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id).exec();
  },

  async create(input: CreateUserInput): Promise<UserDocument> {
    return UserModel.create({
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      role: input.role ?? 'user'
    });
  },

  async countAll(): Promise<number> {
    return UserModel.countDocuments().exec();
  }
};
