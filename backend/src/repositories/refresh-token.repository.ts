import { RefreshTokenModel, type RefreshTokenDocument } from '../models/refresh-token.model';

export interface CreateRefreshTokenInput {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export const refreshTokenRepository = {
  async create(input: CreateRefreshTokenInput): Promise<RefreshTokenDocument> {
    return RefreshTokenModel.create(input);
  },

  async findValidByHash(tokenHash: string): Promise<RefreshTokenDocument | null> {
    return RefreshTokenModel.findOne({
      tokenHash,
      revokedAt: null,
      expiresAt: { $gt: new Date() }
    }).exec();
  },

  async revokeByHash(tokenHash: string): Promise<void> {
    await RefreshTokenModel.updateOne({ tokenHash }, { revokedAt: new Date() }).exec();
  },

  async revokeAllForUser(userId: string): Promise<void> {
    await RefreshTokenModel.updateMany(
      { userId, revokedAt: null },
      { revokedAt: new Date() }
    ).exec();
  }
};
