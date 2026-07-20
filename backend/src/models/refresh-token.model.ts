import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

/**
 * Refresh tokens are never stored in plaintext (AUTH-04: "Refresh tokens
 * must be securely stored"). Only a SHA-256 hash of the token is kept,
 * so a database leak alone cannot be used to impersonate a session.
 * Storing them server-side (rather than trusting the JWT alone) is what
 * makes logout and revocation actually work - a purely stateless refresh
 * JWT cannot be invalidated before it expires.
 */
const refreshTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    revokedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// MongoDB TTL index: documents are automatically removed once expired.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type RefreshTokenDocument = HydratedDocument<InferSchemaType<typeof refreshTokenSchema>>;

export const RefreshTokenModel = model('RefreshToken', refreshTokenSchema);
