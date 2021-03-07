import { Document } from 'mongoose';

export interface BannedTypes extends Document {
  RobloxUsername: string;
  RobloxID: number;
}
