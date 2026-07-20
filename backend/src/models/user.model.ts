import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

/**
 * Roles per Volume 2, Section 15.6 (Authorization). Only "User" and
 * "Administrator" are implemented - "Future Analyst" and "Future Enterprise
 * Admin" are explicitly marked as future roadmap items in the source
 * document and are out of scope for this milestone.
 */
export const USER_ROLES = ['user', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'user',
      required: true
    }
  },
  { timestamps: true }
);

export type UserDocument = HydratedDocument<InferSchemaType<typeof userSchema>>;

export const UserModel = model('User', userSchema);
