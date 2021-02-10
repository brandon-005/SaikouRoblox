import { Document } from 'mongoose';

export interface BlacklistTypes extends Document {
  RobloxToken: String;
  Warnable: Boolean;
}
