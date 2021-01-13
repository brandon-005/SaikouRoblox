import { model, Schema } from 'mongoose';
import { TokenTypes } from '../types/token';

const TokenSchema: Schema = new Schema({
  Test: { type: Boolean },
  RobloxToken: { type: String },
});

export = model<TokenTypes>('RobloxToken', TokenSchema);
