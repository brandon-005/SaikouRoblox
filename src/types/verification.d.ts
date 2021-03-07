import { Document } from 'mongoose';

export interface VerifyTypes extends Document {
  RobloxName: string;
  RobloxID: number;
  DiscordID: string;
  timestamp: Date;
  Role: string;
  Primary: boolean;
}
