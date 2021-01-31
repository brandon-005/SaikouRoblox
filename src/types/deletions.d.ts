import { Document } from 'mongoose';

export interface DeletionTypes extends Document {
  RobloxName: string;
  RobloxID: number;
  Triggers: number;
}
