import { model, Schema } from 'mongoose';
import { ExileTypes } from '../types/userExile';

const ExileSchema: Schema = new Schema({
  RobloxUsername: { type: String },
  RobloxID: { type: Number },
});

export = model<ExileTypes>('PermExiles', ExileSchema);
