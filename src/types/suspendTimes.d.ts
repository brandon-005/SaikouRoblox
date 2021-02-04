import { Document } from 'mongoose';

export interface TimeTypes extends Document {
  RobloxName: string;
  RobloxID: number;
  timestamp: Date;
  Role: string;
  Duration: number;
  Moderator: string;
  Reason: string;
}
