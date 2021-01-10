import { Document } from 'mongoose';

export interface ExileTypes extends Document {
  RobloxUsername: String;
  RobloxID: Number;
}
