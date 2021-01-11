import { model, Schema } from 'mongoose';
import { ExileTypes } from '../types/userExile';

const ExileSchema: Schema = new Schema({
  Moderator: { type: String },
  Reason: { type: String },
  RobloxUsername: { type: String },
  RobloxID: { type: Number },
});

export = model<ExileTypes>('PermExiles', ExileSchema);
