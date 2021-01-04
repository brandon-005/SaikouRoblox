import { Document } from 'mongoose';

export interface TokenTypes extends Document {
  RobloxToken: String;
}
