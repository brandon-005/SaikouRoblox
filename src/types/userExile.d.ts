import { Document } from 'mongoose';

export interface ExileTypes extends Document {
  Moderator: String;
  Reason: String;
  RobloxUsername: String;
  RobloxID: Number;
}
