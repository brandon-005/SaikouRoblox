import { model, Schema } from 'mongoose';
import { VerifyTypes } from '../types/verification';

const verifySchema: Schema = new Schema({
  RobloxName: { type: String },
  RobloxID: { type: Number },
  DiscordID: { type: String },
  timestamp: { type: Date, default: new Date(0) },
  Role: { type: String },
  Primary: { type: Boolean },
});

export = model<VerifyTypes>('verifiedUsers', verifySchema);
